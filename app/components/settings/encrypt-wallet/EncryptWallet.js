/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'
import styles from './EncryptWallet.scss'
import encryptedWalletImg from '~/assets/images/main/settings/encrypted-wallet.png';

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
          this.props.isEncrypted && (
            <div className={styles.encryptedPage}>
              <img src={encryptedWalletImg} alt="encrypted icon" />
              <p>{t('THE WALLET IS ENCRYPTED')}</p>
            </div>
          )
        }
        {
          !this.props.isEncrypted && (
            <div className={styles.encryptPage}>
              <img src={encryptedWalletImg} alt="encrypted icon" />
              <div className={styles.description}>
                <p>{t('Enter the passphrase fot the wallet.')}</p>
                <p>
                  {t('Plase use a passphrase of')}
                  <span>&nbsp;{t('10 or more random characters')}</span>
                  &nbsp;{t('or')}&nbsp;
                  <span>{t('8 or more words')}</span>
                </p>
              </div>
              <div className={styles.encryptWalletInput}>
                <div className={styles.newPassword}>
                  <p>{t('Enter new passphrase')}</p>
                  <RoundedInput
                    name="newpassword"
                  />
                </div>
                <div className={styles.confirmPassword}>
                  <p>{t('Repeat new passphrase')}</p>
                  <RoundedInput
                    name="confirmpassword"
                  />
                </div>
                <button type="button">
                  {t(`Encrypt wallet`)}
                </button>
              </div>
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