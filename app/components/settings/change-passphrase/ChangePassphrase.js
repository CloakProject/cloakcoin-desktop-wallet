/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import * as Joi from 'joi'
import {
  RoundedForm,
  RoundedButton,
  RoundedInput,
} from '~/components/rounded-form'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'
import styles from './ChangePassphrase.scss'
import changepassphraseImg from '~/assets/images/main/settings/change-passphrase-icon.png';
import { getPasswordValidationSchema } from '~/utils/auth'
import { RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'

const getValidationSchema = t => Joi.object().keys({
  oldPassphrase: getPasswordValidationSchema(),
  newPassphrase: getPasswordValidationSchema(),
  repeatPassphrase: (
    Joi.string().required().valid(Joi.ref('newPassphrase'))
    .label(t(`Repeat passphrase`))
    .options({
      language: {
        any: {
          allowOnly: `!!${t('Passphrases do not match')}`,
        }
      }
    })
  )
})

type Props = {
  className?: string,
  t: any,
  settings: SettingsState,
  actions: SettingsActions
}

class ChangePassphrase extends Component<Props> {
  props: Props

  componentDidUpdate(prevProps) {
    if (prevProps.settings.isPassphraseChanging !== this.props.settings.isPassphraseChanging && !this.props.settings.isPassphraseChanging && this.props.settings.isPassphraseChanged) {
      this.props.formActions.updateFields('settingsChangePassphrase', {}, false)
    }
  }
  
	render() {
    const { t } = this.props;
		return (
      <div className={cn(styles.changePassphraseContainer, this.props.className)}>
        <div className={styles.changePassphrasePage}>
          <img className={styles.statusImg} src={changepassphraseImg} alt="lock icon" />
          <div className={styles.description}>
            <p>{t('Change the passphrase')}</p>
          </div>
          <RoundedForm
            className={styles.form}
            id="settingsChangePassphrase"
            schema={getValidationSchema(t)}
            defaultValues={{}}
          >
            <div className={styles.passphraseInput}>
              <div className={styles.passphrase}>
                <RoundedInput
                  type="password"
                  name="oldPassphrase"
                  placeholder="Enter passphrase"
                />
              </div>
              <div className={styles.passphrase}>
                <RoundedInput
                  type="password"
                  name="newPassphrase"
                  placeholder="Enter new passphrase"
                />
              </div>
              <div className={styles.passphrase}>
                <RoundedInput
                  type="password"
                  name="repeatPassphrase"
                  placeholder="Repeat new passphrase"
                />
              </div>
              <RoundedButton
                type="submit"
                onClick={this.props.actions.changePassphrase}
                important
                spinner={this.props.settings.isPassphraseChanging}
                disabled={this.props.settings.isPassphraseChanging}
              >
                {t(`Change passphrase`)}
              </RoundedButton>
            </div>
          </RoundedForm>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  systemInfo: state.systemInfo,
	settings: state.settings
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SettingsActions, dispatch),
  formActions: bindActionCreators(RoundedFormActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('settings')(ChangePassphrase))