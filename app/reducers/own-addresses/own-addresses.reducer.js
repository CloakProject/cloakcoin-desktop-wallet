// @flow
import { Decimal } from 'decimal.js'
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'
import { SystemInfoActions } from '../system-info/system-info.reducer'

export type AddressRow = {
	balance: Decimal | null,
	confirmed: boolean,
	address: string,
  isUnspent: boolean
}

export type OwnAddressesState = {
	addresses?: AddressRow[],
  showDropdownMenu?: boolean,
  frozenAddresses: { [string]: Decimal }
}

export const OwnAddressesActions = createActions(
  {
    EMPTY: undefined,

    GET_OWN_ADDRESSES: undefined,
    GOT_OWN_ADDRESSES: (addresses: AddressRow[]) => ({ addresses }),
    GET_OWN_ADDRESSES_FAILURE:  (errorMessage: string) => ({ errorMessage }),

    CREATE_ADDRESS: (isEnigma: boolean) => ({ isEnigma }),
    INITIATE_PRIVATE_KEYS_EXPORT: undefined,
    EXPORT_PRIVATE_KEYS: filePath => ({filePath}),
    INITIATE_PRIVATE_KEYS_IMPORT: undefined,
    IMPORT_PRIVATE_KEYS: filePath => ({filePath}),

    MERGE_ALL_MINED_COINS: (zAddress: string) => ({ zAddress }),
    MERGE_ALL_R_ADDRESS_COINS: (zAddress: string) => ({ zAddress }),
    MERGE_ALL_Z_ADDRESS_COINS: (zAddress: string) => ({ zAddress }),
    MERGE_ALL_COINS: (zAddress: string) => ({ zAddress }),

    MERGE_COINS_OPERATION_STARTED: (operationId: string) => ({ operationId }),
    MERGE_COINS_FAILURE: errorMessage => ({ errorMessage })
  },
  {
    prefix: 'APP/OWN_ADDRESSES'
  }
)

function getFrozenAddresses(state, action, rule: (address: AddressRow) => boolean) {
  return state.addresses.reduce((accumulator, address) => {
    const frozenAddresses = {...accumulator}

    if (rule(address) || address.address === action.payload.zAddress) {
      // Save initial balance for it to stay during the 'merge' operation
      frozenAddresses[address.address] = address.balance
    }
    return frozenAddresses
  }, {})
}

export const OwnAddressesReducer = handleActions(
  {
    [OwnAddressesActions.gotOwnAddresses]: (state, action) => ({
      ...state, addresses: action.payload.addresses
    }),
    [OwnAddressesActions.getOwnAddressesFailure]: state => ({
      ...state, addresses: []
    }),
    [OwnAddressesActions.mergeAllMinedCoins]: (state, action) => ({
      ...state,
      frozenAddresses: getFrozenAddresses(state, action, (address) => address.isUnspent)
    }),
    [OwnAddressesActions.mergeAllRAddressCoins]: (state, action) => ({
      ...state,
      frozenAddresses: getFrozenAddresses(state, action, (address) => address.address.startsWith('r'))
    }),
    [OwnAddressesActions.mergeAllZAddressCoins]: (state, action) => ({
      ...state,
      frozenAddresses: getFrozenAddresses(state, action, (address) => address.address.startsWith('z'))
    }),
    [OwnAddressesActions.mergeAllCoins]: (state, action) => ({
      ...state, frozenAddresses: getFrozenAddresses(state, action, () => true)
    }),
    [OwnAddressesActions.mergeCoinsFailure]: state => ({
      ...state, frozenAddresses: {}
    }),
    [SystemInfoActions.operationFinished]: (state, action) => (
      ['z_mergetoaddress', 'z_shieldcoinbase'].includes(action.payload.operation.method)
        ? { ...state, frozenAddresses: {} }
        : state
    ),
  }, preloadedState)
