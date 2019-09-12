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
import aboutLogo from '~/assets/images/about/about_logo.png'
import enigmaLogo from '~/assets/images/about/enigma_logo.png'
import {
  RoundedButton
} from '~/components/rounded-form'

type Props = {
  t: any,
  fetchLdb: FetchLdbState, 
  settings: SettingsState
}

const About = props => {
  return (
    <div className={cn(styles.about_container)}>
      <img className={cn(styles.logo_img)} src={aboutLogo} alt="img" />
      <p className={cn(styles.cloak_coin)}>{props.t('CloakCoin')}</p>
      <p className={cn(styles.revolution_stormfix)}>{props.t('Revolution stormfix')}</p>
      <p className={cn(styles.copy_right)}>{props.t('Copy Right Bitcoin')}</p>
      <p className={cn(styles.copy_right)}>{props.t('Copy Right Cloak')}</p>
      <div className={cn(styles.description)}>
        <p className={cn(styles.about_description)}>{props.t('About Description1')}</p>
        <p className={cn(styles.about_description)}>{props.t('About Description2')}</p>
        <p className={cn(styles.about_description)}>{props.t('About Description3')}</p>
      </div>
      <RoundedButton
        className={styles.button}
        onClick={props.mainPage}
      >
        {props.t(`About OK`)}
      </RoundedButton>
    </div>
  )
}

/**
 * @class Welcome
 * @extends {Component<Props>}
 */

export class Welcome extends Component<Props> {
	props: Props
  nodeConfig: object

  constructor(props) {
    super(props)
    this.nodeConfig = remote.getGlobal('cloakNodeConfig')
  }

  componentDidMount() {
    if (!this.props.fetchLdb.isDownloadComplete) {
      getStore().dispatch(FetchLdbActions.fetch())
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
    if (this.props.fetchLdb.progressRate < 100) {
      return this.props.t(`Downloading Blockchain {{progress}}`, {progress: this.props.fetchLdb.progressRate.toFixed(2) || 0})
    }
    if (this.props.fetchLdb.progressRate >= 100) {
      return this.props.t(`Extracting Blockchain`)
    }
    return this.props.t(`Loading Block`)
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
          <p className={cn(styles.enigma_version)}>{this.props.t('Enigma Version')}</p>
          <p className={cn(styles.copy_right)}>{this.props.t('Copy Right Bitcoin')}</p>
          <p className={cn(styles.copy_right)}>{this.props.t('Copy Right Cloak')}</p>
          <p className={cn(styles.prepairing_status)}>{this.prepairingStatus()}</p>
        </div>
      </div>
    )
  }
}
