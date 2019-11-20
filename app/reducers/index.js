// @flow
import { combineReducers } from 'redux'
import { combineEpics } from 'redux-observable'
import { reducer as toastrReducer } from 'react-redux-toastr'

// Reducers
import { AuthReducer } from './auth/auth.reducer'
import { RoundedFormReducer } from './rounded-form/rounded-form.reducer'
import { RpcPollingReducer } from './rpc-polling/rpc-polling.reducer'
import { PopupMenuReducer } from './popup-menu/popup-menu.reducer'
import { FetchLdbReducer } from './fetch-ldb/fetch-ldb.reducer'
import { NaviReducer } from './navi/navi.reducer'
import { GetStartedReducer } from './get-started/get-started.reducer'
import { SystemInfoReducer } from './system-info/system-info.reducer'
import { OverviewReducer } from './overview/overview.reducer'
import { OwnAddressesReducer } from './own-addresses/own-addresses.reducer'
import { SendCashReducer } from './send-cash/send-cash.reducer'
import { SettingsReducer } from './settings/settings.reducer'
import { OptionsReducer } from './options/options.reducer'
import { AddressBookReducer } from './address-book/address-book.reducer'
import { EnigmaStatsReducer } from './enigma-stats/enigma-stats.reducer'
import { DebugReducer } from './debug/debug.reducer'
import { AboutReducer } from './about/about.reducer'

// Epics
import { AuthEpic } from './auth/auth.epic'
import { GetStartedEpic } from './get-started/get-started.epic'
import { FetchLdbEpic } from './fetch-ldb/fetch-ldb.epic'
import { OwnAddressesEpics } from './own-addresses/own-addresses.epic'
import { NaviEpics } from './navi/navi.epic'
import { OverviewEpics } from './overview/overview.epic'
import { SystemInfoEpics } from './system-info/system-info.epic'
import { SendCashEpics } from './send-cash/send-cash.epic'
import { SettingsEpics } from './settings/settings.epic'
import { OptionsEpics } from './options/options.epic'
import { AddressBookEpics } from './address-book/address-book.epic'
import { EnigmaStatsEpics } from './enigma-stats/enigma-stats.epic'
import { DebugEpics } from './debug/debug.epic'

const rootReducer = combineReducers({
  toastr: toastrReducer,
  auth: AuthReducer,
  roundedForm: RoundedFormReducer,
  getStarted: GetStartedReducer,
  fetchLdb: FetchLdbReducer,
  rpcPolling: RpcPollingReducer,
  popupMenu: PopupMenuReducer,
	navi: NaviReducer,
	systemInfo: SystemInfoReducer,
	overview: OverviewReducer,
	ownAddresses: OwnAddressesReducer,
	sendCash: SendCashReducer,
	addressBook: AddressBookReducer,
	enigmaStats: EnigmaStatsReducer,
	settings: SettingsReducer,
	options: OptionsReducer,
	debug: DebugReducer,
	about: AboutReducer
})

const rootEpic = combineEpics(
  AuthEpic,
  GetStartedEpic,
  FetchLdbEpic,
	NaviEpics,
	SystemInfoEpics,
	OverviewEpics,
	OwnAddressesEpics,
	SendCashEpics,
	AddressBookEpics,
	EnigmaStatsEpics,
	SettingsEpics,
	OptionsEpics,
	DebugEpics
)

export default { rootReducer, rootEpic }
