// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import Status from '~/components/settings/status/Status'
import EncryptWallet from '~/components/settings/encrypt-wallet/EncryptWallet'
import LockWallet from '~/components/settings/lock-wallet/LockWallet'
import ChangePassphrase from '~/components/settings/change-passphrase/ChangePassphrase'
import DisableEnigma from '~/components/settings/disable-enigma/DisableEnigma'
import BackupWallet from '~/components/settings/backup-wallet/BackupWallet'

import styles from './settings.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { SystemInfoState } from '~/reducers/system-info/system-info.reducer'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'
import statusImg from '~/assets/images/main/settings/status.png';
import encryptWalletImg from '~/assets/images/main/settings/encrypt-wallet.png';
import encryptedWalletImg from '~/assets/images/main/settings/encrypted-wallet.png';
import lockWalletImg from '~/assets/images/main/settings/lock-wallet.png';
import lockedWalletImg from '~/assets/images/main/settings/locked-wallet.png';
import changePassphraseImg from '~/assets/images/main/settings/change-passphrase.png';
import enigmaOffImg from '~/assets/images/main/settings/enigma-off.png';
import enigmaOnImg from '~/assets/images/main/settings/enigma-on.png';
import backupWalletImg from '~/assets/images/main/settings/backup-wallet.png';

type Props = {
  t: any,
  systemInfo: SystemInfoState,
  settings: SettingsState,
  actions: SettingsActions,
}

/**
 * @class Settings
 * @extends {Component<Props>}
 */
class Settings extends Component<Props> {
  props: Props
  
  constructor(props) {
    super(props);
    this.state = {
      settingId: 'Status'
    }
  }

  getIsChildProcessUpdating(processName) {
    const processStatus = this.props.settings.childProcessesStatus[processName]
    const updateStatuses = ['STARTING', 'STOPPING', 'RESTARTING']
    return updateStatuses.indexOf(processStatus) !== -1
  }

  getStartStopLocalNodeButtonLabel() {
    const { t } = this.props
    const nodeStatus = this.props.settings.childProcessesStatus.NODE
    const startStatuses = ['NOT RUNNING', 'STARTING', 'FAILED']

    return startStatuses.indexOf(nodeStatus) !== -1
      ? t(`Start local node`)
      : t(`Stop local node`)
  }

  onChooseSetting = id => {
    this.setState({ settingId: id });
  }

  isNetworkActive() {
    return this.props.systemInfo.blockchainInfo.connections > 0
  }

  isEncryptedWallet() {
    return this.props.systemInfo.blockchainInfo.unlockedUntil !== null
  }

  isLockedWallet() {
    return this.props.systemInfo.blockchainInfo.unlockedUntil !== null && this.props.systemInfo.blockchainInfo.unlockedUntil < Date.now()
  }

  isEnigmaOn() {
    return this.props.systemInfo.blockchainInfo.anons > 0
  }

	render() {
    const { t } = this.props
    const settingItems = [
      {label: 'Status', icon: statusImg},
      {label: 'Encrypt wallet', icon: encryptWalletImg, inactive: this.isEncryptedWallet()},
      {label: 'Encrypted wallet', icon: encryptedWalletImg, inactive: !this.isEncryptedWallet()},
      {label: 'Lock wallet', icon: lockWalletImg, inactive: this.isLockedWallet()},
      {label: 'Unlock wallet', icon: lockedWalletImg, inactive: !this.isLockedWallet()},
      {label: 'Change passphrase', icon: changePassphraseImg},
      {label: 'Enable Enigma', icon: enigmaOffImg, inactive: this.isEnigmaOn()},
      {label: 'Disable Enigma', icon: enigmaOnImg, inactive: !this.isEnigmaOn()},
      {label: 'Backup wallet', icon: backupWalletImg},
    ]

		return (
			<div className={cn(styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer)}>
				<div className={cn(styles.settingsContainer, VLayout.vBoxChild, HLayout.hBoxContainer)}>
          <div className={styles.leftSide}>
            <div className={cn(styles.networkStatus, this.isNetworkActive() ? styles.active : '')}>
              {this.isNetworkActive() && (<p>{t('Connected')} / {this.props.systemInfo.blockchainInfo.connections}</p>)}
              {!this.isNetworkActive() && (<p>{t('Disconnected')}</p>)}
            </div>
            <div className={styles.settingItems}>
              {
                settingItems.map(item => {
                  if (item.inactive) {
                    return null
                  }
                  return (
                    <div className={cn(styles.item, styles.borderTop, this.state.settingId === item.label ? styles.active : '' )} key={item.label} onClick={() => this.onChooseSetting(item.label)}>
                      <img src={item.icon} alt="setting icon" />
                      <p>{item.label}</p>
                    </div>  
                  )})
              }
            </div>
          </div>
          <div className={styles.rightSide}>
            {this.state.settingId === 'Status' && <Status />}
            {this.state.settingId === 'Encrypt wallet' && <EncryptWallet />}
            {this.state.settingId === 'Encrypted wallet' && <EncryptWallet isEncrypted />}
            {this.state.settingId === 'Lock wallet' && <LockWallet />}
            {this.state.settingId === 'Unlock wallet' && <LockWallet isLocked />}
            {this.state.settingId === 'Change passphrase' && <ChangePassphrase />}
            {this.state.settingId === 'Enable Enigma' && <DisableEnigma isEnigmaDisabled />}
            {this.state.settingId === 'Disable Enigma' && <DisableEnigma />}
            {this.state.settingId === 'Backup wallet' && <BackupWallet />}
          </div>
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
  popupMenu: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('settings')(Settings))
