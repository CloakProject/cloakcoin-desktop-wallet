// @flow
import { Decimal } from 'decimal.js'
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'
import { SystemInfoActions } from '../system-info/system-info.reducer'

export type AddressRow = {
	address: string,
  cloaking: boolean
}

export type OwnAddressesState = {
  addresses?: AddressRow[],
  latestNewAdddress?: AddressRow
}

export const OwnAddressesActions = createActions(
  {
    EMPTY: undefined,

    GET_OWN_ADDRESSES: undefined,
    GOT_OWN_ADDRESSES: (addresses: AddressRow[]) => ({ addresses }),
    GET_OWN_ADDRESSES_FAILURE:  (errorMessage: string) => ({ errorMessage }),

    CREATE_ADDRESS: (isStealth: boolean) => ({ isStealth }),
    CREATED_OWN_ADDRESS: (newAddress: AddressRow) => ({ newAddress }),
    CREATE_OWN_ADDRESS_FAILURE:  (errorMessage: string) => ({ errorMessage }),
  },
  {
    prefix: 'APP/OWN_ADDRESSES'
  }
)

export const OwnAddressesReducer = handleActions(
  {
    [OwnAddressesActions.gotOwnAddresses]: (state, action) => ({
      ...state, addresses: action.payload.addresses
    }),
    [OwnAddressesActions.getOwnAddressesFailure]: state => ({
      ...state, addresses: []
    }),
    [OwnAddressesActions.createdOwnAddress]: (state, action) => ({
      ...state, latestNewAdddress: action.payload.newAddress
    }),
    [OwnAddressesActions.createOwnAddressFailure]: state => ({
      ...state, latestNewAdddress: null
    }),
  }, preloadedState)
