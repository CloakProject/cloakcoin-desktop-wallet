// @flow
import moment from 'moment'
import { remote } from 'electron'
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { translate } from 'react-i18next'
import cn from 'classnames'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { getOS } from '~/utils/os'
import { ChildProcessService } from '~/service/child-process-service'
import { SystemInfoActions, SystemInfoState } from '~/reducers/system-info/system-info.reducer'
import { OptionsState } from '~/reducers/options/options.reducer'
import { getStore } from '~/store/configureStore'
import { State } from '~/reducers/types'

import HLayout from '~/assets/styles/h-box-layout.scss'
import statusStyles from '~/assets/styles/status-colors.scss'
import styles from './system-info.scss'

import enigmaOn from '~/assets/images/footer/enigma-on.png'
import encryptOn from '~/assets/images/footer/encrypt-on.png'
import lockOn from '~/assets/images/footer/lock-on.png'
import shieldOn from '~/assets/images/footer/shield-on.png'
import miningOn from '~/assets/images/footer/mining-on.png'
import updateOn from '~/assets/images/footer/update-on.png'
import connected1On from '~/assets/images/footer/connected1-on.png'
import connected2On from '~/assets/images/footer/connected2-on.png'
import connected3On from '~/assets/images/footer/connected3-on.png'
import connected4On from '~/assets/images/footer/connected4-on.png'
import connected5On from '~/assets/images/footer/connected5-on.png'

import enigmaOff from '~/assets/images/footer/enigma-off.png';
import encryptOff from '~/assets/images/footer/encrypt-off.png';
import lockOff from '~/assets/images/footer/lock-off.png';
import shieldOff from '~/assets/images/footer/shield-off.png';
import miningOff from '~/assets/images/footer/mining-off.png';
import updateOff from '~/assets/images/footer/update-download.png';
import connected1Off from '~/assets/images/footer/connected1-off.png'
import connected2Off from '~/assets/images/footer/connected2-off.png'
import connected3Off from '~/assets/images/footer/connected3-off.png'
import connected4Off from '~/assets/images/footer/connected4-off.png'
import connected5Off from '~/assets/images/footer/connected5-off.png'

const childProcess = new ChildProcessService()

const blockchainInfoPollingInterval = 10.0

type Props = {
  t: any,
  i18n: any,
	systemInfo: SystemInfoState,
	settings: SettingsState,
	options: OptionsState
}

class SystemInfo extends Component<Props> {
  props: Props
  
  componentDidMount() {
    const win = remote.getCurrentWindow()
    win.center()
  }

	/**
	 * @memberof SystemInfo
	 */
  getLocalNodeStatusClassNames() {
    // TODO: Replace with ChildProcessStatusIcon component
    const processStatus = this.props.settings.childProcessesStatus.NODE
    const statusClassNames = [styles.nodeStatusIcon]

    if (processStatus === 'RUNNING' || processStatus === 'STARTING') {
      statusClassNames.push('icon-status-running')
    } else {
      statusClassNames.push('icon-status-stop')
    }

    const color = childProcess.getChildProcessStatusColor(processStatus)

    if (color) {
      statusClassNames.push(statusStyles[color])
    }

    return statusClassNames.join(' ')
  }

  getWalletInFileManagerLabel() {
    const { t } = this.props
    return getOS() === 'windows' ? t(`Wallet in Explorer`) : t(`Wallet in Finder`)
  }

  onWalletInFileManagerClicked() {
    getStore().dispatch(SystemInfoActions.openWalletInFileManager())
    return false
  }

  onInstallationFolderClicked() {
    getStore().dispatch(SystemInfoActions.openInstallationFolder())
    return false
  }

	displayLastBlockTime(tempDate: Date | null) {
    const { t, i18n } = this.props
    return tempDate ? moment().locale(i18n.language).calendar(tempDate) : t(`N/A`)
  }

  isEnigmaOn() {
    return this.props.options.enigmaEnabled &&
            this.props.systemInfo.blockchainInfo.blockchainSynchronizedPercentage >= 100 &&
            this.isShielded()
  }
  
  isWalletEncryped() {
    return this.props.systemInfo.blockchainInfo.unlockedUntil !== null
  }

  isWalletLocked() {
    return this.props.systemInfo.blockchainInfo.unlockedUntil !== null && this.props.systemInfo.blockchainInfo.unlockedUntil.getTime() < Date.now()
  }

  isShielded() {
    return this.props.systemInfo.blockchainInfo.anons >= 5
  }

  isStaking() {
    return true
  }

  hasMatureCoin() {
    return this.props.systemInfo.blockchainInfo.weight
  }

  getMintEstimation() {
    return this.props.systemInfo.blockchainInfo.mintEstimation
  }

  isMinting() {
    return !this.isWalletLocked() &&
            this.isStaking() &&
            this.isConnected(1) && 
            this.isUpdated() && 
            this.hasMatureCoin() && 
            this.getMintEstimation() > 0
  }

  isUpdated() {
    return this.props.systemInfo.blockchainInfo.blockchainSynchronizedPercentage >= 100
  }

  isConnected(power: number) {
    return this.props.systemInfo.blockchainInfo.connections > ((power - 1) * 2)
  }

