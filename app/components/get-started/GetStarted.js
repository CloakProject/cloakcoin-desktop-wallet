// @flow
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import cn from 'classnames'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './GetStarted.scss'

type Props = {
  t: any
}


/**
 * @class GetStarted
 * @extends {Component<Props>}
 */
export class GetStarted extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof GetStarted
	 */
	render() {
    const { t } = this.props

		return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.title}>{t(`Get started with Cloak`)}</div>

        <div className={styles.hint}>{t(`Please select one of the following options`)}:</div>

        <div className={cn(styles.innerContainer, styles.flowLinksContainer)}>
          <NavLink className={styles.chooseFlowLink} to="/get-started/create-new-wallet">
            <i className={styles.createNewWalletIcon } />
            {t(`Create a new wallet`)}
          </NavLink>

          <NavLink className={styles.chooseFlowLink} to="/get-started/restore-your-wallet">
            <i className={styles.restoreYourWalletIcon } />
            {t(`Restore wallet from backup`)}
          </NavLink>
        </div>

        <NavLink className={styles.prevLink} to="/get-started/choose-language" />
      </div>
    )
  }
}
