/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-unused-vars */
// @flow

import { remote } from 'electron'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { Switch, Route, Redirect } from 'react-router'
import cn from 'classnames'
import path from 'path'
import { getOS, getResourcesPath } from '~/utils/os'

import WelcomePage from './get-started/WelcomePage'
import TitleBarButtons from '~/components/title-bar-buttons/TitleBarButtons'
import NaviBar from './navigation/navi-bar'
import Options from './options/options'
import SystemInfo from './system-info/system-info'
import Overview from './overview/overview'
import SendCash from './send-cash/send-cash'
import ReceiveCash from './receive-cash/receive-cash'
import transactionCash from './transaction-cash/transaction-cash'
import EnigmaStats from './enigma-stats/enigma-stats'
import Settings from './settings/settings'

import AddressBookPage from './AddressBookPage'

import { getStore } from '../store/configureStore'
import { AuthState } from '~/reducers/auth/auth.reducer'
import { GetStartedState } from '~/reducers/get-started/get-started.reducer'
import { OptionsActions, OptionsState } from '~/reducers/options/options.reducer'

import styles from './App.scss'
import HLayout from '../assets/styles/h-box-layout.scss'
import VLayout from '../assets/styles/v-box-layout.scss'

type Props = {
  auth: AuthState,
  getStarted: GetStartedState,
  options: OptionsState,
  optionsActions: OptionsActions
}

const {Tray, Menu} = remote
let tray = null

/**
 * @export
 * @class App
 * @extends {React.Component<Props>}
 */
class App extends React.Component<Props> {
  props: Props
  
  showHideApp() {
    if (remote.getCurrentWindow().isVisible()) {
      remote.getCurrentWindow().hide()
    } else {
      remote.getCurrentWindow().show()
    }
  }

  showOptions() {
    this.props.optionsActions.openOptions()
  }

  exitApp() {
    remote.getCurrentWindow().close()
  }

  getGetStartedContent() {
    return (
      <div className={cn(styles.contentContainer, VLayout.vBoxChild, HLayout.hBoxContainer)}>
        <div className={cn(styles.routeContentContainer, HLayout.hBoxChild, HLayout.hBoxContainer)}>
          <Switch>
            <Route exact path="/" render={() => (<Redirect to="/get-started/welcome" />)} />
            <Route exact path="/get-started/welcome" component={WelcomePage} />
          </Switch>
        </div>
      </div>
    )
  }

  getMainContent() {
    if (tray === null) {
      let iconFileName = 'icon.png'
      if (getOS() === 'macos') {
        iconFileName = 'icon.icns'
      } else if (getOS() === 'windows') {
        iconFileName = 'icon.ico'
      }

      const basePath = getResourcesPath()
      const iconPath = path.join(basePath, 'resources', `${iconFileName}`)
    
      tray = new Tray(iconPath)
      const contextMenu = Menu.buildFromTemplate([
        { label: 'Show/Hide', click: () => this.showHideApp() },
        { label: 'Options...', click: () => this.showOptions() },
        { type: 'separator' },
        { label: 'Exit', click: () => this.exitApp() }
      ])
      tray.setToolTip('Cloak wallet v3.0')
      tray.setContextMenu(contextMenu)
    }

    return (
      <div className={cn(styles.contentContainer, VLayout.vBoxContainer)}>
				<div className={cn(VLayout.vBoxChild, HLayout.hBoxContainer)}>
          <TitleBarButtons />
					<NaviBar />
          <Options />
					<div className={cn(styles.layoutContent)}>
						<Switch>
							<Route exact path="/" render={() => (<Redirect to="/overview" />)} />
							<Route exact path="/overview" component={Overview} />
							<Route exact path="/send-cash" component={SendCash} />
              <Route exact path="/receive-cash" component={ReceiveCash} />
              <Route exact path="/transaction-cash" component={transactionCash} />
							<Route exact path="/address-book" component={AddressBookPage} />
              <Route exact path="/enigma-stats" component={EnigmaStats} />
							<Route exact path="/settings" component={Settings} />
						</Switch>
					</div>
				</div>
				<SystemInfo />
      </div>
    )
  }

	/**
   * Renders routes.
   *
	 * @returns
   * @memberof App
	 */
	render() {

    let content
    if (this.props.getStarted.isInProgress) {
      content = this.getGetStartedContent()
    } else {
      content = this.getMainContent()
    }

    // else {
    //   content = this.props.auth.isLoginRequired ? (<Login />) : this.getMainContent()
    // }

		return (
			<div id="App" className={cn(styles.appContainer, VLayout.vBoxContainer)}>
        {content}
			</div>
		)
	}
}

const mapDispatchToProps = dispatch => ({
  optionsActions: bindActionCreators(OptionsActions, dispatch)
})

export default connect(state => state, mapDispatchToProps)(App)
