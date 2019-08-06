// @flow
import log from 'electron-log'
import * as fs from 'fs'
import { promisify } from 'util'
import path from 'path'
import config from 'electron-settings'
import { of, concat, from, merge, defer } from 'rxjs'
import { filter, switchMap, take, map, mergeMap, catchError } from 'rxjs/operators'
import { remote, ipcRenderer } from 'electron'
import { ofType } from 'redux-observable'
import { push } from 'react-router-redux'

import { Action } from '../types'
import { translate } from '~/i18next.config'
import { RPC } from '~/constants/rpc'
import { AUTH } from '~/constants/auth'
import { verifyDirectoryExistence } from '~/utils/os'
import { ChildProcessService } from '~/service/child-process-service'
import { CloakService } from '~/service/cloak-service'
import { RpcService } from '~/service/rpc-service'
import { Bip39Service } from '~/service/bip39-service'
import { AuthActions } from '../auth/auth.reducer'
import { GetStartedActions } from './get-started.reducer'
import { RoundedFormActions } from '../rounded-form/rounded-form.reducer'
import { SettingsActions } from '../settings/settings.reducer'


const t = translate('get-started')
const bip39 = new Bip39Service()
const rpc = new RpcService()
const cloak = new CloakService()
const childProcess = new ChildProcessService()


const WelcomeActions = GetStartedActions.welcome
const unableToStartLocalNodeMessage = t(`Unable to start Cloak local node`)


const chooseLanguageEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(GetStartedActions.chooseLanguage),
  mergeMap(action => of(
    SettingsActions.updateLanguage(action.payload.code),
    push('/get-started/get-started')
  ))
)

const generateWalletEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(GetStartedActions.createNewWallet.generateWallet),
  switchMap(() => {
    const nodeConfig = remote.getGlobal('cloakNodeConfig')
    return of(bip39.generateWallet(Boolean(nodeConfig.testnet)))
  }),
	map(result => GetStartedActions.createNewWallet.gotGeneratedWallet(result))
)

/*
 * Main use case actions sequences.
 *
 * Create new wallet:
 *   applyConfiguration → encryptWallet → authenticate → walletBootstrappingSucceeded
 *
 * Restore from backup (encrypted):
 *   applyConfiguration → restoreWallet → authenticate → changePassword → walletBootstrappingSucceeded
 *
 * Restore from backup (unencrypted):
 *   applyConfiguration → restoreWallet → encryptWallet → authenticate → changePassword → walletBootstrappingSucceeded
 *
 */

const applyConfigurationEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(WelcomeActions.applyConfiguration),
  switchMap(() => {
    const state = state$.value

    let form
    if (state.getStarted.isCreatingNewWallet) {
      form = state.roundedForm.getStartedCreateNewWallet
    } else {
      form = state.roundedForm.getStartedRestoreYourWallet
    }

    config.set('wallet', {
      name: form.fields.walletName,
      path: form.fields.walletPath
    })

    if (!state.getStarted.isCreatingNewWallet) {
      return of(WelcomeActions.restoreWallet())
    }

    const nodeStartedObservable = childProcess.getObservable({
      processName: 'NODE',
      onSuccess: of(WelcomeActions.encryptWallet()),
      onFailure: of(WelcomeActions.walletBootstrappingFailed(unableToStartLocalNodeMessage)),
      action$
    })

    return concat(
      of(WelcomeActions.displayHint(t(`Starting the local node...`))),
      of(SettingsActions.startLocalNode()),
      nodeStartedObservable
    )
  })
)

const restoreWalletEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(WelcomeActions.restoreWallet),
  switchMap(() => {
    const restoreForm = state$.value.roundedForm.getStartedRestoreYourWallet
    const choosePasswordForm = state$.value.roundedForm.getStartedChoosePassword
    const oldPassword = restoreForm.fields.password || ''

    // 2. Changing the node password to the new one
    const changePasswordObservable = defer(() => from(rpc.changeWalletPassword(oldPassword, choosePasswordForm.fields.password))).pipe(
      switchMap(() => of(WelcomeActions.authenticate())),
      catchError(err => {
        let errorMessage

        if (err.code === RPC.WALLET_WRONG_ENC_STATE) {
          return of(WelcomeActions.encryptWallet())
        }

        if (err.code === RPC.WALLET_PASSPHRASE_INCORRECT) {
          errorMessage = t(`Invalid backup wallet password, please go back and change it.`)
        } else {
          log.error(`Error changing backup wallet password`, err)
          errorMessage = t(`Can't change the backup wallet password, check the application log for details.`)
        }

        return of(WelcomeActions.walletBootstrappingFailed(errorMessage))
      })
    )

    const nodeStartedObservable = childProcess.getObservable({
      processName: 'NODE',
      onSuccess: concat(
        of(WelcomeActions.displayHint(t(`Changing the wallet password...`))),
        changePasswordObservable,
      ),
      onFailure: of(WelcomeActions.walletBootstrappingFailed(unableToStartLocalNodeMessage)),
      action$
    })

    // 1. Copying the user wallet to Cloak data folder
    const newWalletPath = path.join(cloak.getWalletPath(), `${restoreForm.fields.walletName}.dat`)


    const copyPromise = verifyDirectoryExistence(cloak.getWalletPath()).then(() => (
      promisify(fs.copyFile)(restoreForm.fields.backupFile, newWalletPath)
    ))

    const copyObservable = from(copyPromise).pipe(
      switchMap(() => concat(
        of(WelcomeActions.displayHint(t(`Starting the local node...`))),
        of(SettingsActions.kickOffChildProcesses()),
        nodeStartedObservable
      )),
      catchError(err => of(WelcomeActions.walletBootstrappingFailed(err.message)))
    )

    return copyObservable
  })
)

const encryptWalletEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(WelcomeActions.encryptWallet),
  switchMap(() => {
    const choosePasswordForm = state$.value.roundedForm.getStartedChoosePassword

    // Wallet encryption shuts the node down, let's start it back up and trigger the next action
    const nodeStartedObservable = childProcess.getObservable({
      processName: 'NODE',
      onSuccess: of(WelcomeActions.authenticate()),
      onFailure: of(WelcomeActions.walletBootstrappingFailed(unableToStartLocalNodeMessage)),
      action$
    })

    const nodeShutDownObservable = action$.pipe(
      ofType(SettingsActions.childProcessFailed),
      filter(action => action.payload.processName === 'NODE'),
      take(1),
      switchMap(() => concat(
        of(WelcomeActions.displayHint(t(`Starting the local node with the encrypted wallet...`))),
        of(SettingsActions.kickOffChildProcesses()),
        nodeStartedObservable
      ))
    )

    const observable = from(rpc.encryptWallet(choosePasswordForm.fields.password)).pipe(
      switchMap(() => nodeShutDownObservable),
      catchError(err => of(WelcomeActions.walletBootstrappingFailed(err.toString())))
    )

    return concat(of(WelcomeActions.displayHint(t(`Encrypting the wallet...`))), observable)
  })
)

const authenticateEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(WelcomeActions.authenticate),
  switchMap(() => {
    const choosePasswordForm = state$.value.roundedForm.getStartedChoosePassword

    const nextObservables = [
      of(AuthActions.loginSucceeded()),
      of(WelcomeActions.walletBootstrappingSucceeded())
    ]

    const sendWalletObservable = from(rpc.sendWalletPassword(choosePasswordForm.fields.password, AUTH.sessionTimeoutSeconds)).pipe(
      mergeMap(() => concat(...nextObservables)),
      catchError(err => {
        log.error(`Error sending wallet password`, err)
        const errorMessage = t(`Error setting the wallet password, check the application log for details.`)
        return WelcomeActions.walletBootstrappingFailed(errorMessage)
    }))

    return concat(
      of(WelcomeActions.displayHint(t(`Sending the wallet password to the node...`))),
      sendWalletObservable
    )
  })
)

const walletBootstrappingSucceededEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(WelcomeActions.walletBootstrappingSucceeded),
  map(() => {
    config.set('getStartedInProgress', false)
    // Don't store the password in the state
    return RoundedFormActions.clear('getStartedChoosePassword')
  })
)

const useCloakEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(WelcomeActions.useCloak),
  map(() => {
    ipcRenderer.send('resize')
    return push('/overview')
  })
)

export const GetStartedEpic = (action$, state$) => merge(
	chooseLanguageEpic(action$, state$),
	generateWalletEpic(action$, state$),
	applyConfigurationEpic(action$, state$),
  encryptWalletEpic(action$, state$),
  restoreWalletEpic(action$, state$),
  authenticateEpic(action$, state$),
  walletBootstrappingSucceededEpic(action$, state$),
  useCloakEpic(action$, state$)
)
