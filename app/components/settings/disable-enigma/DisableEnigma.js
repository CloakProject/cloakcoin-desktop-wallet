/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import {
  RoundedButton,
} from '~/components/rounded-form'
import { SystemInfoState } from '~/reducers/system-info/system-info.reducer'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'
import styles from './DisableEnigma.scss'
import enigmaImg from '~/assets/images/main/settings/enigma-icon.png';

type Props = {
  className?: string,
  t: any,
  settings: SettingsState,
  systemInfo: SystemInfoState,
  actions: SettingsActions
}

class DisableEnigma extends Component<Props> {
  props: Props
  
	render() {
    const { t } = this.props
		return (
      <div className={cn(styles.enigmaContainer, this.props.className)}>
        <div className={styles.enigmaPage}>
          <img className={styles.statusImg} src={enigmaImg} alt="enigma icon" />
          <p className={this.props.systemInfo.blockchainInfo.enigma ? styles.enableTitle : styles.disabledTitle}>
            { this.props.systemInfo.blockchainInfo.enigma ? t('ENIGMA IS ENABLED') : t('ENIGMA IS DISABLED') }
          </p>
          <p>
            { this.props.systemInfo.blockchainInfo.enigma ? t('Press button to disable it') : t('Press button to enable it')}
          </p>
          <RoundedButton
            className={this.props.systemInfo.blockchainInfo.enigma ? styles.enigmaDisableBtn : styles.enigmaEnableBtn}
            onClick={() => this.props.actions.enableEnigma(!this.props.systemInfo.blockchainInfo.enigma)}
            important
            spinner={this.props.settings.isEnigmaChanging}
            disabled={this.props.settings.isEnigmaChanging}
          >
            { this.props.systemInfo.blockchainInfo.enigma ? t(`Disable ENIGMA`) : t(`Enable ENIGMA`) }
          </RoundedButton>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  settings: state.settings,
  systemInfo: state.systemInfo
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SettingsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('settings')(DisableEnigma))