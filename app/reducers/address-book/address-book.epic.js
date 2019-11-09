// @flow
import { clipboard } from 'electron'
import { tap, switchMap, mergeMap, mergeAll, map, mapTo, catchError } from 'rxjs/operators'
import { Observable, merge, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { i18n } from '~/i18next.config'
import { RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'
import { AddressBookActions } from './address-book.reducer'
import { AddressBookService } from '~/service/address-book-service'
import ValidateAddressService from '~/service/validate-address-service'
import { RpcService } from '~/service/rpc-service'

const rpc = new RpcService()

const t = i18n.getFixedT(null, 'address-book')
const addressBook = new AddressBookService()

const loadAddressBookEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.loadAddressBook),
	switchMap(() => addressBook.loadAddressBook()),
	map(result => AddressBookActions.gotAddressBook(result))
)

const addAddressEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(AddressBookActions.newAddressModal.addAddress),
  mergeMap(() => {
    const newAddressRecord = state$.value.addressBook.newAddressModal.defaultValues
    return addressBook.addAddress(newAddressRecord).pipe(
      mergeMap(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.newAddressModal.close())),
      catchError(err => of(AddressBookActions.newAddressModal.error(err.toString())))
    )
  })
)

const updateAddressEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(AddressBookActions.newAddressModal.updateAddress),
  mergeMap(() => {
    const dialogState = state$.value.addressBook.newAddressModal
    const addressRecord = state$.value.addressBook.newAddressModal.defaultValues;
    return addressBook.updateAddress(dialogState.originalName, addressRecord).pipe(
      mergeMap(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.newAddressModal.close())),
      catchError(err => of(AddressBookActions.newAddressModal.error(err.toString())))
    )
  })
)

const addOrUpdateAddressEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(AddressBookActions.newAddressModal.addOrUpdateAddress),
  mergeMap(() => {
    const { address, label } = state$.value.roundedForm.addressBookNewAddressModal.fields
    return addressBook.addOrUpdateAddress({address, name: label, isEnigma: ValidateAddressService.isSAddress(address)}).pipe(
      mergeMap(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.newAddressModal.close())),
      catchError(err => of(AddressBookActions.newAddressModal.error(err.toString())))
    )
  })
)

const createAddressEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(AddressBookActions.newAddressModal.createAddress),
  tap((action) => { 
    const { label } = state$.value.roundedForm.addressBookNewAddressModal.fields
    rpc.createNewAddress(action.payload.isStealth, label)
  }),
  mapTo(AddressBookActions.empty())
)

const createAddressFailureEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.newAddressModal.createAddressFailure),
  tap(action => { toastr.error(action.payload.errorMessage) }),
  mapTo(AddressBookActions.empty())
)

const addOrUpdateAddressWithDataEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.newAddressModal.addOrUpdateAddressWithData),
  mergeMap(action => {
    const { record: {address, name}, isNew } = action.payload
    if (isNew) {
      toastr.success(t(`New address generated.`))
    }
    return addressBook.addOrUpdateAddress({address, name, isEnigma: ValidateAddressService.isSAddress(address)}).pipe(
      mergeMap(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.newAddressModal.close())),
      catchError(err => of(AddressBookActions.newAddressModal.error(err.toString())))
    )
  })
)

const copyAddressEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(AddressBookActions.copyAddress),
  map(action => {
    clipboard.writeText(action.payload.record.address)
    toastr.success(t(`Copied to clipboard`))
    return AddressBookActions.empty()
  })
)

const confirmAddressRemovalEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.confirmAddressRemoval),
  mergeMap(action => (
    Observable.create(observer => {
      const confirmOptions = {
        okText: t(`Ok`),
        cancelText: t(`Cancel`),
        onOk: () => {
          observer.next(of(AddressBookActions.removeAddress(action.payload.record)))
          observer.complete()
        },
        onCancel: () => {
          observer.next(of(AddressBookActions.empty()))
          observer.complete()
        }
      }
      const message = t(`Are you sure want to remove the address for "{{addressName}}"?`,
                        { addressName: action.payload.record.name })
      toastr.confirm(message, confirmOptions)
    })
  )),
  mergeAll()
)

const removeAddressEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.removeAddress),
  mergeMap(action => addressBook.removeAddress(action.payload.record.name).pipe(
    map(result => AddressBookActions.gotAddressBook(result)),
    catchError(err => of(AddressBookActions.newAddressModal.error(err.toString())))
  ))
)

const errorEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.newAddressModal.error),
  tap(action => { toastr.error(action.payload.errorMessage) }),
  mapTo(AddressBookActions.empty())
)

const closeEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(AddressBookActions.newAddressModal.close),
  mapTo(RoundedFormActions.clear('addressBookNewAddressModal'))
)

export const AddressBookEpics = (action$, state$) => merge(
	copyAddressEpic(action$, state$),
	loadAddressBookEpic(action$, state$),
	addAddressEpic(action$, state$),
	updateAddressEpic(action$, state$),
  addOrUpdateAddressEpic(action$, state$),
  addOrUpdateAddressWithDataEpic(action$, state$),
  createAddressEpic(action$, state$),
  createAddressFailureEpic(action$, state$),
  confirmAddressRemovalEpic (action$, state$),
	removeAddressEpic(action$, state$),
	errorEpic(action$, state$),
	closeEpic(action$, state$),
)