  isCloakServiceStarting() {
    return this.props.settings.childProcessesStatus && this.props.settings.childProcessesStatus.NODE === 'STARTING'
  }

  isCloakServiceRestarting() {
    return this.props.settings.childProcessesStatus && this.props.settings.childProcessesStatus.NODE === 'RESTARTING'
  }

  isCloakServiceRunning() {
    return this.props.settings.childProcessesStatus && this.props.settings.childProcessesStatus.NODE === 'RUNNING'
  }

  isCloakServiceStopping() {
    return this.props.settings.childProcessesStatus && this.props.settings.childProcessesStatus.NODE === 'STOPPING'
  }

  isCloakServiceNotRunning() {
    return !this.props.settings.childProcessesStatus || this.props.settings.childProcessesStatus.NODE === 'NOT RUNNING'
  }

  isCloakServiceFailed() {
    return this.props.settings.childProcessesStatus &&
          this.props.settings.childProcessesStatus.NODE !== 'STARTING' &&
          this.props.settings.childProcessesStatus.NODE !== 'RESTARTING' &&
          this.props.settings.childProcessesStatus.NODE !== 'RUNNING' &&
          this.props.settings.childProcessesStatus.NODE !== 'STOPPING' &&
          this.props.settings.childProcessesStatus.NODE !== 'NOT RUNNING'
  }

	/**
	 * @returns
	 * @memberof SystemInfo
	 */
	render() {
    const { t } = this.props

		return (
			<div className={cn(styles.systemInfoContainer, HLayout.hBoxContainer)}>
        <RpcPolling
          interval={blockchainInfoPollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: SystemInfoActions.getBlockchainInfo,
            success: SystemInfoActions.gotBlockchainInfo,
            failure: SystemInfoActions.getBlockchainInfoFailure
          }}
        />

				{ /* Status column container */}
				<div className={cn(styles.statusContainer, HLayout.hBoxChild)}>

					{ /* Cloak status coloumn */}
					{/* <div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>{t(`Cloak status`)}</div>
						<div className={styles.statusColoumnValue}>
              <span className={styles.nodeStatusContainer}>
                <i className={this.getLocalNodeStatusClassNames()} />
                <span>{t(childProcess.getStatusName(this.props.settings.childProcessesStatus.NODE))}</span>
              </span>
						</div>
					</div> */}

					{ /* Cloak status coloumn */}
          {this.isCloakServiceRunning() && this.props.systemInfo.blockchainInfo.blockchainSynchronizedPercentage < 100 && 
            (<div className={styles.statusColumnWrapper}>
						  <div className={styles.statusColoumnTitle}>{t(`Synchronizing`)}</div>
						  <div className={styles.statusColoumnValue}>{this.props.systemInfo.blockchainInfo.blockchainSynchronizedPercentage}%</div>
            </div>)}
          {this.isCloakServiceRunning() && this.props.systemInfo.blockchainInfo.blockchainSynchronizedPercentage >= 100 && 
            (<div className={styles.statusColoumnTitleSuccess}>{t(`Cloak Service Running`)}</div>)}
          {this.isCloakServiceStarting() && 
            (<div className={styles.statusColoumnTitleWarning}>{t(`Cloak Service Starting`)}</div>)}
          {this.isCloakServiceRestarting() && 
            (<div className={styles.statusColoumnTitleWarning}>{t(`Cloak Service Restarting`)}</div>)}
          {this.isCloakServiceStopping() && 
            (<div className={styles.statusColoumnTitleWarning}>{t(`Cloak Service Stopping`)}</div>)}
          {this.isCloakServiceFailed() && 
            (<div className={styles.statusColoumnTitleError}>{t(`Cloak Service Failed`)}</div>)}
          {this.isCloakServiceNotRunning() && 
            (<div className={styles.statusColoumnTitleError}>{t(`Cloak Service Not Running`)}</div>)}

				</div>

        <div className={styles.statusButtonsContainer}>
          <img src={this.isEnigmaOn() ? enigmaOn : enigmaOff} alt="status icon" />
          <img src={this.isWalletEncryped() ? encryptOn : encryptOff} alt="status icon" />
          <img src={this.isWalletLocked() ? lockOn : lockOff} alt="status icon" />
          <img src={this.isShielded() ? shieldOn : shieldOff} alt="status icon" />
          <img src={this.isMinting() ? miningOn : miningOff} alt="status icon" />
          <img src={this.isUpdated() ? updateOn : updateOff} alt="status icon" />
          <div className={styles.connectionsContainer}>
            <img src={this.isConnected(1) ? connected1On : connected1Off} alt="status icon" />
            <img src={this.isConnected(2) ? connected2On : connected2Off} alt="status icon" />
            <img src={this.isConnected(3) ? connected3On : connected3Off} alt="status icon" />
            <img src={this.isConnected(4) ? connected4On : connected4Off} alt="status icon" />
            <img src={this.isConnected(5) ? connected5On : connected5Off} alt="status icon" />
          </div>
        </div>

			</div>
		)
	}
}


const mapStateToProps = (state: State) => ({
	systemInfo: state.systemInfo,
  settings: state.settings,
  options: state.options
})

export default connect(mapStateToProps, null)(translate('other')(SystemInfo))
