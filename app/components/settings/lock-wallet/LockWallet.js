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
import styles from './LockWallet.scss'
import lockedImg from '~/assets/images/main/settings/locked-wallet-icon.png';
import unlockedImg from '~/assets/images/main/settings/unlocked-wallet-icon.png';
import checkmarkImg from '~/assets/images/main/send/checkmark.png';
import { getPasswordValidationSchema } from '~/utils/auth'

const getValidationSchema = t => Joi.object().keys({
  passphrase: getPasswordValidationSchema()
})

type Props = {
  className?: string,
  isLocked?: boolean,
  t: any,
  settings: SettingsState,
  actions: SettingsActions
}

class LockWallet extends Component<Props> {
  props: Props
  
  constructor(props) {
		super(props);
		this.state = {
			isCloaking: false
		};
  }

  componentDidMount() {
    this.props.settings.isWalletLocked = this.props.isLocked
  }
  
  selectCloakingOption = () => {
		const { isCloaking } = this.state;
		this.setState({ isCloaking: !isCloaking });
  }
  
	render() {
    const { t } = this.props;
		return (
      <div className={cn(styles.lockWalletContainer, this.props.className)}>
        {
          (!this.props.isLocked && !this.props.settings.isWalletLocked) && (
            <div className={styles.lockPage}>
              <img src={unlockedImg} alt="unlock icon" />
              <p>{t('THE WALLET IS UNLOCKED')}</p>
              <p>{t('Press the button to lock it')}</p>
              <p>{t('Minting will be stopped')}</p>
                <RoundedButton
                  className={styles.savePasswordButton}
                  onClick={this.props.actions.lockWallet}
                  important
                  spinner={this.props.settings.isWalletLocking}
                  disabled={this.props.settings.isWalletLocking}
                >
                  {t(`Lock wallet`)}
                </RoundedButton>
            </div>
          )
        }
        {
          (this.props.isLocked && this.props.settings.isWalletLocked) && (
            <div className={styles.unlockPage}>
              <img src={lockedImg} alt="lock icon" />
              <div className={styles.description}>
                <p>{t('THE WALLET IS LOCKED')}</p>
                <p>{t('enter your passphrase to unlock it')}</p>
                <p>{t('and start minting coins')}</p>
              </div>
              <RoundedForm
                className={styles.form}
                id="settingsUnlockWallet"
                schema={getValidationSchema(t)}
              >
                <div className={styles.passphraseInput}>
                  <div className={styles.passphrase}>
                    <RoundedInput
                      type="password"
                      name="passphrase"
                      placeholder="Enter passphrase"
                    />
                  </div>
                  {/* <div className={styles.checkboxInput}>
                    <div className={styles.checkmark} onClick={this.selectCloakingOption} >
                      {this.state.isCloaking && <img src={checkmarkImg} alt="img" /> }
                    </div>
                    <span>{t('for cloaking and staking only')}</span>
                  </div> */}
                  <RoundedButton
                    type="submit"
                    className={styles.savePasswordButton}
                    onClick={this.props.actions.unlockWallet}
                    important
                    spinner={this.props.settings.isWalletUnlocking}
                    disabled={this.props.settings.isWalletUnlocking}
                  >
                    {t(`Unlock wallet`)}
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
export default connect(mapStateToProps, mapDispatchToProps)(translate('settings')(LockWallet))