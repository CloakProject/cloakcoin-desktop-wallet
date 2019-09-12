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
import styles from './EncryptWallet.scss'
import encryptWalletImg from '~/assets/images/main/settings/encrypt-wallet-icon.png';
import { getPasswordValidationSchema } from '~/utils/auth'

const getValidationSchema = t => Joi.object().keys({
  newPassword: getPasswordValidationSchema(),
  repeatPassword: (
    Joi.string().required().valid(Joi.ref('newPassword'))
    .label(t(`Repeat password`))
    .options({
      language: {
        any: {
          allowOnly: `!!${t('Passwords do not match')}`,
        }
      }
    })
  )
})

type Props = {
  className?: string,
  isEncrypted?: boolean,
  t: any,
  settings: SettingsState,
  actions: SettingsActions
}

class EncryptWallet extends Component<Props> {
	props: Props
    
	render() {
    const { t } = this.props;
		return (
      <div className={cn(styles.encryptWalletContainer, this.props.className)}>
        {
          (this.props.isEncrypted || this.props.settings.isWalletEncrypted) && (
            <div className={styles.encryptedPage}>
              <img src={encryptWalletImg} alt="encrypted icon" />
              <p>{t('THE WALLET IS ENCRYPTED')}</p>
            </div>
          )
        }
        {
          (!this.props.isEncrypted && !this.props.settings.isWalletEncrypted) && (
            <div className={styles.encryptPage}>
              <img src={encryptWalletImg} alt="encrypted icon" />
              <div className={styles.description}>
                <p>{t('Enter the passphrase fot the wallet.')}</p>
                <p>
                  {t('Plase use a passphrase of')}
                  <span>&nbsp;{t('10 or more random characters')}</span>
                  &nbsp;{t('or')}&nbsp;
                  <span>{t('8 or more words')}</span>
                </p>
              </div>
              <RoundedForm
                className={styles.form}
                id="settingsEncryptWallet"
                schema={getValidationSchema(t)}
              >
                <div className={styles.encryptWalletInput}>
                  <div className={styles.newPassword}>
                    <p>{t('Enter new passphrase')}</p>
                    <RoundedInput
                      type="password"
                      labelClassName={styles.inputLabel}
                      name="newPassword"
                      placeholder={t(`New password`)}
                    />
                  </div>
                  <div className={styles.confirmPassword}>
                    <p>{t('Repeat new passphrase')}</p>
                    <RoundedInput
                      type="password"
                      name="repeatPassword"
                      placeholder={t(`Repeat new password`)}
                    />
                  </div>
                  <RoundedButton
                    type="submit"
                    className={styles.savePasswordButton}
                    onClick={this.props.actions.encryptWallet}
                    important
                    spinner={this.props.settings.isWalletEncrypting}
                    disabled={this.props.settings.isWalletEncrypting}
                  >
                    {t(`Encrypt wallet`)}
                  </RoundedButton>
                </div>
              </RoundedForm>
            </div>
          )
        }
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
})
export default connect(mapStateToProps, mapDispatchToProps)(translate('settings')(EncryptWallet))