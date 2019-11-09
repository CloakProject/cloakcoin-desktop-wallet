/* eslint-disable no-unused-vars */
// @flow
import { remote, ipcRenderer } from 'electron'
import config from 'electron-settings'
import { tap, mapTo, switchMap } from 'rxjs/operators'
import { of, merge, concat } from 'rxjs'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'
import get from 'lodash.get'

import { i18n, translate } from '~/i18next.config'
import { Action } from '../types'
import { OptionsActions } from './options.reducer'
import { SettingsActions } from '../settings/settings.reducer'
import { RoundedFormActions } from '../rounded-form/rounded-form.reducer'
import { ChildProcessService } from '~/service/child-process-service'
import { RpcService } from '~/service/rpc-service'

const t = translate('options')
const childProcess = new ChildProcessService()
const rpc = new RpcService()

const openOptionsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OptionsActions.openOptions),
  tap(() => {
		const mainWindow = remote.getCurrentWindow()
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show()
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
	}),
  mapTo(OptionsActions.empty())
)

const closeOptionsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(OptionsActions.closeOptions),
  switchMap(() => concat(
    of(RoundedFormActions.updateFields('mainOptions', {}, false)),
    of(RoundedFormActions.updateFields('networkOptions', {}, false)),
    of(RoundedFormActions.updateFields('windowOptions', {}, false)),
    of(RoundedFormActions.updateFields('displayOptions', {}, false)),
    of(RoundedFormActions.updateFields('enigmaCloakShieldOptions', {}, false)))
  )
)

const applyChangesEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(OptionsActions.applyChanges),
  switchMap(action => {
    const oldOptions = state$.value.options
    const newOptions = {}
    let needToRestartNode = false
    let needToRpcEnigma = false
    const additionalActions = []

    if (action.payload.isCloseOnSuccess) {
      additionalActions.push(of(OptionsActions.closeOptions()))
    }

    const mainOptions = get(state$.value.roundedForm, 'mainOptions.fields', null)
    if (mainOptions) {
      if (mainOptions.startupAtSystemLogin !== undefined && mainOptions.startupAtSystemLogin !== oldOptions.startupAtSystemLogin) {
        ipcRenderer.send('change-startup', mainOptions.startupAtSystemLogin)
        newOptions.startupAtSystemLogin = mainOptions.startupAtSystemLogin
      }
      if (mainOptions.detachDatabaseAtShutdown !== undefined && mainOptions.detachDatabaseAtShutdown !== oldOptions.detachDatabaseAtShutdown) {
        newOptions.detachDatabaseAtShutdown = mainOptions.detachDatabaseAtShutdown
      }
    }

    const windowOptions = get(state$.value.roundedForm, 'windowOptions.fields', null)
    if (windowOptions) {
      if (windowOptions.minimizeToTray !== undefined && windowOptions.minimizeToTray !== oldOptions.minimizeToTray) {
        newOptions.minimizeToTray = windowOptions.minimizeToTray
      }
      if (windowOptions.closeToTray !== undefined && windowOptions.closeToTray !== oldOptions.closeToTray) {
        newOptions.closeToTray = windowOptions.closeToTray
      }
    }

    const displayOptions = get(state$.value.roundedForm, 'displayOptions.fields', null)
    if (displayOptions) {
      if (displayOptions.language !== undefined && displayOptions.language !== oldOptions.language) {
        const language = displayOptions.language === 'default' ? 'en' : displayOptions.language
        i18n.changeLanguage(language)
        ipcRenderer.send('change-language', language)
        newOptions.language = displayOptions.language
      }
      if (displayOptions.amountUnit !== undefined && displayOptions.amountUnit !== oldOptions.amountUnit) {
        newOptions.amountUnit = displayOptions.amountUnit
      }
    }

    const newOptionsWithoutRestartNode = newOptions

    const networkOptions = get(state$.value.roundedForm, 'networkOptions.fields', null)
    if (networkOptions) {
      if (networkOptions.mapPortUsingUpnp !== undefined && networkOptions.mapPortUsingUpnp !== oldOptions.mapPortUsingUpnp) {
        newOptions.mapPortUsingUpnp = networkOptions.mapPortUsingUpnp
        needToRestartNode = true
      }
      if (networkOptions.connectThroughSocksProxy !== undefined && networkOptions.connectThroughSocksProxy !== oldOptions.connectThroughSocksProxy) {
        newOptions.connectThroughSocksProxy = networkOptions.connectThroughSocksProxy
        needToRestartNode = true
      }
      if (networkOptions.connectThroughSocksProxy) {
        if (networkOptions.proxyIp !== undefined && networkOptions.proxyIp !== oldOptions.proxyIp) {
          newOptions.proxyIp = networkOptions.proxyIp
          needToRestartNode = true
        }
        if (networkOptions.proxyPort !== undefined && networkOptions.proxyPort !== oldOptions.proxyPort) {
          newOptions.proxyPort = networkOptions.proxyPort
          needToRestartNode = true
        }
        if (networkOptions.socksVersion !== undefined && networkOptions.socksVersion !== oldOptions.socksVersion) {
          newOptions.socksVersion = networkOptions.socksVersion
          needToRestartNode = true
        }
      }
    }

    const enigmaCloakShieldOptions = get(state$.value.roundedForm, 'enigmaCloakShieldOptions.fields', null)
    if (enigmaCloakShieldOptions) {
      if (enigmaCloakShieldOptions.enigmaReserveBalance !== undefined && enigmaCloakShieldOptions.enigmaReserveBalance !== oldOptions.enigmaReserveBalance) {
        newOptions.enigmaReserveBalance = enigmaCloakShieldOptions.enigmaReserveBalance
        needToRpcEnigma = true
      }
      if (enigmaCloakShieldOptions.enigmaAutoRetry !== undefined && enigmaCloakShieldOptions.enigmaAutoRetry !== oldOptions.enigmaAutoRetry) {
        newOptions.enigmaAutoRetry = enigmaCloakShieldOptions.enigmaAutoRetry
        needToRpcEnigma = true
      }
      if (enigmaCloakShieldOptions.cloakShieldEnigmaTransactions !== undefined && enigmaCloakShieldOptions.cloakShieldEnigmaTransactions !== oldOptions.cloakShieldEnigmaTransactions) {
        newOptions.cloakShieldEnigmaTransactions = enigmaCloakShieldOptions.cloakShieldEnigmaTransactions
        needToRpcEnigma = true
      }
      if (enigmaCloakShieldOptions.cloakShieldNonEnigmaTransactions !== undefined && enigmaCloakShieldOptions.cloakShieldNonEnigmaTransactions !== oldOptions.cloakShieldNonEnigmaTransactions) {
        newOptions.cloakShieldNonEnigmaTransactions = enigmaCloakShieldOptions.cloakShieldNonEnigmaTransactions
        needToRpcEnigma = true
      }
      if (enigmaCloakShieldOptions.cloakShieldRoutes !== undefined && enigmaCloakShieldOptions.cloakShieldRoutes !== oldOptions.cloakShieldRoutes) {
        newOptions.cloakShieldRoutes = enigmaCloakShieldOptions.cloakShieldRoutes
        needToRpcEnigma = true
      }
      if (enigmaCloakShieldOptions.cloakShieldNodes !== undefined && enigmaCloakShieldOptions.cloakShieldNodes !== oldOptions.cloakShieldNodes) {
        newOptions.cloakShieldNodes = enigmaCloakShieldOptions.cloakShieldNodes
        needToRpcEnigma = true
      }
      if (enigmaCloakShieldOptions.cloakShieldHops !== undefined && enigmaCloakShieldOptions.cloakShieldHops !== oldOptions.cloakShieldHops) {
        newOptions.cloakShieldHops = enigmaCloakShieldOptions.cloakShieldHops
        needToRpcEnigma = true
      }
    }

    if (needToRestartNode) {
      config.set('newOptions', {...oldOptions, ...newOptions})
      
      const startLocalNodeObservable = childProcess.getStartObservable({
        processName: 'NODE',
        onSuccess: concat(of(OptionsActions.applyChangesSucceeded(newOptions, t('APPLIED OPTIONS'))), ...additionalActions),
        onFailure: concat(of(OptionsActions.applyChangesFailed(newOptionsWithoutRestartNode, t('ERROR APPLYING OPTIONS'))), ...additionalActions),
        action$
      })

      toastr.info(t(`Restarting the local node with the updated options...`))

      return concat(
        of(SettingsActions.restartLocalNode()),
        startLocalNodeObservable
      )
    }

    if (needToRpcEnigma) {
      const optionsToRpc = {...oldOptions, ...newOptions}

      const rpcEnigmaObservable = rpc.getRpcEnigmaObservable({
        onSuccess: concat(of(OptionsActions.applyChangesSucceeded(newOptions, t('APPLIED OPTIONS'))), ...additionalActions),
        onFailure: concat(of(OptionsActions.applyChangesFailed(newOptionsWithoutRestartNode, t('ERROR APPLYING OPTIONS'))), ...additionalActions),
        action$
      })

      return concat(
        of(SettingsActions.enableEnigma(state$.value.systemInfo.blockchainInfo.enigma,
          optionsToRpc.enigmaReserveBalance,
          optionsToRpc.enigmaAutoRetry,
          optionsToRpc.cloakShieldEnigmaTransactions,
          optionsToRpc.cloakShieldNonEnigmaTransactions,
          optionsToRpc.cloakShieldRoutes,
          optionsToRpc.cloakShieldNodes,
          optionsToRpc.cloakShieldHops)),
        rpcEnigmaObservable
      )
    }

    return concat(of(OptionsActions.applyChangesSucceeded(newOptions, t('APPLIED OPTIONS'))), ...additionalActions)
  })
)

const applyChangesSucceededEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OptionsActions.applyChangesSucceeded),
  tap((action) => {
    toastr.success(action.payload.successMessage)
	}),
  mapTo(OptionsActions.empty())
)

const applyChangesFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OptionsActions.applyChangesFailed),
  tap((action) => {
    toastr.error(action.payload.errorMessage)
	}),
  mapTo(OptionsActions.empty())
)

export const OptionsEpics = (action$, state$) => merge(
  openOptionsEpic(action$, state$),
  closeOptionsEpic(action$, state$),
  applyChangesEpic(action$, state$),
  applyChangesSucceededEpic(action$, state$),
  applyChangesFailedEpic(action$, state$)
)
