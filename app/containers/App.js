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
import StatusIcons from '~/components/status-icons/StatusIcons'
import SystemInfo from './system-info/system-info'
import Overview from './overview/overview'
import TransactionDetails from '~/components/overview/TransactionDetails'
import OwnAddress from './own-addresses/own-addresses'
import SendCash from './send-cash/send-cash'
import Settings from './settings/settings'
import SimplexPage from './SimplexPage'

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

	componentDidMount() {
    if (!this.props.getStarted.isInProgress) {
      getStore().dispatch(SettingsActions.kickOffChildProcesses())
    }
  }

  getGetStartedContent() {
    return (
      <div className={cn(styles.contentContainer, VLayout.vBoxChild, HLayout.hBoxContainer)}>
        <TitleBarButtons />
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
          {/* <StatusIcons /> */}
					<div className={cn(styles.layoutContent)}>
						<Switch>
							<Route exact path="/" render={() => (<Redirect to="/overview" />)} />

							<Route exact path="/overview" component={Overview} />
              <Route exact path="/overview/transaction-details" component={TransactionDetails} />
							<Route exact path="/own-addresses" component={OwnAddress} />
							<Route exact path="/send-cash" component={SendCash} />
							<Route exact path="/settings" component={Settings} />
							<Route exact path="/simplex" component={SimplexPage} />
							<Route exact path="/address-book" component={AddressBookPage} />
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
