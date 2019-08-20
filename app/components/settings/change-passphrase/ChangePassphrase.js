/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'
import styles from './ChangePassphrase.scss'
import changepassphraseImg from '~/assets/images/main/settings/changepassphrase.png';

type Props = {
  className?: string,
  t: any,
  settings: SettingsState,
  actions: SettingsActions
}

class ChangePassphrase extends Component<Props> {
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
      <div className={cn(styles.changePassphraseContainer, this.props.className)}>
        <div className={styles.changePassphrasePage}>
          <img src={changepassphraseImg} alt="lock icon" />
          <div className={styles.description}>
            <p>{t('Change the passphrase')}</p>
          </div>
          <div className={styles.passphraseInput}>
            <div className={styles.passphrase}>
              <RoundedInput
                name="passphrase"
                placeholder="Enter passphrase"
              />
            </div>
            <div className={styles.passphrase}>
              <RoundedInput
                name="newpassphrase"
                placeholder="Enter new passphrase"
              />
            </div>
            <div className={styles.passphrase}>
              <RoundedInput
                name="confirmpassphrase"
                placeholder="Repeat new passphrase"
              />
            </div>
            <button type="button">
              {t(`Change passphrase`)}
            </button>
          </div>
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
})
export default connect(mapStateToProps, mapDispatchToProps)(translate('settings')(ChangePassphrase))