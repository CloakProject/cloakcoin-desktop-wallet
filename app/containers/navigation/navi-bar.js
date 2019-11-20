/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { SettingsState } from '~/reducers/settings/settings.reducer'
import { ChildProcessService } from '~/service/child-process-service'
import { NaviState } from '~/reducers/navi/navi.reducer'

import logo from '~/assets/images/about/about_logo.png';
import overview from '~/assets/images/main/overview.png';
import send from '~/assets/images/main/send.png';
import receive from '~/assets/images/main/receive.png';
import transaction from '~/assets/images/main/transaction.png';
import addressbook from '~/assets/images/main/addressbook.png';
import enigma from '~/assets/images/main/enigma.png';
import byob from '~/assets/images/main/byob.png';
import setting from '~/assets/images/main/setting.png';

import HLayout from '~/assets/styles/h-box-layout.scss'
import statusStyles from '~/assets/styles/status-colors.scss'
import styles from './navi-bar.scss'


const childProcess = new ChildProcessService()

type Props = {
  t: any,
	navi: NaviState,
	settings: SettingsState
}

class NaviBar extends Component<Props> {
	props: Props

  handleClickDisabled = (e) => {
    e.preventDefault()
  }

	render() {
    const { t } = this.props

    const getItemClasses = path => ({
      [HLayout.hBoxContainer]: true,
      [styles.item]: true,
      [styles.active]: this.props.navi.currentNaviPath.startsWith(path)
    })

		return (
			<div className={cn(styles.container)} data-tid="navi-bar-container">
        <img className={styles.logo} src={logo} alt="logo" />
        <div>
          <div className={cn(styles.overview, getItemClasses('/overview'))}>
            <NavLink to="/">
              <img src={overview} alt="navImage" />
              <p>{t(`Overview`)}</p>
            </NavLink>
          </div>
          <div className={cn(styles.sendCash, getItemClasses('/send-cash'))}>
            <NavLink to="/send-cash">
              <img src={send} alt="navImage" />
              <p>{t(`Send Cash`)}</p>
            </NavLink>
          </div>
          <div className={cn(styles.receiveCash, getItemClasses('/receive-cash'))}>
            <NavLink to="/receive-cash">
              <img src={receive} alt="navImage" />
              <p>{t(`Receive Cash`)}</p>
            </NavLink>
          </div>
          <div className={cn(styles.transactionCash, getItemClasses('/transaction-cash'))}>
            <NavLink to="/transaction-cash">
              <img src={transaction} alt="navImage" />
              <p>{t(`Transaction Cash`)}</p>
            </NavLink>
          </div>
          <div className={cn(styles.addressBook, getItemClasses('/address-book'))}>
            <NavLink to="/address-book">
              <img src={addressbook} alt="navImage" />
              <p>{t(`Address Book`)}</p>
            </NavLink>
          </div>
          <div className={cn(styles.enigmaStats, getItemClasses('/enigma-stats'))}>
            <NavLink to="/enigma-stats">
              <img src={enigma} alt="navImage" />
              <p>{t(`Enigma Stats`)}</p>
            </NavLink>
          </div>
          <div className={cn(styles.byob, getItemClasses('/byob'))}>
            <NavLink to="/byob" onClick={this.handleClickDisabled}>
              <img src={byob} alt="navImage" />
              <p>{t(`BYOB`)}</p>
            </NavLink>
          </div>
          <div className={cn(styles.settings, getItemClasses('/settings'))}>
            <NavLink to="/settings">
              <img src={setting} alt="navImage" />
              <p>{t(`Settings`)}</p>
            </NavLink>
          </div>
        </div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	navi: state.navi,
	settings: state.settings
})

export default connect(mapStateToProps, null)(translate('other')(NaviBar))
