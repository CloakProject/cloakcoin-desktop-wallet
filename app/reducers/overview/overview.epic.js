// @flow
import log from 'electron-log'
import { tap, map, switchMap, mapTo } from 'rxjs/operators'
import { of, concat, merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'
import { routerActions } from 'react-router-redux'

import { Action } from '../types'
import { OverviewActions } from './overview.reducer'
import { RpcService } from '~/service/rpc-service'

const rpc = new RpcService()

const getWalletInfoEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.getWalletInfo),
  tap(() => rpc.requestWalletInfo()),
  map(() => OverviewActions.empty())
)

const getWalletInfoFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.getWalletInfoFailure),
  tap((action) => toastr.error(action.payload.errorMessage)),
  mapTo(OverviewActions.empty())
)

const getTransactionDataFromWalletEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.getTransactionDataFromWallet),
  tap(() => rpc.requestTransactionsDataFromWallet()),
  mapTo(OverviewActions.empty())
)

const getTransactionDataDromWalletFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.getTransactionDataFromWalletFailure),
  tap((action) => toastr.error(action.payload.errorMessage)),
  mapTo(OverviewActions.empty())
)

const getTransactionDetailsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.getTransactionDetails),
  switchMap(action => rpc.getTransactionDetails(action.payload.transactionId)),
  switchMap(transactionDetails => {
    if (typeof transactionDetails !== 'object') {
      log.error(`Can't get transaction details`, transactionDetails)
      toastr.error(`Error getting transaction details`)
      return of(OverviewActions.getTransactionDetailsFailed())
    }

    log.debug(`Got transaction details`, transactionDetails)
    return concat(
      of(OverviewActions.gotTransactionDetails(transactionDetails)),
      of(routerActions.push('/overview/transaction-details'))
    )
  })
)

export const OverviewEpics = (action$, state$) => merge(
    getWalletInfoEpic(action$, state$),
    getWalletInfoFailureEpic(action$, state$),
    getTransactionDataFromWalletEpic(action$, state$),
    getTransactionDataDromWalletFailureEpic(action$, state$),
    getTransactionDetailsEpic(action$, state$)
)
