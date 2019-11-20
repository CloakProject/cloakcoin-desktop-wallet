/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import { RoundedButton } from '~/components/rounded-form'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'
import styles from './BackupWallet.scss'
import backupImg from '~/assets/images/main/settings/backup-wallet-icon.png';

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
          <img className={styles.statusImg} src={backupImg} alt="enigma icon" />
          <p>{ t('Press the button to create a backup file of your wallet') }</p>
          <p>{ t('Make sure you store it in a safe place') }</p>
          <RoundedButton
            onClick={this.props.actions.initiateWalletBackup}
            important
            spinner={this.props.settings.isWalletBackingup}
            disabled={this.props.settings.isWalletBackingup || this.props.settings.childProcessesStatus.NODE !== 'RUNNING'}
          >
            {t(`Backup wallet`)}
          </RoundedButton>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
	settings: state.settings
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SettingsActions, dispatch),
})
export default connect(mapStateToProps, mapDispatchToProps)(translate('settings')(BackupWallet))