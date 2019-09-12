// @flow
import { tap, switchMap, map, mapTo } from 'rxjs/operators'
import { merge, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { DECIMAL } from '~/constants/decimal'
import { i18n } from '~/i18next.config'
import { Action } from '../types'
import { SystemInfoActions } from '../system-info/system-info.reducer'
import { SendCashActions, SendCashState, checkEnigmaTransactionRule } from './send-cash.reducer'
import { AddressBookRecord } from '../address-book/address-book.reducer'
import { RpcService } from '~/service/rpc-service'
import { AddressBookService } from '~/service/address-book-service'


const t = i18n.getFixedT(null, 'send-cash')
const rpcService = new RpcService()
const addressBookService = new AddressBookService()

const allowToSend = (sendCashState: SendCashState) => {
	if (
		sendCashState.receiptions.trim() === ''
	) {
		return t('"FROM ADDRESS" or "DESTINATION ADDRESS" is required.')
  }

  if (sendCashState.amount.lessThanOrEqualTo(DECIMAL.transactionFee)) {
		return t(`"AMOUNT" is required.`)
	}

	return 'ok'
}


const sendCashEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SendCashActions.sendCash),
	map(() => {
		// const isAllowedToSend = allowToSend(state$.value.sendCash)
		// if (isAllowedToSend !== 'ok') {
		// 	return SendCashActions.sendCashFailure(isAllowedToSend)
		// }

		const checkRuleResult = checkEnigmaTransactionRule(state$.value.sendCash)
		if (checkRuleResult !== 'ok') {
			return SendCashActions.sendCashFailure(checkRuleResult)
		}

    // Lock local Cloak node from toggling
		return SystemInfoActions.newOperationTriggered()
	}),
	tap((action: Action) => {
		// Only fire real send if no error above
		if (action.type === SystemInfoActions.newOperationTriggered.toString()) {
			const state = state$.value.sendCash
			rpcService.sendCash(state.receiptions, state.isEnigmaTransactions);
		}
	})
)

const sendCashOperationStartedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SendCashActions.sendCashOperationStarted),
	tap(() => {
		toastr.info(t(`Send cash operation started.`))
	}),
	mapTo(SendCashActions.empty())
)

const sendCashFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SendCashActions.sendCashFailure),
  tap((action: Action) => {
    toastr.error(t(`Unable to start send cash operation`), action.payload.errorMessage)
  }),
	mapTo(SendCashActions.empty())
)

const getAddressListEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SendCashActions.getAddressList),
	switchMap(() => {
		const sendCashState = state$.value.sendCash
		return rpcService.getWalletAddressAndBalance(true, !sendCashState.isEnigmaTransactions)
	}),
	map(result => SendCashActions.getAddressListSuccess(result))
)

const checkAddressBookByNameEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SendCashActions.checkAddressBookByName),
	switchMap(() => {
		const sendCashState = state$.value.sendCash
		if (sendCashState.toAddress.trim() === '') {
			return of(SendCashActions.empty())
		}

		const addressBookState = state$.value.addressBook
		const addressbookContent$ = addressBookState.addresses && addressBookState.addresses.length > 0 ?
			of(addressBookState.addresses) : addressBookService.loadAddressBook()

		return addressbookContent$.pipe(
			map((addressBookRows: AddressBookRecord[]) => {
				if (!addressBookRows || addressBookRows.length <= 0) {
					return SendCashActions.empty()
				}

				const matchedAddressRow = addressBookRows.find(tempAddressRow => tempAddressRow.name.toLowerCase() === sendCashState.toAddress.trim().toLowerCase())
				return matchedAddressRow ? SendCashActions.updateToAddress(matchedAddressRow.address) : SendCashActions.empty()
			})
		)
	})
)

export const SendCashEpics = (action$, state$) => merge(
	sendCashEpic(action$, state$),
	sendCashOperationStartedEpic(action$, state$),
	sendCashFailureEpic(action$, state$),
	getAddressListEpic(action$, state$),
	checkAddressBookByNameEpic(action$, state$)
)