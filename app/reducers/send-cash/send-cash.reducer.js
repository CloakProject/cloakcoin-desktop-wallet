// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'


export type ReceptionToAmountUnit = {
	id: number,
	unit: number
}

export type SendCashState = {
	receptionUnits?: Array<ReceptionToAmountUnit>,
	transactionId?: string,
	isEnigmaSend: boolean,
	enigmaSendCloakers: number,
	enigmaSendTimeout: number,
  isSendingCash: boolean
}

export const SendCashActions = createActions(
  {
		EMPTY: undefined,
		NEW_RECEPTION: (id: number, unit: number) => ({ id, unit }),
		NEW_RECEPTION_CREATED: (id: number, unit: number) => ({ id, unit }),
		REMOVE_RECEPTION: (id: number) => ({ id }),
		RECEPTION_REMOVED: (id: number) => ({ id }),
		REMOVE_RECEPTIONS: undefined,
		RECEPTIONS_REMOVED: undefined,
		TOGGLE_AMOUNT_UNIT: (id: number, unit: number) => ({ id, unit }),
		AMOUNT_UNIT_TOGGLED: (id: number, unit: number) => ({ id, unit }),
		TOGGLE_ENIGMA_SEND: (isEnigmaSend: boolean) => ({ isEnigmaSend }),
		CHANGE_ENIGMA_SEND_CLOAKERS: (cloakers: number) => ({ cloakers }),
		CHANGE_ENIGMA_SEND_TIMEOUT: (timeout: number) => ({ timeout }),
    SEND_CASH: (isEnigmaSend: boolean, enigmaSendCloakers: number, enigmaSendTimeout: number, passphrase: string) => ({ isEnigmaSend, enigmaSendCloakers, enigmaSendTimeout, passphrase }),
    SEND_CASH_STARTED: (txid: string) => ({ txid }),
    SEND_CASH_CANCELLED: undefined,
    SEND_CASH_FAILURE: (errorMessage: string) => ({ errorMessage }),
  },
  {
    prefix: `APP/SEND_CASH`
  }
)

const newReceptionCreated = (action: Action, state) => {
	const units = state.receptionUnits
	units.push({id: action.payload.id, unit: action.payload.unit})
	return {...state, receptionUnits: units}
}

const receptionRemoved = (action: Action, state) => {
	const units = state.receptionUnits
	const index = units.findIndex(u => u.id === action.payload.id)
	if (index >= 0) {
		units.splice(index, 1)
	}
	return {...state, receptionUnits: units}
}

const amountUnitToggled = (action: Action, state) => {
	const units = state.receptionUnits
	const unitIndex = units.findIndex(u => u.id === action.payload.id)
	units[unitIndex] = {id: action.payload.id, unit: action.payload.unit}
	return {...state, receptionUnits: units}
}

export const SendCashReducer = handleActions({
	[SendCashActions.newReceptionCreated]: (state, action) => (newReceptionCreated(action, state)),
	[SendCashActions.receptionRemoved]: (state, action) => (receptionRemoved(action, state)),
	[SendCashActions.receptionsRemoved]: (state) => ({...state, receptionUnits: []}),
	[SendCashActions.amountUnitToggled]: (state, action) => (amountUnitToggled(action, state)),
	[SendCashActions.toggleEnigmaSend]: (state, action) => ({...state, isEnigmaSend: action.payload.isEnigmaSend }),
	[SendCashActions.changeEnigmaSendCloakers]: (state, action) => ({...state, enigmaSendCloakers: action.payload.cloakers }),
	[SendCashActions.changeEnigmaSendTimeout]: (state, action) => ({...state, enigmaSendTimeout: action.payload.timeout }),
	[SendCashActions.sendCash]: (state) => ({ ...state, transactionId: '', isSendingCash: true }),
	[SendCashActions.sendCashStarted]: (state, action) => ({ ...state, transactionId: action.payload.txid, isSendingCash: false }),
	[SendCashActions.sendCashCancelled]: (state) => ({ ...state, isSendingCash: false }),
	[SendCashActions.sendCashFailure]: (state) => ({ ...state, isSendingCash: false }),
}, preloadedState.sendCash)