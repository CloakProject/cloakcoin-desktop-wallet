/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'
import styles from './DisableEnigma.scss'
import enigmaImg from '~/assets/images/main/settings/enigma.png';

type Props = {
  className?: string,
  isEnigmaDisabled?: boolean,
  t: any,
  settings: SettingsState,
  actions: SettingsActions
}

class DisableEnigma extends Component<Props> {
  props: Props
  
	render() {
    const { t } = this.props;
		return (
      <div className={cn(styles.enigmaContainer, this.props.className)}>
        <div className={styles.enigmaPage}>
          <img src={enigmaImg} alt="enigma icon" />
          <p className={this.props.isEnigmaDisabled ? styles.disabledTitle : styles.enableTitle}>
            { this.props.isEnigmaDisabled ? t('ENIGMA IS DISABLED') : t('ENIGMA IS ENABLED') }
          </p>
          <p>
            { this.props.isEnigmaDisabled ? t('press button to enable it') : t('press button to disable it')}
          </p>
          <button type="button" className={this.props.isEnigmaDisabled ? styles.enigmaEnableBtn : styles.enigmaDisabledBtn}>
            { this.props.isEnigmaDisabled ? t(`Enable ENIGMA`) : t(`Disable ENIGMA`) }
          </button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  systemInfo: state.systemInfo,
	settings: state.settings
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SettingsActions, dispatch),
})
export default connect(mapStateToProps, mapDispatchToProps)(translate('settings')(DisableEnigma))