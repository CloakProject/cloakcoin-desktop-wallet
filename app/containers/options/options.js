// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import get from 'lodash.get'
import { translate } from 'react-i18next'
import cn from 'classnames'
import MainOptions from '~/components/options/MainOptions'
import NetworkOptions from '~/components/options/NetworkOptions'
import WindowOptions from '~/components/options/WindowOptions'
import DisplayOptions from '~/components/options/DisplayOptions'
import EnigmaCloakShieldOptions from '~/components/options/EnigmaCloakShieldOptions'
import {
  RoundedButton,
} from '~/components/rounded-form'

import styles from './options.scss'

import { OptionsActions, OptionsState } from '~/reducers/options/options.reducer'

type Props = {
  t: any,
  options: OptionsState,
	mainOptions: Any,
	networkOptions: Any,
	windowOptions: Any,
	displayOptions: Any,
	enigmaCloakShieldOptions: Any
}

/**
 * @class Options
 * @extends {Component<Props>}
 */
class Options extends Component<Props> {
  props: Props
  
  constructor(props) {
    super(props);
    this.state = {
      tabId: 'Main'
    }
  }

  hasChanges() {
    let hasChanges = false
    if (!hasChanges && this.props.mainOptions) {
      hasChanges = this.props.options.startupAtSystemLogin !== get(this.props.mainOptions, 'fields.startupAtSystemLogin', this.props.options.startupAtSystemLogin) ||
                    this.props.options.detachDatabaseAtShutdown !== get(this.props.mainOptions, 'fields.detachDatabaseAtShutdown', this.props.options.detachDatabaseAtShutdown)
    }
    if (!hasChanges && this.props.networkOptions) {
      hasChanges = this.props.options.mapPortUsingUpnp !== get(this.props.networkOptions, 'fields.mapPortUsingUpnp', this.props.options.mapPortUsingUpnp) ||
                    this.props.options.connectThroughSocksProxy !== get(this.props.networkOptions, 'fields.connectThroughSocksProxy', this.props.options.connectThroughSocksProxy)
      if (!hasChanges && get(this.props.networkOptions, 'fields.connectThroughSocksProxy', this.props.options.connectThroughSocksProxy)) {
        hasChanges = this.props.options.proxyIp !== get(this.props.networkOptions, 'fields.proxyIp', this.props.options.proxyIp) ||
                      this.props.options.proxyPort !== get(this.props.networkOptions, 'fields.proxyPort', this.props.options.proxyPort) ||
                      this.props.options.socksVersion !== get(this.props.networkOptions, 'fields.socksVersion', this.props.options.socksVersion)
      }
    }
    if (!hasChanges && this.props.windowOptions) {
      hasChanges = this.props.options.minimizeToTray !== get(this.props.windowOptions, 'fields.minimizeToTray', this.props.options.minimizeToTray) ||
                    this.props.options.closeToTray !== get(this.props.windowOptions, 'fields.closeToTray', this.props.options.closeToTray)
    }
    if (!hasChanges && this.props.displayOptions) {
      hasChanges = this.props.options.language !== get(this.props.displayOptions, 'fields.language', this.props.options.language) ||
                    this.props.options.amountUnit !== get(this.props.displayOptions, 'fields.amountUnit', this.props.options.amountUnit)
    }
    if (!hasChanges && this.props.enigmaCloakShieldOptions) {
      hasChanges = this.props.options.enigmaReserveBalance !== get(this.props.enigmaCloakShieldOptions, 'fields.enigmaReserveBalance', this.props.options.enigmaReserveBalance) ||
                    this.props.options.enigmaAutoRetry !== get(this.props.enigmaCloakShieldOptions, 'fields.enigmaAutoRetry', this.props.options.enigmaAutoRetry) ||
                    this.props.options.cloakShieldEnigmaTransactions !== get(this.props.enigmaCloakShieldOptions, 'fields.cloakShieldEnigmaTransactions', this.props.options.cloakShieldEnigmaTransactions) ||
                    this.props.options.cloakShieldNonEnigmaTransactions !== get(this.props.enigmaCloakShieldOptions, 'fields.cloakShieldNonEnigmaTransactions', this.props.options.cloakShieldNonEnigmaTransactions) ||
                    this.props.options.cloakShieldRoutes !== get(this.props.enigmaCloakShieldOptions, 'fields.cloakShieldRoutes', this.props.options.cloakShieldRoutes) ||
                    this.props.options.cloakShieldNodes !== get(this.props.enigmaCloakShieldOptions, 'fields.cloakShieldNodes', this.props.options.cloakShieldNodes) ||
                    this.props.options.cloakShieldHops !== get(this.props.enigmaCloakShieldOptions, 'fields.cloakShieldHops', this.props.options.cloakShieldHops)
    }
    return hasChanges
  }

  onChooseTab = id => {
    this.setState({ tabId: id });
  }

	render() {
    if (!this.props.options.isOptionsOpen) {
      return null
    }

    const { t } = this.props

    const optionTabs = [
      {label: 'Main'},
      {label: 'Network'},
      {label: 'Window'},
      {label: 'Display'},
      {label: 'Enigma / CloakShield'}
    ]

		return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.optionsContainer)}>
          <div className={styles.optionTabs}>
            {
              optionTabs.map(item => (
                <div
                  className={cn(styles.tab, this.state.tabId === item.label ? styles.active : '')}
                  key={item.label}
                  onClick={() => this.onChooseTab(item.label)}
                >
                  <p>{t(item.label)}</p>
                </div>  
              ))
            }
          </div>
          <div className={styles.tabContent}>
            {this.state.tabId === 'Main' && <MainOptions />}
            {this.state.tabId === 'Network' && <NetworkOptions />}
            {this.state.tabId === 'Window' && <WindowOptions />}
            {this.state.tabId === 'Display' && <DisplayOptions />}
            {this.state.tabId === 'Enigma / CloakShield' && <EnigmaCloakShieldOptions />}
          </div>
          <div className={styles.actions}>
            <RoundedButton
              className={styles.ok}
              type="submit"
              onClick={() => this.props.actions.applyChanges(true)}
              important
              disabled={this.props.options.isApplyingOptions}
            >
              {t(`Ok`)}
            </RoundedButton>
            <RoundedButton
              className={styles.cancel}
              type="button"
              onClick={this.props.actions.closeOptions}
              important
              disabled={this.props.options.isApplyingOptions}
            >
              {t(`Cancel`)}
            </RoundedButton>
            <RoundedButton
              className={styles.apply}
              type="submit"
              onClick={() => this.props.actions.applyChanges(false)}
              important
              spinner={this.props.options.isApplyingOptions}
              disabled={this.props.options.isApplyingOptions || !this.hasChanges()}
            >
              {t(`Apply`)}
            </RoundedButton>
          </div>
        </div>
      </div>
		)
	}
}

const mapStateToProps = state => ({
	options: state.options,
	mainOptions: state.roundedForm ? state.roundedForm.mainOptions : null,
	networkOptions: state.roundedForm ? state.roundedForm.networkOptions : null,
	windowOptions: state.roundedForm ? state.roundedForm.windowOptions : null,
	displayOptions: state.roundedForm ? state.roundedForm.displayOptions : null,
	enigmaCloakShieldOptions: state.roundedForm ? state.roundedForm.enigmaCloakShieldOptions : null
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(OptionsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('options')(Options))
