/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'

import { getStore } from '~/store/configureStore'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import { SendCashActions, SendCashState } from '~/reducers/send-cash/send-cash.reducer'

import styles from './send-cash.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import sendImg from '~/assets/images/main/send/send.png';
import addressImg from '~/assets/images/main/addressbook.png';
import pasteImg from '~/assets/images/main/send/paste.png';
import deleteImg from '~/assets/images/main/send/delete.png';
import checkmarkImg from '~/assets/images/main/send/checkmark.png';

type Props = {
  t: any,
	sendCash: SendCashState
}

/**
 * @class SendCash
 * @extends {Component<Props>}
 */
class SendCash extends Component<Props> {
	props: Props

	constructor(props) {
		super(props);
		this.state = {
			amountUnit: 'CLOAK',
			isEnigma: true
		};
	}

	/**
	 * @memberof SendCash
	 */
	componentDidMount() {
    getStore().dispatch(SendCashActions.checkAddressBookByName())
	}

	getEnigmalyToggleButtonClasses() {
		return this.props.sendCash.isEnigmaTransactions
			? `${styles.toggleButton} ${styles.toggleButtonOn}`
			: `${styles.toggleButton}`
	}

	onSendButtonClicked(event) {
		this.eventConfirm(event)
		getStore().dispatch(SendCashActions.sendCash())
	}

	selectAmoutUnit = type => {
		this.setState({ amountUnit: type });
	}

	selectEnigma = () => {
		const { isEnigma } = this.state;
		console.log('isEnigma', isEnigma)
		this.setState({ isEnigma: !isEnigma });
	}

	render() {
    const { t } = this.props
		const cloakBalance = "3,192.32";
		return (
			<div className={[styles.sendCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
				<div className={styles.sendCashWrapper}>
					<div className={styles.leftSide}>
						<img src={sendImg} alt="img" />
						<p>{t('SEND COINS')}</p>
						<p>{t(`{{cloakBalance}} CLOAK`, { cloakBalance })}</p>
						<p>{t('BALANCE')}</p>
						<button
							type="button"
							onClick={event => this.onSendButtonClicked(event)}
							onKeyDown={event => this.onSendButtonClicked(event)}
						>
							{t(`Send`)}
						</button>
					</div>
					<div className={styles.rightSide}>
						<div className={styles.sendAddress}>
							<p>{t('Send to')}</p>
							<RoundedInput
								name="receiver"
								placeholder={t('Enter a valid CloakCoin or ENIGMA address')}
							/>
							<div className={styles.sendCtrl}>
								<img src={addressImg} alt="img" />
								<img src={pasteImg} alt="img" />
								<img src={deleteImg} alt="img" />
							</div>
						</div>
						<div className={styles.addressLabel}>
							<p>{t('Label')}</p>
							<RoundedInput
								name="label"
								placeholder={t('Enter a label for this address to add it to your address book')}
							/>
						</div>
						<div className={styles.sendAmount}>
							<p>{t('Amount')}</p>
							<div className={styles.amoutInputWrapper}>
								<div className={styles.amoutInput}>
									<RoundedInput
										name="amount"
										placeholder={t('0.00')}
									/>
								</div>
								<div className={styles.amountUnit}>
									<span>{t('CLOAK')}</span>
									<div className={this.state.amountUnit === 'CLOAK' ? styles.active : ''} onClick={() => this.selectAmoutUnit('CLOAK')} />
									<span>{t('mCLOAK')}</span>
									<div className={this.state.amountUnit === 'mCLOAK' ? styles.active : ''} onClick={() => this.selectAmoutUnit('mCLOAK')} />
									<span>{t('μCLOAK')}</span>
									<div className={this.state.amountUnit === 'μCLOAK' ? styles.active : ''} onClick={() => this.selectAmoutUnit('μCLOAK')}/>
								</div>
							</div>
						</div>
						<div className={styles.sendOption}>
							<button
								type="button"
							>
								{t(`Add recipient`)}
							</button>
							<button
								type="button"
							>
								{t(`Clear all`)}
							</button>
							<span>{t('Enigma')}</span>
							<div className={styles.checkmark} onClick={this.selectEnigma} >
								{this.state.isEnigma && <img src={checkmarkImg} alt="img" /> }
							</div>
							<span>{t('Cloakers')}</span>
							<div className={styles.select_box}>
								<select>
									<option>25</option>
								</select>
							</div>
							<span>{t('Timeout')}</span>
							<div className={styles.select_box}>
								<select>
									<option>3m</option>
								</select>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	sendCash: state.sendCash
})

export default connect(mapStateToProps, null)(translate('send-cash')(SendCash))
