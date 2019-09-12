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
	transactionId?: string
}

export type Balances = {
	balance?: Decimal,
	unconfirmedBalance?: Decimal
}

export type OverviewState = {
	balances?: Balances,
	transactions?: Array<Transaction>,
	transactionDetails: object
}

export const OverviewActions = createActions(
	{
		EMPTY: undefined,

		GET_WALLET_INFO: undefined,
		GOT_WALLET_INFO: (balances: Balances) => balances,
		GET_WALLET_INFO_FAILURE: (errorMessage: string) => ({ errorMessage }),

    GET_TRANSACTION_DATA_FROM_WALLET: undefined,
		GOT_TRANSACTION_DATA_FROM_WALLET: (transactions: Array<Transaction>) => transactions,
		GET_TRANSACTION_DATA_FROM_WALLET_FAILURE: (errorMessage: string) => ({ errorMessage }),

		MAIN_WINDOW_CLOSE: undefined,
		MAIN_WINDOW_MINIMIZE: undefined,
		MAIN_WINDOW_MAXIMIZE: undefined,

    GET_TRANSACTION_DETAILS: (transactionId: string) => ({ transactionId }),
		GOT_TRANSACTION_DETAILS: (transactionDetails: object) => ({ transactionDetails }),
		GET_TRANSACTION_DETAILS_FAILED: undefined,
	},
	{
		prefix: 'APP/OVERVIEW'
	}
)

export const OverviewReducer = handleActions({
  [OverviewActions.gotWalletInfo]: (state, action) => ({
    ...state,
    balances: action.payload
	}),

  [OverviewActions.gotTransactionDataFromWallet]: (state, action) => ({
    ...state,
    transactions: action.payload
  }),

  [OverviewActions.gotTransactionDetails]: (state, action) => ({
    ...state,
    transactionDetails: action.payload.transactionDetails
  }),

  [OverviewActions.getTransactionDetailsFailed]: state => ({
    ...state,
    transactionDetails: {}
  }),
}, preloadedState)
