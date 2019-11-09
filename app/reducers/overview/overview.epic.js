// @flow
import log from 'electron-log'
import { tap, switchMap, mapTo } from 'rxjs/operators'
import { of, merge, observable } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { Action } from '../types'
import { OverviewActions } from './overview.reducer'
import { RpcService } from '~/service/rpc-service'
import { PriceChartService } from '~/service/price-chart-service'

const rpc = new RpcService()
const priceChart = new PriceChartService()

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

const getPriceChartEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.getPriceChart),
  switchMap(() => priceChart.getPriceChart()),
  switchMap((prices: observable) => {
    if (!Array.isArray(prices)) {
      log.error(`Can't get price chart`, prices)
      toastr.error(`Error getting price chart`)
      return of(OverviewActions.getPriceChartFailed())
    }

    return of(OverviewActions.gotPriceChart(prices))
  })
)

const getLatestPriceEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.getLatestPrice),
  switchMap(() => priceChart.getLatestPrice()),
  switchMap((price: observable) => {
    if (typeof price !== 'number') {
      log.error(`Can't get latest price`, price)
      toastr.error(`Error getting latest price`)
      return of(OverviewActions.getLatestPriceFailed())
    }

    return of(OverviewActions.gotLatestPrice(price))
  })
)

export const OverviewEpics = (action$, state$) => merge(
    getTransactionDataFromWalletEpic(action$, state$),
    getTransactionDataDromWalletFailureEpic(action$, state$),
    getPriceChartEpic(action$, state$),
    getLatestPriceEpic(action$, state$)
)
