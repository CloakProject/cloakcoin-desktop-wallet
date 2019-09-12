// @flow
import { shell } from 'electron'
import { tap, mapTo } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { Action } from '../types'
import { RPC } from '~/constants/rpc'
import { getInstallationPath } from '~/utils/os'
import { SystemInfoActions } from './system-info.reducer'
import { RpcService } from '~/service/rpc-service'
import { CloakService } from '~/service/cloak-service'

const rpcService = new RpcService()
const cloakService = new CloakService()

function suppressRpcWarmupError(action, callable) {
  if (action.payload.code !== RPC.IN_WARMUP && action.payload.code !== 'ECONNREFUSED') {
    callable()
  } else {
    console.log(`Suppressing RPC initialization error display:`, action.payload)
  }
}

const getDaemonInfoEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.getDaemonInfo.toString()),
  tap(() => rpcService.requestDaemonInfo()),
  mapTo(SystemInfoActions.empty())
)

const getDaemonInfoFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.getDaemonInfoFailure.toString()),
  tap((action) => {
    suppressRpcWarmupError(action, () => toastr.error(action.payload.errorMessage))
  }),
  mapTo(SystemInfoActions.empty())
)

const getBlockchainInfoEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.getBlockchainInfo.toString()),
  tap(() => rpcService.requestBlockchainInfo()),
  mapTo(SystemInfoActions.empty())
)

const getBlockchainInfoFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.getBlockchainInfoFailure.toString()),
  tap((action) => {
    suppressRpcWarmupError(action, () => toastr.error(action.payload.errorMessage))
  }),
  mapTo(SystemInfoActions.empty())
)

const openWalletInFileManagerEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.openWalletInFileManager.toString()),
  tap(() => {
    shell.openItem(cloakService.getWalletPath())
  }),
  mapTo(SystemInfoActions.empty())
)

const openInstallationFolderEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.openInstallationFolder.toString()),
  tap(() => {
    shell.openItem(getInstallationPath())
  }),
  mapTo(SystemInfoActions.empty())
)

export const SystemInfoEpics = (action$, state$) => merge(
  openWalletInFileManagerEpic(action$, state$),
  openInstallationFolderEpic(action$, state$),
  getDaemonInfoEpic(action$, state$),
  getDaemonInfoFailureEpic(action$, state$),
  getBlockchainInfoEpic(action$, state$),
  getBlockchainInfoFailureEpic(action$, state$),
)
