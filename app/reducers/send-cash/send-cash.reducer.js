// @flow
import { Decimal } from 'decimal.js'
import { createActions, handleActions } from 'redux-actions'

import { i18n } from '~/i18next.config'
import { preloadedState } from '../preloaded.state'


const t = i18n.getFixedT(null, 'send-cash')

export type SendFromRadioButtonType = 'transparent' | 'enigma'

export type AddressDropdownItem = {
	address: string,
	balance: Decimal | null,
	disabled?: boolean
}

export type SendCashState = {
	isEnigmaTransactions: boolean,
	lockIcon: 'Lock' | 'Unlock',
	lockTips: string | null,
	fromAddress: string,
	toAddress: string,
	inputTooltips: string,
	amount: Decimal,
	showDropdownMenu: boolean,
	sendFromRadioButtonType: SendFromRadioButtonType,
  addressList: AddressDropdownItem[],
  isInputDisabled: boolean
}

export const SendCashActions = createActions(
  {
    EMPTY: undefined,
    TOGGLE_ENIGMA_SEND: undefined,
    UPDATE_FROM_ADDRESS: (address: string) => address,
    UPDATE_TO_ADDRESS: (address: string) => address,
    UPDATE_AMOUNT: (amount: Decimal) => amount,
    SEND_CASH: undefined,
    SEND_CASH_OPERATION_STARTED: (operationId: string) => ({ operationId }),
    SEND_CASH_FAILURE: (errorMessage: string) => ({ errorMessage }),
    UPDATE_DROPDOWN_MENU_VISIBILITY: (show: boolean) => show,
    GET_ADDRESS_LIST: (isEnigma: boolean) => isEnigma,
    GET_ADDRESS_LIST_SUCCESS: (addressList: AddressDropdownItem[]) => addressList,
    GET_ADDRESS_LIST_FAIL: undefined,
    PASTE_TO_ADDRESS_FROM_CLIPBOARD: undefined,
    CHECK_ADDRESS_BOOK_BY_NAME: undefined
  },
  {
    prefix: `APP/SEND_CASH`
  }
)


const isEnigmaAddress = (tempAddress: string) => tempAddress.startsWith('z')
const isTransparentAddress = (tempAddress: string) => tempAddress.startsWith('r')

/**
 * @param {*} tempState
 */
export const checkEnigmaTransactionRule = (tempState: SendCashState) => {
	let checkResult = 'ok'

  if (tempState.isEnigmaTransactions) {
    return checkResult
  }

	if (isTransparentAddress(tempState.fromAddress) && isEnigmaAddress(tempState.toAddress)) {
    checkResult = t(`Sending cash from a transparent (C) address to a enigma address is forbidden when "Enigma Transactions" are disabled.`)
	}
	else if (isEnigmaAddress(tempState.fromAddress) && isEnigmaAddress(tempState.toAddress)) {
    checkResult = t(`Sending cash from a enigma address to a enigma address is forbidden when "Enigma Transactions" are disabled.`)
	}
	else if (isEnigmaAddress(tempState.fromAddress) && isTransparentAddress(tempState.toAddress)) {
    checkResult = t(`Sending cash from a enigma address to a transparent (C) address is forbidden when "Enigma Transactions" are disabled.`)
	}

	return checkResult
}

/**
 * @param {*} tempState
 * @param {*} newAddress
 * @param {*} isUpdateFromAddress
 */
const handleAddressUpdate = (tempState: SendCashState, newAddress: string, isUpdateFromAddress: boolean) => {
	const newState = isUpdateFromAddress ? ({ ...tempState, fromAddress: newAddress }) : ({ ...tempState, toAddress: newAddress })

	// We should use the "next state" to run  the `checkEnigmaTransactionRule` !!!
	const tempCheckResult = checkEnigmaTransactionRule(newState)
	const newInputTooltips = tempCheckResult === 'ok' ? '' : tempCheckResult

	// The new `lockIcon` and `lockTips`
	const { fromAddress, toAddress } = newState

	let lockIcon = 'Unlock'
	let lockTips = t('tip-r-to-r')

	if (isTransparentAddress(fromAddress) && isEnigmaAddress(toAddress)) {
		lockIcon = `Unlock`
		lockTips = t('tip-r-to-z')
	} else if (isEnigmaAddress(fromAddress) && isEnigmaAddress(toAddress)) {
		lockIcon = `Lock`
		lockTips = t('tip-z-to-z')
	} else if (isEnigmaAddress(fromAddress) && isTransparentAddress(toAddress)) {
		lockIcon = `Unlock`
		lockTips = t('tip-z-to-r')
	} else if (isTransparentAddress(fromAddress) && isTransparentAddress(toAddress)) {
		lockIcon = `Unlock`
		lockTips = t('tip-r-to-r')
	}

	return ({ ...newState, inputTooltips: newInputTooltips, lockIcon, lockTips })
}

/**
 * @param {*} tempState
 */
const handleToggleEnigmaTransaction = (tempState: SendCashState) => {
	const newState = ({ ...tempState, isEnigmaTransactions: !tempState.isEnigmaTransactions })

	// We should use the "next state" to run  the `checkEnigmaTransactionRule` !!!
	const tempCheckResult = checkEnigmaTransactionRule(newState)
	const newInputTooltips = tempCheckResult === 'ok' ? '' : tempCheckResult

	return ({ ...newState, inputTooltips: newInputTooltips })
}


export const SendCashReducer = handleActions({
	[SendCashActions.sendCash]: (state) => ({ ...state, isInputDisabled: true }),
	[SendCashActions.sendCashOperationStarted]: (state) => ({ ...state, isInputDisabled: false }),
	[SendCashActions.sendCashFailure]: (state) => ({ ...state, isInputDisabled: false }),

	[SendCashActions.toggleEnigmaSend]: (state) => handleToggleEnigmaTransaction(state),

	[SendCashActions.updateFromAddress]: (state, action) => handleAddressUpdate(state, action.payload, true),
	[SendCashActions.updateToAddress]: (state, action) => handleAddressUpdate(state, action.payload, false),
	[SendCashActions.updateAmount]: (state, action) => ({ ...state, amount: action.payload }),
	[SendCashActions.updateDropdownMenuVisibility]: (state, action) => ({ ...state, showDropdownMenu: action.payload }),

	[SendCashActions.getAddressListSuccess]: (state, action) => ({ ...state, addressList: action.payload }),
	[SendCashActions.getAddressListFail]: (state) => ({ ...state, addressList: null })
}, preloadedState.sendCash)