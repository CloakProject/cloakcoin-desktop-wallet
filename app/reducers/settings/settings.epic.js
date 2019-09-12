/* eslint-disable no-unused-vars */
// @flow
import log from 'electron-log'
import config from 'electron-settings'
import path from 'path'
import * as fs from 'fs'
import { promisify } from 'util'
import { remote, ipcRenderer, dialog } from 'electron'
import { tap, filter, delay, mergeMap, flatMap, switchMap, map, mapTo, catchError } from 'rxjs/operators'
import { of, from, bindCallback, concat, merge, defer } from 'rxjs'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { i18n, translate } from '~/i18next.config'
import { RPC } from '~/constants/rpc'
import { getEnsureLoginObservable } from '~/utils/auth'
import { Action } from '../types'
import { AuthActions } from '../auth/auth.reducer'
import { SettingsActions } from './settings.reducer'
import { RpcService } from '~/service/rpc-service'
import { ChildProcessService } from '~/service/child-process-service'
import { CloakService } from '~/service/cloak-service'

const t = translate('settings')
const rpc = new RpcService()
const cloakService = new CloakService()
const childProcess = new ChildProcessService()

const encryptWalletEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.encryptWallet),
  switchMap(() => {
    const { newPassword } = state$.value.roundedForm.settingsEncryptWallet.fields
    
    const startLocalNodeObservable = childProcess.getStartObservable({
      processName: 'NODE',
      onSuccess: of(SettingsActions.encryptWalletCompleted()),
      onFailure: of(SettingsActions.encryptWalletFailed()),
      action$
    })
    
    const observable = from(rpc.encryptWallet(newPassword)).pipe(
      switchMap(() => {
        toastr.info(t(`Restarting the local node with the ecrypted wallet...`))
        return concat(
          of(SettingsActions.restartLocalNode()),
          startLocalNodeObservable
        )
      }),
      catchError(err => {
        log.error(`Can't encrypt wallet`, err.message)
        toastr.error(t(`Error encryting wallet, check the log for details.`))
        return of(SettingsActions.encryptWalletCompleted())
      })
    )
    return observable
  })
)

const lockWalletEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.lockWallet),
  switchMap(() => {
    const observable = from(rpc.lockWallet()).pipe(
      switchMap(() => {
        toastr.success(t(`Wallet locked`))
        return of(SettingsActions.lockWalletCompleted())
      }),
      catchError(err => {
        log.error(`Can't lock wallet`, err.message)
        toastr.error(t(`Error locking wallet, check the log for details.`))
        return of(SettingsActions.lockWalletFailed())
      })
    )
    return observable
  })
)

const unlockWalletEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.unlockWallet),
  switchMap(() => {
    const { passphrase } = state$.value.roundedForm.settingsUnlockWallet.fields

    const observable = from(rpc.sendWalletPassword(passphrase, 9999999)).pipe(
      switchMap(() => {
        toastr.success(t(`Wallet unlocked`))
        return of(SettingsActions.unlockWalletCompleted())
      }),
      catchError(err => {
        let errorMessage

        if (err.code === RPC.WALLET_PASSPHRASE_INCORRECT) {
          errorMessage = t(`The wallet passphrase is incorrect.`)
        } else {
          log.error(`Can't unlock passphrase`, err.message)
          errorMessage = t(`Error unlocking the wallet, check the log for details.`)
        }
        toastr.error(errorMessage)
        return of(SettingsActions.unlockWalletFailed())
      })
    )
    return observable
  })
)

const changePassphraseEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.changePassphrase),
  switchMap(() => {
    const { oldPassphrase, newPassphrase } = state$.value.roundedForm.settingsChangePassphrase.fields
    const observable = from(rpc.changeWalletPassword(oldPassphrase, newPassphrase)).pipe(
      switchMap(() => {
        toastr.success(t(`Passphrase changed.`))
        return of(SettingsActions.changePassphraseCompleted())
      }),
      catchError(err => {
        let errorMessage

        if (err.code === RPC.WALLET_PASSPHRASE_INCORRECT) {
          errorMessage = t(`The old wallet passphrase is incorrect.`)
        } else {
          log.error(`Can't change passphrase`, err.message)
          errorMessage = t(`Error changing the passphrase, check the log for details.`)
        }
        toastr.error(errorMessage)
        return of(SettingsActions.changePassphraseFailed())
      })
    )
    return observable
  })
)

const updateLanguageEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.updateLanguage),
  map(action => {
    i18n.changeLanguage(action.payload.code)
    config.set('language', action.payload.code)
    ipcRenderer.send('change-language', action.payload.code)
    return SettingsActions.empty()
  })
)

const kickOffChildProcessesEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.kickOffChildProcesses),
  flatMap(() => {
		const settingsState = state$.value.settings
    let observables = of(SettingsActions.startLocalNode())
    
    return observables
  })
)

const toggleLocalNodeEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.toggleLocalNode),
  map(() => {
    const { childProcessesStatus } = state$.value.settings
		switch (childProcessesStatus.NODE) {
			case 'RUNNING':
			case 'MURDER FAILED':
				return SettingsActions.stopLocalNode()
			case 'NOT RUNNING':
			case 'FAILED':
				return SettingsActions.startLocalNode()
			default:
		}
    return SettingsActions.empty()
	})
)

const startLocalNodeEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.startLocalNode),
  map(() => {
		cloakService.start()
    return SettingsActions.empty()
  })
)

const restartLocalNodeEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.restartLocalNode),
	tap(() => {
		cloakService.restart()
	}),
  mapTo(SettingsActions.empty())
)

const stopLocalNodeEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.stopLocalNode),
	tap(() => { cloakService.stop() })
)

const initiateWalletBackupEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.initiateWalletBackup),
  mergeMap(() => {
    const title = t(`Backup resistance wallet to a file`)
    const params = {
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      nameFieldLabel: t(`File name:`),
      filters: [{ name: t(`Wallet files`),  extensions: ['dat'] }]
    }

    remote.dialog.showSaveDialog(null, params, (filePath) => {
      if (filePath) {
        rpc.backupWallet(filePath).pipe(
          switchMap(() => {
            toastr.success(t(`Wallet backup succeeded.`))
            return of(SettingsActions.empty())
          }),
          catchError(err => {
            toastr.error(t(`Unable to backup the wallet`), err.message)
            return of(SettingsActions.empty())
          }))
      } else {
        of(SettingsActions.empty())
      }
    });

    const reason = t(`We're going to backup the wallet`)
    return getEnsureLoginObservable(reason, null, action$)
  })
)

const backupWalletEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.backupWallet),
  mergeMap(action => {
    rpc.backupWallet(action.payload.filePath).pipe(
      switchMap(() => {
        toastr.success(t(`Wallet backup succeeded.`))
        return of(SettingsActions.empty())
      }),
      catchError(err => {
        toastr.error(t(`Unable to backup the wallet`), err.message)
        return of(SettingsActions.empty())
      })
  )})
)

const initiateWalletRestoreEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.initiateWalletRestore),
  mergeMap(() => {
    const showOpenDialogObservable = bindCallback(remote.dialog.showOpenDialog.bind(remote.dialog))

    const title = t(`Restore the wallet from a backup file`)
    const params = {
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      filters: [{ name: t(`Wallet files`),  extensions: ['dat'] }]
    }

    const observable = showOpenDialogObservable(params).pipe(
      switchMap(([ filePaths ]) => (
        filePaths && filePaths.length
          ? of(SettingsActions.restoreWallet(filePaths.pop()))
          : of(SettingsActions.empty())
      )))

    const reason = t(`We're going to restore the wallet`)
    return getEnsureLoginObservable(reason, observable, action$)
  })
)

const restoreWalletEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.restoreWallet),
  switchMap(action => {
    const walletFileName = path.basename(action.payload.filePath)
    const newWalletPath = path.join(cloakService.getWalletPath(), walletFileName)

    // Third, send the password for the new wallet
    const startLocalNodeObservable = childProcess.getStartObservable({
      processName: 'NODE',
      onSuccess: concat(
        of(AuthActions.ensureLogin(t(`Your restored wallet password is required`), true)),
        of(defer(() => toastr.success(t(`Wallet restored successfully.`)))),
      ),
      onFailure: of(SettingsActions.restoringWalletFailed()),
      action$
    })

    const copyPromise = promisify(fs.copyFile)(action.payload.filePath, newWalletPath)

    // Second, copy the backed up wallet to the export directory, update the config and restart the node
    const copyObservable = from(copyPromise).pipe(
      switchMap(() => {
        const walletName = path.basename(walletFileName, path.extname(walletFileName))
        config.set('wallet.name', walletName)
        return concat(
          of(defer(() => toastr.info(t(`Restarting the local node with the new wallet...`)))),
          of(SettingsActions.restartLocalNode()),
          startLocalNodeObservable
        )
      }),
      catchError(err => of(SettingsActions.restoringWalletFailed(err.message)))
    )

    // First, check if wallet file already exists
    const result = from(promisify(fs.access)(newWalletPath)).pipe(
      switchMap(() => {
        const errorMessage = t(`Wallet file "{{walletFileName}}" already exists.`, { walletFileName })
        return of(SettingsActions.restoringWalletFailed(errorMessage))
      }),
      catchError(() => copyObservable)
    )

    return result
  })
)

const restoringWalletFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.restoringWalletFailed),
  map(action => {
    toastr.error(t(`Failed to restore the wallet`), action.payload.errorMessage)
    return SettingsActions.empty()
  })
)

const childProcessFailedEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.childProcessFailed),
	tap((action) => {
    // At Get Started stage the message is suppressed or displayed within a hint at Welcome page
    if (state$.value.getStarted.isInProgress && action.payload.processName === 'NODE') {
      return
    }
    const errorMessage = t(`Process {{processName}} has failed.`, { processName: action.payload.processName })
    toastr.error(t(`Child process failure`), `${errorMessage}\n${action.payload.errorMessage}`)
  }),
	map((action) => {
    // if (action.payload.processName === 'NODE') {
    //     return SettingsActions.disableMiner()
    // }

    return SettingsActions.empty()
  })
)

const childProcessMurderFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.childProcessMurderFailed),
	tap((action) => {
    const errorMessage = t(`Failed to stop {{processName}}.`, {processName: action.payload.processName})
    toastr.error(t(`Stop child process error`), `${errorMessage}\n${action.payload.errorMessage}`)
  }),
  mapTo(SettingsActions.empty())
)

export const SettingsEpics = (action$, state$) => merge(
  updateLanguageEpic(action$, state$),
	kickOffChildProcessesEpic(action$, state$),
  toggleLocalNodeEpic(action$, state$),
	startLocalNodeEpic(action$, state$),
  restartLocalNodeEpic(action$, state$),
  stopLocalNodeEpic(action$, state$),
  encryptWalletEpic(action$, state$),
  lockWalletEpic(action$, state$),
  unlockWalletEpic(action$, state$),
  changePassphraseEpic(action$, state$),
  initiateWalletBackupEpic(action$, state$),
  initiateWalletRestoreEpic(action$, state$),
  backupWalletEpic(action$, state$),
  restoreWalletEpic(action$, state$),
  restoringWalletFailedEpic(action$, state$),
	childProcessFailedEpic(action$, state$),
	childProcessMurderFailedEpic(action$, state$)
)
