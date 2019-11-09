// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'
import { OwnAddressesActions } from '~/reducers/own-addresses/own-addresses.reducer'

export type AddressBookRecord = {
  name: string,
  address: string,
  isEnigma: boolean
}

export type AddressBookState = {
  records: AddressBookRecord[],
  sortedHeader: string,
  isDescending: boolean,
  newAddressModal: {
    originalName?: string,
    defaultValues: {
      name?: string,
      address?: string,
      isEnigma?: boolean
    },
    isInEditMode?: boolean,
    isVisible: boolean
  }
}

export const AddressBookActions = createActions(
  {
    EMPTY: undefined,

    LOAD_ADDRESS_BOOK: undefined,
    GOT_ADDRESS_BOOK: (records: AddressBookRecord[]) => ({ records }),

    EDIT_ADDRESS: (record: AddressBookRecord) => ({ record }),
    COPY_ADDRESS: (record: AddressBookRecord) => ({ record }),
    CONFIRM_ADDRESS_REMOVAL: (record: AddressBookRecord) => ({ record }),
    REMOVE_ADDRESS: (record: AddressBookRecord) => ({ record }),

    SORT_ADDRESS_BOOK: (header: string, isDescending: boolean) => ({ header, isDescending }),

    OPEN_NEW_ADDRESS_MODAL: (record: AddressBookRecord | undefined) => ({ record }),

    NEW_ADDRESS_MODAL: {
      ERROR: (errorMessage: string) => ({ errorMessage }),

      ADD_ADDRESS: undefined,
      UPDATE_ADDRESS: undefined,
      ADD_OR_UPDATE_ADDRESS: undefined,
      CREATE_ADDRESS: (isStealth: boolean) => ({ isStealth }),
      CREATE_OWN_ADDRESS_FAILURE:  (errorMessage: string) => ({ errorMessage }),
      ADD_OR_UPDATE_ADDRESS_WITH_DATA: (record: AddressBookRecord, isNew?: boolean) => ({ record, isNew }),

      CLOSE: undefined
    },
  },
  {
    prefix: 'APP/ADDRESS_BOOK'
  }
)

export const AddressBookReducer = handleActions(
  {
    [AddressBookActions.gotAddressBook]: (state, action) => ({
      ...state,
      records: action.payload.records
    }),
    [AddressBookActions.openNewAddressModal]: (state, action) => ({
      ...state,
      newAddressModal: {
        originalName: action.payload.record && action.payload.record.name,
        defaultValues: Object.assign({}, action.payload.record || {}),
        isInEditMode: action.payload.record !== undefined,
        isVisible: true,
        isDoing: false
      }
    }),

    [AddressBookActions.sortAddressBook]: (state, action) => ({
      ...state,
      sortedHeader: action.payload.header,
      isDescending: action.payload.isDescending
    }),

    [AddressBookActions.newAddressModal.addAddress]: state => ({
      ...state,
      newAddressModal: { ...state.newAddressModal, isDoing: true }
    }),
    [AddressBookActions.newAddressModal.updateAddress]: state => ({
      ...state,
      newAddressModal: { ...state.newAddressModal, isDoing: true }
    }),
    [AddressBookActions.newAddressModal.addOrUpdateAddress]: state => ({
      ...state,
      newAddressModal: { ...state.newAddressModal, isDoing: true }
    }),
    [AddressBookActions.newAddressModal.createAddress]: state => ({
      ...state,
      newAddressModal: { ...state.newAddressModal, isDoing: true }
    }),
    [AddressBookActions.newAddressModal.addOrUpdateAddressWithData]: state => ({
      ...state,
      newAddressModal: { ...state.newAddressModal, isDoing: true }
    }),
    [AddressBookActions.newAddressModal.createAddressFailure]: state => ({
      ...state,
      newAddressModal: { ...state.newAddressModal, isDoing: false }
    }),
    [AddressBookActions.newAddressModal.error]: state => ({
      ...state,
      newAddressModal: { ...state.newAddressModal, isDoing: false }
    }),
    [AddressBookActions.newAddressModal.close]: state => ({
      ...state,
      newAddressModal: { defaultValues: {}, isVisible: false, isDoing: false }
    }),

    [OwnAddressesActions.createOwnAddressFailure]: state => ({
      ...state,
      newAddressModal: { ...state.newAddressModal, isDoing: false }
    }),
  }, preloadedState)
