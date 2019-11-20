// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type AddressRow = {
	address: string,
  cloaking: boolean
}

export type OwnAddressesState = {
  addresses?: AddressRow[]
}

export const OwnAddressesActions = createActions(
  {
    EMPTY: undefined,

    GET_OWN_ADDRESSES: undefined,
    GOT_OWN_ADDRESSES: (addresses: AddressRow[]) => ({ addresses }),
    GET_OWN_ADDRESSES_FAILURE:  (errorMessage: string) => ({ errorMessage }),

    CREATE_ADDRESS: (isStealth: boolean) => ({ isStealth }),
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
  }, preloadedState)
