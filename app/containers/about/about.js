/* eslint-disable react/prop-types */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import { AboutState, AboutActions } from '~/reducers/about/about.reducer'
import styles from './about.scss'
import aboutLogo from '~/assets/images/about/about_logo.png'
import {
  RoundedButton
} from '~/components/rounded-form'

type Props = {
  t: any,
  about: AboutState,
  actions: AboutActions
}

/**
 * @class About
 * @extends {Component<Props>}
 */

export class About extends Component<Props> {
	props: Props

	render() {
    if (!this.props.about.isAboutOpen) {
      return null
    }

    const { t } = this.props

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container)}>
          <img className={cn(styles.logo_img)} src={aboutLogo} alt="img" />
          <p className={cn(styles.cloak_coin)}>{t('CloakCoin')}</p>
          <p className={cn(styles.revolution_stormfix)}>{t('Revolution stormfix')}</p>
          <p className={cn(styles.copy_right)}>{t('Copy Right Bitcoin')}</p>
          <p className={cn(styles.copy_right)}>{t('Copy Right Cloak')}</p>
          <div className={cn(styles.description)}>
            <p className={cn(styles.about_description)}>{t('About Description1')}</p>
            <p className={cn(styles.about_description)}>{t('About Description2')}</p>
            <p className={cn(styles.about_description)}>{t('About Description3')}</p>
          </div>
          <RoundedButton
            className={styles.button}
            onClick={this.props.actions.closeAbout}
          >
            {t(`About OK`)}
          </RoundedButton>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
	about: state.about
})

const mapDispatchToProps = dispatch => ({
	actions: bindActionCreators(AboutActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('get-started')(About))
