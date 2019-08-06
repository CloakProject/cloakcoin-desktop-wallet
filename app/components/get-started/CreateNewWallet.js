// @flow
import { userInfo } from 'os'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import classNames from 'classnames'
import * as Joi from 'joi'

import { getWalletNameJoi } from '~/utils/get-started'
import { CloakService } from '~/service/cloak-service'
import RoundedInput from '~/components/rounded-form/NewRoundedInput'
import RoundedForm from '~/components/rounded-form/RoundedForm'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './CreateNewWallet.scss'

const cloak = new CloakService()

const validationSchema = Joi.object().keys({
  walletName: getWalletNameJoi().walletName().fileDoesntExist(Joi.ref('walletPath')).required().label(`Wallet name`),
  walletPath: Joi.string().required().label(`Wallet path`)
})

type Props = {
  t: any,
  actions: object,
  getStartedActions: object,
	createNewWallet: object
}


/**
 * @class CreateNewWallet
 * @extends {Component<Props>}
 */
export class CreateNewWallet extends Component<Props> {
	props: Props

	/**
   * Triggers wallet generation.
   *
	 * @returns
   * @memberof App
	 */
  componentDidMount() {
    this.props.getStartedActions.setCreatingNewWallet(true)

    if (this.props.createNewWallet.wallet === null) {
      this.props.actions.generateWallet()
    }
  }

	/**
	 * @returns
   * @memberof CreateNewWallet
	 */
	render() {
    const { t } = this.props

		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.title}>{t(`Create a new wallet`)}</div>

        <div className={styles.hint}>{t(`Choose a name for your wallet`)}</div>

        <div className={styles.innerContainer}>
          <RoundedForm id="getStartedCreateNewWallet" schema={validationSchema}>

            <RoundedInput
              name="walletName"
              label={t(`Wallet name`)}
              labelClassName={styles.inputLabel}
              defaultValue={userInfo().username}
            />

            <RoundedInput
              name="walletPath"
              label={t(`Your wallet stored in`)}
              labelClassName={styles.inputLabel}
              defaultValue={cloak.getWalletPath()}
              readOnly
            />

            <NavLink className={styles.prevLink} to="/get-started/get-started" />

            <NavLink
              className={styles.nextLink}
              type="submit"
              role="button"
              to="/get-started/choose-password"
            />

          </RoundedForm>
        </div>


        <div className={styles.paginationDots}>
          <div className={styles.complete} />
          <div className={styles.empty} />
          <div className={styles.empty} />
        </div>
      </div>
    )
  }
}
