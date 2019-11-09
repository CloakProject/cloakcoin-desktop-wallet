/* eslint-disable react/prop-types */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
// @flow
import { remote, ipcRenderer } from 'electron'
import React, { Component } from 'react'
import { push } from 'react-router-redux'
import { NavLink } from 'react-router-dom'
import cn from 'classnames'
import { getStore } from '../../store/configureStore'
import { FetchLdbState, FetchLdbActions } from '~/reducers/fetch-ldb/fetch-ldb.reducer'
import { SettingsState, SettingsActions } from '~/reducers/settings/settings.reducer'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './Welcome.scss'
import splashLogo from '~/assets/images/about/splash_logo.png'
import enigmaLogo from '~/assets/images/about/enigma_logo.png'
import {
  RoundedButton
} from '~/components/rounded-form'

type Props = {
  t: any,
  fetchLdb: FetchLdbState, 
  settings: SettingsState
}

/**
 * @class Welcome
 * @extends {Component<Props>}
 */

export class Welcome extends Component<Props> {
	props: Props

  componentDidMount() {
    if (!this.props.fetchLdb.isDownloadComplete) {
      getStore().dispatch(FetchLdbActions.fetchPrompt())
    } else {
      getStore().dispatch(SettingsActions.kickOffChildProcesses())
    }

    ipcRenderer.on('cleanup', () => this.cleanup())
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fetchLdb.isDownloadComplete !== this.props.fetchLdb.isDownloadComplete
       && this.props.fetchLdb.isDownloadComplete) {
      getStore().dispatch(SettingsActions.kickOffChildProcesses())
    }
  }

  cleanup() {
    getStore().dispatch(SettingsActions.stopChildProcesses())
  }

  mainPage = () => {
    this.props.actions.useCloak()
  }

  prepairingStatus = () => {
    if (this.props.settings.childProcessesStatus && this.props.settings.childProcessesStatus.NODE === 'STARTING') {
      return this.props.t(`Loading Block`)
    }
    if (this.props.settings.childProcessesStatus && this.props.settings.childProcessesStatus.NODE === 'FAILED') {
      return this.props.t(`Cloak Service Failed`)
    }
    if (this.props.fetchLdb.progressRate > 0) {
      return this.props.t(`Downloading Blockchain {{progress}}`, {progress: this.props.fetchLdb.progressRate.toFixed(2) || 0})
    }
    return this.props.t(`Checking blockchain files...`)
  }

	render() {
    if (this.props.settings.childProcessesStatus && this.props.settings.childProcessesStatus.NODE === 'RUNNING') {
      this.mainPage()
      return null
    }

    return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={cn(styles.splash_container)}>
          <img className={cn(styles.logo_img)} src={splashLogo} alt="img" />
          <div className={cn(styles.enigma_brand)}>
            <span>{this.props.t('Powered by')}</span>
            <img src={enigmaLogo} alt="img"/>
          </div>
          <p className={cn(styles.cloak_core)}>{this.props.t('CLOAK Core')}</p>
          <p className={cn(styles.wallet_version)}>{this.props.t('Wallet Version')}</p>
          <p className={cn(styles.enigma_version)}>{this.props.t('Enigma Version')}</p>
          <p className={cn(styles.copy_right)}>{this.props.t('Copy Right Bitcoin')}</p>
          <p className={cn(styles.copy_right)}>{this.props.t('Copy Right Cloak')}</p>
          <p className={cn(styles.prepairing_status)}>{this.prepairingStatus()}</p>
        </div>
      </div>
    )
  }
}
