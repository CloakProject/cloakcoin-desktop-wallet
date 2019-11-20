// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import * as Joi from 'joi'

import styles from './PassphrasePrompt.scss'
import {
  RoundedInput,
  RoundedButton,
  RoundedForm
} from '~/components/rounded-form'
import { getPasswordValidationSchema } from '~/utils/auth'

const getValidationSchema = () => Joi.object().keys({
  passphrase: getPasswordValidationSchema(),
})

type Props = {
  t: any
}

/**
 * @class PassphrasePrompt
 * @extends {Component<Props>}
 */
class PassphrasePrompt extends Component<Props> {
  props: Props
  
	render() {
    const { t, isVisible, onOk, onCancel } = this.props
    if (!isVisible) {
      return null
    }

		return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.passphrasePrompt)}>
          <RoundedForm
						id="passphrasePromptForm"
						schema={getValidationSchema(t)}
						options={{abortEarly: true}}
						defaultValues={{passphrase: ''}}
					>
            <p>{t(`Please enter passphrase to send cash`)}</p>
            <RoundedInput
              type="password"
              name="passphrase"
              className={styles.passphrase}
              placeholder={t(`Enter passphrase`)}
            />
            <div className={cn(styles.actions)}>
              <RoundedButton
                className={styles.okButton}
                type="submit"
                onClick={() => onOk(this.props.passphrasePromptForm.fields.passphrase)}
                important
              >
                {t(`Ok`)}
              </RoundedButton>
              <RoundedButton
                className={styles.cancelButton}
                type="button"
                onClick={() => onCancel()}
                important
              >
                {t(`Cancel`)}
              </RoundedButton>
            </div>
          </RoundedForm>
        </div>
      </div>
		)
	}
}

const mapStateToProps = state => ({
  passphrasePromptForm: state.roundedForm.passphrasePromptForm
})

export default connect(mapStateToProps, null)(translate('send-cash')(PassphrasePrompt))