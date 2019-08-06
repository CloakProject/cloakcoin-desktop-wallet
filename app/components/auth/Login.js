// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import * as Joi from 'joi'
import cn from 'classnames'

import { getPasswordValidationSchema } from '~/utils/auth'
import { SettingsState } from '~/reducers/settings/settings.reducer'
import { AuthState, AuthActions } from '~/reducers/auth/auth.reducer'
import TitleBarButtons, { DragBar } from '~/components/title-bar-buttons/TitleBarButtons'
import { RoundedForm, RoundedButton, RoundedInput } from '~/components/rounded-form'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import cloakLogo from '~/assets/images/logo-full.svg'
import styles from './Login.scss'

const getValidationSchema = () => Joi.object().keys({
  password: getPasswordValidationSchema()
})

type Props = {
  t: any,
  auth: AuthState,
  settings: SettingsState,
  actions: object
}

/**
 * @class Login
 * @extends {Component<Props>}
 */
class Login extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof Login
	 */
	render() {
    const { t } = this.props
    const isNodeRunning = this.props.settings.childProcessesStatus.NODE === 'RUNNING'

    return (
      <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
        <TitleBarButtons />
        <DragBar />

        <div className={styles.dragBar} />

        <div className={cn(styles.header)}>
          <img src={cloakLogo} alt="cloak" />
        </div>

        {this.props.auth.reason &&
          <div className={styles.reason}>
            {this.props.auth.reason}
          </div>
        }

        <RoundedForm id="authLogin" schema={getValidationSchema()} className={styles.form}>
          <RoundedInput
            name="password"
            type="password"
            placeholder={t(`Enter your password`)}
            large
          />

          <RoundedButton
            type="submit"
            className={styles.loginButton}
            onClick={this.props.actions.submitPassword}
            tooltip={isNodeRunning ? null : t(`Waiting for the daemon...`)}
            spinner={!isNodeRunning}
            disabled={!isNodeRunning}
            important
            large
          >
            {t(`Login`)}
          </RoundedButton>
        </RoundedForm>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  settings: state.settings,
  form: state.roundedForm.authLogin
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(AuthActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('other')(Login))
