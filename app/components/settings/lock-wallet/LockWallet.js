/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'
import styles from './LockWallet.scss'
import unlockImg from '~/assets/images/main/settings/unlock.png';
import lockImg from '~/assets/images/main/settings/lock.png';
import checkmarkImg from '~/assets/images/main/send/checkmark.png';

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
  
  selectCloakingOption = () => {
		const { isCloaking } = this.state;
		this.setState({ isCloaking: !isCloaking });
  }
  
	render() {
    const { t } = this.props;
		return (
      <div className={cn(styles.lockWalletContainer, this.props.className)}>
        {
          !this.props.isLocked && (
            <div className={styles.lockPage}>
              <img src={unlockImg} alt="unlock icon" />
              <p>{t('THE WALLET IS UNLOCKED')}</p>
              <p>{t('press the button to lock it')}</p>
              <p>{t('Minting will be stopped')}</p>
              <button type="button">
                {t(`Lock wallet`)}
              </button>
            </div>
          )
        }
        {
          this.props.isLocked && (
            <div className={styles.unlockPage}>
              <img src={lockImg} alt="lock icon" />
              <div className={styles.description}>
                <p>{t('THE WALLET IS LOCKED')}</p>
                <p>{t('enter your passphrase to unlock it')}</p>
                <p>{t('and start minting coins')}</p>
              </div>
              <div className={styles.passphraseInput}>
                <div className={styles.passphrase}>
                  <RoundedInput
                    name="passphrase"
                    placeholder="Enter passphrase"
                  />
                </div>
                <div className={styles.checkboxInput}>
                  <div className={styles.checkmark} onClick={this.selectCloakingOption} >
                    {this.state.isCloaking && <img src={checkmarkImg} alt="img" /> }
                  </div>
                  <span>{t('for cloaking and staking only')}</span>
                </div>
                <button type="button">
                  {t(`Unlock wallet`)}
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
export default connect(mapStateToProps, mapDispatchToProps)(translate('settings')(LockWallet))