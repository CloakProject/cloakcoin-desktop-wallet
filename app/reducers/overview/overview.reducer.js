// @flow
import { Decimal } from 'decimal.js'
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type Transaction = {
	type?: string,
	category?: string,
	confirmations?: number,
	amount?: Decimal,
	timestamp?: number,
	destinationAddress?: string,
	isStealthAddress?: boolean,
	transactionId?: string
}

export type BalancesInfo = {
	balance?: Decimal,
	balanceChangesIn7Days?: Decimal,
	reward?: Decimal,
	rewardEstimation: number,
	value?: Decimal,
	valueChangesIn7Days: Decimal
}

export type Price = {
	time: number,
	price: Decimal
}

export type OverviewState = {
	transactions?: Array<Transaction>,
	prices?: Array<Price>,
	price?: number | null
}

export const OverviewActions = createActions(
	{
		EMPTY: undefined,

    GET_TRANSACTION_DATA_FROM_WALLET: undefined,
		GOT_TRANSACTION_DATA_FROM_WALLET: (transactions: Array<Transaction>) => transactions,
		GET_TRANSACTION_DATA_FROM_WALLET_FAILURE: (errorMessage: string) => ({ errorMessage }),

		MAIN_WINDOW_CLOSE: undefined,
		MAIN_WINDOW_MINIMIZE: undefined,
		MAIN_WINDOW_MAXIMIZE: undefined,

		GET_PRICE_CHART: undefined,
		GOT_PRICE_CHART: (prices: Array<Price>) => prices,
		GET_PRICE_CHART_FAILED: undefined,

		GET_LATEST_PRICE: undefined,
		GOT_LATEST_PRICE: (price: number) => price,
		GET_LATEST_PRICE_FAILED: undefined,
	},
	{
		prefix: 'APP/OVERVIEW'
	}
)

export const OverviewReducer = handleActions({
  [OverviewActions.gotTransactionDataFromWallet]: (state, action) => ({
    ...state,
    transactions: action.payload
  }),

  [OverviewActions.gotPriceChart]: (state, action) => ({
    ...state,
    prices: action.payload
  }),

  [OverviewActions.getPriceChartFailed]: state => ({
    ...state,
    prices: []
	}),

	[OverviewActions.gotLatestPrice]: (state, action) => ({
    ...state,
    price: action.payload
  }),

  [OverviewActions.getLatestPriceFailed]: state => ({
    ...state,
    price: null
	}),
}, preloadedState)
