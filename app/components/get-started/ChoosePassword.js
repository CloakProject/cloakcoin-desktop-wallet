// @flow
import React, { Component } from 'react'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'
import * as Joi from 'joi'

import { getPasswordValidationSchema } from '~/utils/auth'
import RoundedInput from '~/components/rounded-form/NewRoundedInput'
import RoundedForm from '~/components/rounded-form/RoundedForm'
import PasswordStrength from '~/components/password-strength/PasswordStrength'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './ChoosePassword.scss'

type Props = {
  t: any,
  getStarted: object,
  form: object
}


/**
 * @class ChoosePassword
 * @extends {Component<Props>}
 */
export class ChoosePassword extends Component<Props> {
	props: Props

  getValidationSchema() {
    const { t } = this.props

    const schema = Joi.object().keys({
      password: getPasswordValidationSchema(),
      confirmPassword: (
        Joi.string().required().valid(Joi.ref('password'))
        .label(t(`Confirm password`))
        .options({
          language: {
            any: {
              allowOnly: `!!${t('Passwords do not match')}`,
            }
          }
        })
      )
    })

    return schema
  }

	/**
	 * @returns
   * @memberof ChoosePassword
	 */
	render() {
    const { t } = this.props
    const prevPath = this.props.getStarted.isCreatingNewWallet ? 'create-new-wallet' : 'restore-your-wallet'

		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.title}>{t(`Choose password for your wallet`)}</div>

        <div className={styles.hint}>{t(`Enter a strong password (using letters, numbers and/or symbols)`)}</div>

        <div className={styles.innerContainer}>
          <RoundedForm id="getStartedChoosePassword" schema={this.getValidationSchema()}>

            <RoundedInput
              name="password"
              labelClassName={styles.inputLabel}
              type="password"
              label={t(`Password`)}
            />

            <RoundedInput
              name="confirmPassword"
              labelClassName={styles.inputLabel}
              type="password"
              label={t(`Confirm password`)}
            />

            <div className={styles.note}>
              <strong>{t('Note')}: </strong>
              {t('choose-password-note')}
            </div>

            <PasswordStrength password={this.props.form && this.props.form.fields.password} />

            <NavLink className={styles.prevLink} to={`/get-started/${prevPath}`} />
            <NavLink className={styles.nextLink} type="submit" role="button" to="/get-started/welcome" />

          </RoundedForm>
        </div>

        <div className={styles.paginationDots}>
          <div className={styles.complete} />
          <div className={styles.complete} />
          <div className={styles.empty} />
        </div>

      </div>
    )
  }
}

