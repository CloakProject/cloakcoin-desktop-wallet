// @flow
import { remote } from 'electron'
import { tap, map, mapTo, mergeMap, switchMap, catchError } from 'rxjs/operators'
import { of, bindCallback, merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { i18n } from '~/i18next.config'
import { getEnsureLoginObservable } from '~/utils/auth'
import { SystemInfoActions } from '../system-info/system-info.reducer'
import { OwnAddressesActions } from './own-addresses.reducer'
import { Action } from '../types'
import { RpcService } from '~/service/rpc-service'

const t = i18n.getFixedT(null, 'own-addresses')
const rpc = new RpcService()

const getOwnAddressesEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.getOwnAddresses),
  tap(() => { rpc.requestOwnAddresses() }),
  mapTo(OwnAddressesActions.empty())
)

const createAddressEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.createAddress),
  switchMap(action => rpc.createNewAddress(action.payload.isEnigma)),
  map(result => result ? OwnAddressesActions.getOwnAddresses() : OwnAddressesActions.empty())
)

const initiatePrivateKeysExportEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(OwnAddressesActions.initiatePrivateKeysExport),
  mergeMap(() => {
    const showSaveDialogObservable = bindCallback(remote.dialog.showSaveDialog.bind(remote.dialog))

    const title = t(`Export Cloak addresses private keys to a file`)
    const params = {
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      nameFieldLabel: t(`File name:`),
      filters: [{ name: t(`Keys files`),  extensions: ['keys'] }]
    }

    const observable = showSaveDialogObservable(params).pipe(
      switchMap(([ filePath ]) => (
        filePath
          ? of(OwnAddressesActions.exportPrivateKeys(filePath))
          : of(OwnAddressesActions.empty())
      )))

    return getEnsureLoginObservable(null, observable, action$)
  })
)

const exportPrivateKeysEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(OwnAddressesActions.exportPrivateKeys),
  mergeMap(action => (
    rpc.exportPrivateKeys(action.payload.filePath).pipe(
      switchMap(() => {
        toastr.success(t(`Private keys exported successfully`))
        return of(OwnAddressesActions.empty())
      }),
      catchError(err => {
        toastr.error(t(`Unable to export private keys`), err.message)
        return of(OwnAddressesActions.empty())
      })
  )))
)

const initiatePrivateKeysImportEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(OwnAddressesActions.initiatePrivateKeysImport),
  mergeMap(() => {
    const showOpenDialogObservable = bindCallback(remote.dialog.showOpenDialog.bind(remote.dialog))

    const title = t(`Import Cloak addresses from private keys file`)
    const params = {
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      filters: [{ name: t(`Keys files`),  extensions: ['keys'] }]
    }

    const observable = showOpenDialogObservable(params).pipe(
      switchMap(([ filePaths ]) => (
        filePaths && filePaths.length
          ? of(OwnAddressesActions.importPrivateKeys(filePaths.pop()))
          : of(OwnAddressesActions.empty())
      )))

    return getEnsureLoginObservable(null, observable, action$)
  })
)

const importPrivateKeysEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(OwnAddressesActions.importPrivateKeys),
  mergeMap(action => (
    rpc.importPrivateKeys(action.payload.filePath).pipe(
      switchMap(() => {
        toastr.success(
          t(`Private keys imported successfully`),
          t(`It may take several minutes to rescan the block chain for transactions affecting the newly-added keys.`)
        )
        return of(OwnAddressesActions.empty())
      }),
      catchError(err => {
        toastr.error(t(`Unable to import private keys`), err.message)
        return of(OwnAddressesActions.empty())
      })
  )))
)


const mergeAllMinedCoinsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllMinedCoins),
  tap(action => {
    rpc.mergeAllMinedCoins(action.payload.zAddress)
  }),
  mapTo(SystemInfoActions.newOperationTriggered())
)

const mergeAllRAddressCoinsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllRAddressCoins),
  tap(action => {
    rpc.mergeAllRAddressCoins(action.payload.zAddress)
  }),
  mapTo(SystemInfoActions.newOperationTriggered())
)

const mergeAllZAddressCoinsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllZAddressCoins),
  tap(action => {
    rpc.mergeAllZAddressCoins(action.payload.zAddress)
  }),
  mapTo(SystemInfoActions.newOperationTriggered())
)

const mergeAllCoinsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllCoins),
  tap(action => {
    rpc.mergeAllCoins(action.payload.zAddress)
  }),
  mapTo(SystemInfoActions.newOperationTriggered())
)

const mergeCoinsOperationStartedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeCoinsOperationStarted),
  tap(() => {
    toastr.info(t(`Merging operation started, addresses will be frozen until done.`))
  }),
  mapTo(SystemInfoActions.getOperations())
)

const mergeCoinsFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeCoinsFailure),
  tap((action) => {
    toastr.error(t(`Unable to start merge operation`), action.payload.errorMessage)
  }),
  mapTo(SystemInfoActions.empty())
)

export const OwnAddressesEpics = (action$, state$) => merge(
  getOwnAddressesEpic(action$, state$),
  createAddressEpic(action$, state$),
	initiatePrivateKeysExportEpic(action$, state$),
	exportPrivateKeysEpic(action$, state$),
  initiatePrivateKeysImportEpic(action$, state$),
	importPrivateKeysEpic(action$, state$),
  mergeAllMinedCoinsEpic(action$, state$),
  mergeAllRAddressCoinsEpic(action$, state$),
  mergeAllZAddressCoinsEpic(action$, state$),
  mergeAllCoinsEpic(action$, state$),
  mergeCoinsOperationStartedEpic(action$, state$),
  mergeCoinsFailureEpic(action$, state$)
)
