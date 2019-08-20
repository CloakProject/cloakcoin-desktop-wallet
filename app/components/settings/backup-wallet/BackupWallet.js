/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'
import styles from './BackupWallet.scss'
import backupImg from '~/assets/images/main/settings/backup.png';

type Props = {
  className?: string,
  t: any,
  settings: SettingsState,
  actions: SettingsActions
}

class BackupWallet extends Component<Props> {
  props: Props
  
	render() {
    const { t } = this.props;
		return (
      <div className={cn(styles.backupContainer, this.props.className)}>
        <div className={styles.backupPage}>
          <img src={backupImg} alt="enigma icon" />
          <p>{ t('Backup file') }</p>
          <button type="button">
            {t(`Backup wallet`)}
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
export default connect(mapStateToProps, mapDispatchToProps)(translate('settings')(BackupWallet))