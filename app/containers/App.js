/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-unused-vars */
// @flow

import React from 'react'
import { connect } from 'react-redux'
import { Switch, Route, Redirect } from 'react-router'
import cn from 'classnames'

import WelcomePage from './get-started/WelcomePage'
import TitleBarButtons from '~/components/title-bar-buttons/TitleBarButtons'
import NaviBar from './navigation/navi-bar'
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
import { SettingsActions } from '~/reducers/settings/settings.reducer'

import styles from './App.scss'
import HLayout from '../assets/styles/h-box-layout.scss'
import VLayout from '../assets/styles/v-box-layout.scss'

type Props = {
  auth: AuthState,
  getStarted: GetStartedState
}

/**
 * @export
 * @class App
 * @extends {React.Component<Props>}
 */
class App extends React.Component<Props> {
	props: Props

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
    return (
      <div className={cn(styles.contentContainer, VLayout.vBoxContainer)}>
				<div className={cn(VLayout.vBoxChild, HLayout.hBoxContainer)}>
          <TitleBarButtons />
					<NaviBar />
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

export default connect(state => state, null)(App)
