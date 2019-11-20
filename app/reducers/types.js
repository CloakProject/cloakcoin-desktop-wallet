// @flow

import { RoundedFormState } from './rounded-form/rounded-form.reducer'
import { GetStartedState } from './get-started/get-started.reducer'
import { RpcPollingState } from './rpc-polling/rpc-polling.reducer'
import { PopupMenuState } from './popup-menu/popup-menu.reducer'
import { NaviState } from './navi/navi.reducer'
import { SystemInfoState } from './system-info/system-info.reducer'
import { OverviewState } from './overview/overview.reducer'
import { OwnAddressesState } from './own-addresses/own-addresses.reducer'
import { SendCashState } from './send-cash/send-cash.reducer'
import { SettingsState } from './settings/settings.reducer'
import { AddressBookState } from './address-book/address-book.reducer'

export type Action = {
  +type: string,
  payload?: any,
  meta?: any
}

export type State = {
  roundedForm: RoundedFormState,
  getStarted: GetStartedState,
	rpcPolling: RpcPollingState,
  popupMenu: PopupMenuState,
	navi: NaviState,
	systemInfo: SystemInfoState,
	overview: OverviewState,
	ownAddresses: OwnAddressesState,
	sendCash: SendCashState,
	addressBook: AddressBookState,
	settings: SettingsState
}

