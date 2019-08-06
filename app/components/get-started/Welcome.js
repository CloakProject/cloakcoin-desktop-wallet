/* eslint-disable react/prop-types */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
// @flow
import { remote } from 'electron'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import cn from 'classnames'
// import { CloakService } from '~/service/cloak-service'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './Welcome.scss'
import splashLogo from '~/assets/images/about/splash_logo.png'
import aboutLogo from '~/assets/images/about/about_logo.png'
import enigmaLogo from '~/assets/images/about/enigma_logo.png'
import {
  RoundedButton
} from '~/components/rounded-form'
// const cloak = new CloakService()
type Props = {
  t: any
}

const Splash = props => {
  return (
    <div className={cn(styles.splash_container)}>
      <img className={cn(styles.logo_img)} src={splashLogo} alt="img" />
      <div className={cn(styles.enigma_brand)}>
        <span>{props.t('Powered by')}</span>
        <img src={enigmaLogo} alt="img"/>
      </div>
      <p className={cn(styles.cloak_core)}>{props.t('CLOAK Core')}</p>
      <p className={cn(styles.enigma_version)}>{props.t('Enigma Version')}</p>
      <p className={cn(styles.copy_right)}>{props.t('Copy Right Bitcoin')}</p>
      <p className={cn(styles.copy_right)}>{props.t('Copy Right Cloak')}</p>
      <p className={cn(styles.loading_block)}>{props.t('Loading Block')}</p>
    </div>
  )
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
    this.state = {
      isCompletedBlockLoading: false,
    }
    this.nodeConfig = remote.getGlobal('cloakNodeConfig')
    setTimeout(() => {
      this.setState({ isCompletedBlockLoading: true });
    }, 2000)
  }

  mainPage = () => {
    this.props.actions.useCloak()
  }

	render() {
    const { t } = this.props

		return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        {!this.state.isCompletedBlockLoading ? <Splash t={t} /> : <About t={t} mainPage={this.mainPage} />}
      </div>
    )
  }
}
