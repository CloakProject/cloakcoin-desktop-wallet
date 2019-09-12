/* eslint-disable operator-assignment */
/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'

import { Decimal } from 'decimal.js'
import { getStore } from '~/store/configureStore'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import DropdownSelect from '~/components/dropdown-select/DropdownSelect'
import TransactionModal from '~/components/send-cash/TransactionModal'
import { SendCashActions, SendCashState } from '~/reducers/send-cash/send-cash.reducer'
import { AddressBookActions, AddressBookState } from '~/reducers/address-book/address-book.reducer'
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
	sendCash: SendCashState,
	newAddressModal: AddressBookState.newAddressModal
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
			isEnigma: true,
			receiverCount: 1,
			receivers: [],
			labels: [],
			amounts: [],
			amountUnits: [],
			error: '',
			isTxModalVisible: false,
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

	onSendButtonClicked() {
		this.props.sendCash.isEnigmaTransactions = this.state.isEnigma;
		//CDRBTjswQwN9UKz42r8bhxhAqYnyhVGUtj
		const receiptions = [];
		if (this.state.receivers.length === 0 || this.state.amounts.length === 0) {
			this.setState({error: 'Please fill out all fields'});
			return;
		}

		for (let i = 0; i < this.state.labels.length; i +=1) {
			this.props.newAddressModal.defaultValues.name = this.state.labels[i];
			this.props.newAddressModal.defaultValues.address = this.state.receivers[i];
			this.props.newAddressModal.defaultValues.isEnigma = this.state.isEnigma;
			if (this.state.labels[i].trim().length !== 0) {
				getStore().dispatch(AddressBookActions.newAddressModal.addAddress());
			}
		}

		for (let i = 0; i < this.state.receivers.length; i +=1) {
			if (this.state.receivers[i].trim().length === 0 || !this.state.amounts[i]) {
				break;
			}
			let amountToSend;
			amountToSend = this.state.amounts[i];
			if (this.state.amountUnits[i] === 'mCLOAK') {
				amountToSend = this.state.amounts[i] / 1000;
			}	else if (this.state.amountUnits[i] === 'μCLOAK') {
				amountToSend = this.state.amounts[i] / 100000;
			}
			receiptions.push({
				toAddress: this.state.receivers[i],
				amountToSend: new Decimal(amountToSend)
			});
		}
		if (receiptions.length === this.state.receiverCount) {
			this.setState({error: ''});
		} else {
			this.setState({error: 'Please fill out all fields'});
			return;
		}
		this.props.sendCash.receiptions = receiptions;
		this.setState({isTxModalVisible: true});
		getStore().dispatch(SendCashActions.sendCash());
	}

	selectAmountUnit = (i, type) => {
		// let amounts = this.state.amounts;
		let amountUnits = this.state.amountUnits.slice();
		amountUnits[i] = type;
		
		// if (type === 'CLOAK') {
		// 	if(this.state.amountUnits[i]) {
		// 		if (this.state.amountUnits[i] === 'mCLOAK') {
		// 			amounts[i] = amounts[i] / 1000;
		// 		} else if (this.state.amountUnits[i] === 'μCLOAK') {
		// 			amounts[i] = amounts[i] / 1000000;
		// 		}
		// 	}
		// }	else if (type === 'mCLOAK') {
		// 	if(this.state.amountUnits[i]) {
		// 		if (this.state.amountUnits[i] === 'CLOAK') {
		// 			amounts[i] = amounts[i] * 1000;
		// 		} else if (this.state.amountUnits[i] === 'μCLOAK') {
		// 			amounts[i] = amounts[i] / 1000;
		// 		}
		// 	}
		// } else if (type === 'μCLOAK') {
		// 	if(this.state.amountUnits[i]) {
		// 		if (this.state.amountUnits[i] === 'CLOAK') {
		// 			amounts[i] = amounts[i] * 1000000;
		// 		} else if (this.state.amountUnits[i] === 'mCLOAK') {
		// 			amounts[i] = amounts[i] * 1000;
		// 		}
		// 	}
		// }

		this.setState({amountUnits})
	}

	selectEnigma = () => {
		const { isEnigma } = this.state;
		this.setState({ isEnigma: !isEnigma });
	}

	addMoreRecipient = () => {
		const receiverCount = this.state.receiverCount + 1;
		this.setState({ receiverCount });
	}

	handleReceiverChange = (value, i) => {
		let receivers = this.state.receivers.slice();
    receivers[i] = value;
    this.setState({receivers});
	}

	handleLabelChange = (value, i) => {
		let labels = this.state.labels.slice();
    labels[i] = value;
    this.setState({labels});
	}

	handleAmountChange = (value, i) => {
		let amounts = this.state.amounts.slice();
    amounts[i] = value;
    this.setState({amounts});
	}

	render() {
    const { t } = this.props
		const cloakBalance = "3,192.32";
		let receiverDom = [];
		for(let i = 0; i < this.state.receiverCount; i += 1) {
			receiverDom.push(
				<div key={i}>
					<div className={styles.sendAddress}>
						<p>{t('Send to')}</p>
						<RoundedInput
							name="receiver"
							placeholder={t('Enter a valid CloakCoin or ENIGMA address')}
							disabled={this.props.sendCash.isInputDisabled}
							value={this.state.receivers[i] || ''}
							onChange={value => this.handleReceiverChange(value, i)}
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
							disabled={this.props.sendCash.isInputDisabled}
							value={this.state.labels[i] || ''}
							onChange={value => this.handleLabelChange(value, i)}
						/>
					</div>
					<div className={styles.sendAmount}>
						<p>{t('Amount')}</p>
						<div className={styles.amoutInputWrapper}>
							<div className={styles.amoutInput}>
								<RoundedInput
									name="amount"
									type="number"
									placeholder={t('0.00')}
									disabled={this.props.sendCash.isInputDisabled}
									value={this.state.amounts[i] || ''}
									onChange={value => this.handleAmountChange(value, i)}
									number
								/>
							</div>
							<div className={styles.amountUnit}>
								<span>{t('CLOAK')}</span>
								<div className={(!this.state.amountUnits[i] || this.state.amountUnits[i] === 'CLOAK') ? styles.active : ''} onClick={() => this.selectAmountUnit(i, 'CLOAK')} />
								<span>{t('mCLOAK')}</span>
								<div className={(this.state.amountUnits[i] && this.state.amountUnits[i] === 'mCLOAK') ? styles.active : ''} onClick={() => this.selectAmountUnit(i, 'mCLOAK')} />
								<span>{t('μCLOAK')}</span>
								<div className={(this.state.amountUnits[i] && this.state.amountUnits[i] === 'μCLOAK') ? styles.active : ''} onClick={() => this.selectAmountUnit(i, 'μCLOAK')}/>
							</div>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className={[styles.sendCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
				<div className={styles.sendCashWrapper}>
					<TransactionModal isvisible={this.state.isTxModalVisible} txId={this.props.sendCash.transactionId} onClose={() => this.setState({isTxModalVisible: false})} />
					<div className={styles.leftSide}>
						<img src={sendImg} alt="img" />
						<p>{t('SEND COINS')}</p>
						<p>{t(`{{cloakBalance}} CLOAK`, { cloakBalance })}</p>
						<p>{t('BALANCE')}</p>
						<button
							type="button"
							onClick={() => this.onSendButtonClicked()}
							onKeyDown={() => this.onSendButtonClicked()}
							disabled={this.props.sendCash.isInputDisabled}
						>
							{t(`Send`)}
						</button>
					</div>
					<div className={styles.rightSide}>
						<div className={styles.receiverContainer}>
							{receiverDom}
						</div>
						{this.state.error !== '' && <p className={styles.error}>{this.state.error}</p> }
						<div className={styles.sendOption}>
							<button
								type="button"
								disabled={this.props.sendCash.isInputDisabled}
								onClick={this.addMoreRecipient}
							>
								{t(`Add recipient`)}
							</button>
							<button
								type="button"
								disabled={this.props.sendCash.isInputDisabled}
								onClick={() => this.setState({receiverCount: 1, receivers: [], amounts: [], amountUnits: []})}
							>
								{t(`Clear all`)}
							</button>
							<span>{t('Enigma')}</span>
							<div className={styles.checkmark} onClick={this.selectEnigma} >
								{this.state.isEnigma && <img src={checkmarkImg} alt="img" /> }
							</div>
							<span>{t('Cloakers')}</span>
							<DropdownSelect options={[{value: 25, label: 25}]} />
							<span>{t('Timeout')}</span>
							<DropdownSelect options={[{value: '3m', label: '3m'}]} />
						</div>
					</div>
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	sendCash: state.sendCash,
	newAddressModal: state.addressBook.newAddressModal
})

export default connect(mapStateToProps, null)(translate('send-cash')(SendCash))
