// @flow
import { tap, mapTo, switchMap, mergeMap, mergeAll } from 'rxjs/operators'
import { Observable, of, concat, merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'
import { Decimal } from 'decimal.js'

import { i18n } from '~/i18next.config'
import { Action } from '../types'
import { SendCashActions } from './send-cash.reducer'
import { AddressBookActions } from '../address-book/address-book.reducer'
import { RoundedFormActions } from '../rounded-form/rounded-form.reducer'
import { RpcService } from '~/service/rpc-service'
import ValidateAddressService from '~/service/validate-address-service'


const t = i18n.getFixedT(null, 'send-cash')
const rpc = new RpcService()

const newReceptionEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SendCashActions.newReception),
	switchMap(action => concat(
		of(RoundedFormActions.updateField('sendCash', `toAddress${action.payload.id}`, '')),
		of(RoundedFormActions.updateField('sendCash', `amount${action.payload.id}`, '')),
		of(RoundedFormActions.updateField('sendCash', `label${action.payload.id}`, '')),
		of(SendCashActions.newReceptionCreated(action.payload.id, action.payload.unit))
	))
)

const removeReceptionEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SendCashActions.removeReception),
	switchMap(action => concat(
		of(RoundedFormActions.updateField('sendCash', `toAddress${action.payload.id}`, undefined)),
		of(RoundedFormActions.updateField('sendCash', `amount${action.payload.id}`, undefined)),
		of(RoundedFormActions.updateField('sendCash', `label${action.payload.id}`, undefined)),
		of(SendCashActions.receptionRemoved(action.payload.id))
	))
)

const removeReceptionsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SendCashActions.removeReceptions),
	switchMap(() => concat(
		of(RoundedFormActions.updateFields('sendCash', {}, false)),
		of(SendCashActions.receptionsRemoved())
	))
)

const toggleAmountUnitEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SendCashActions.toggleAmountUnit),
	switchMap(action => {
		const state = state$.value.sendCash
		const unit = state.receptionUnits.find(u => u.id === action.payload.id)
		const {fields} = state$.value.roundedForm.sendCash
		let amount = fields[`amount${action.payload.id}`]
		amount = Decimal(amount || 0).div(Decimal(unit.unit)).mul(Decimal(action.payload.unit))
		let strAmount = amount.toString()
		if (strAmount === '0' || strAmount === '0.0') {
			strAmount = '0.00'
		}
		return concat(
			of(RoundedFormActions.updateField('sendCash', `amount${action.payload.id}`, strAmount)),
			of(SendCashActions.amountUnitToggled(action.payload.id, action.payload.unit))
		)
	})
)

const sendCashEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SendCashActions.sendCash),
	mergeMap(action => {
		const state = state$.value.sendCash
		const {fields} = state$.value.roundedForm.sendCash
		const addressBookAdds = []
		const receptions = []
		let totalAmount = Decimal(0)
		state.receptionUnits.forEach((unit) => {
			const toAddress = fields[`toAddress${unit.id}`]
			const label = fields[`label${unit.id}`]
			const amountToSend = Decimal(fields[`amount${unit.id}`]).mul(Decimal(unit.unit))
			totalAmount = totalAmount.add(amountToSend)
			receptions.push({
				toAddress,
				amountToSend
			})
			if (label) {
				addressBookAdds.push(
					of(AddressBookActions.newAddressModal.addOrUpdateAddressWithData({
						name: label,
						address: toAddress,
						isEnigma: ValidateAddressService.isSAddress(toAddress)
					}))
				)
			}
		})

		return Observable.create(observer => {
			const confirmOptions = {
				okText: t(`Ok`),
				cancelText: t(`Cancel`),
				onOk: () => {
					rpc.sendCash(receptions, action.payload.isEnigmaSend, action.payload.enigmaSendCloakers, action.payload.enigmaSendTimeout, action.payload.passphrase)
					observer.next(concat(...addressBookAdds))
					observer.complete()
				},
				onCancel: () => {
					observer.next(of(SendCashActions.sendCashCancelled()))
					observer.complete()
				}
			}
			const message = t(`Are you sure want to send {{totalAmount}} CLOAK?`,
								{ totalAmount })
			toastr.confirm(message, confirmOptions)
		})
	}),
	mergeAll()
)

const sendCashFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SendCashActions.sendCashFailure),
	tap((action: Action) => {
		toastr.error(t(`Unable to send cash`), action.payload.errorMessage)
	}),
	mapTo(SendCashActions.empty())
)

export const SendCashEpics = (action$, state$) => merge(
	newReceptionEpic(action$, state$),
	removeReceptionEpic(action$, state$),
	removeReceptionsEpic(action$, state$),
	toggleAmountUnitEpic(action$, state$),
	sendCashEpic(action$, state$),
	sendCashFailureEpic(action$, state$),
)