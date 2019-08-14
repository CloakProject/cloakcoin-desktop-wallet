/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import styles from './receive-cash.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import receiveImg from '~/assets/images/main/receive/receive.png';

type Props = {
  t: any
}

/**
 * @class receiveCash
 * @extends {Component<Props>}
 */
class ReceiveCash extends Component<Props> {
	props: Props
	/**
	 * @memberof receiveCash
	 */

	render() {
    const { t } = this.props
		return (
			<div className={[styles.receiveCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
				<div className={styles.receiveCashWrapper}>
					<div className={styles.leftSide}>
						<img src={receiveImg} alt="img" />
						<p>{t('RECEIVE COINS')}</p>
					</div>
					<div className={styles.rightSide}>
						<p>{t('CloakCoin addresses')}</p>
						<div className={styles.receiveAddress}>
							<div>
								<p>{t('Cloaking')}</p>
								<p>smYhhPyTAU724DkAPysHcegj5SPjPxMYnS6E4...</p>
							</div>
							<div>
								<p>{t('Send here')}</p>
								<p>C6qQ3syfTeRK4rA7wFox6gLJN1pZkSuofZ</p>
							</div>
							<div>
								<p>{t('Address 03')}</p>
								<p>C3vGyjauAJAAyBGnhdD8jKDCZEuy8L88J1</p>
							</div>
						</div>
					</div>
				</div>
				<div className={styles.receiveButtons}>
					<button	type="button">
						{t(`New address`)}
					</button>
					<button	type="button">
						{t(`New ENIGMA address`)}
					</button>
					<button	type="button">
						{t(`Copy address`)}
					</button>
					<button	type="button">
						{t(`Show QR code`)}
					</button>
					<button	type="button">
						{t(`Sign message`)}
					</button>
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	receiveCash: state.receiveCash
})

export default connect(mapStateToProps, null)(translate('receive-cash')(ReceiveCash))
