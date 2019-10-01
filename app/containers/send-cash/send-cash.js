/* eslint-disable operator-assignment */
/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { NavLink } from 'react-router-dom'
import cn from 'classnames'
import { translate } from 'react-i18next'

import * as Joi from 'joi'
import { Decimal } from 'decimal.js'
import { truncateAmount } from '~/utils/decimal'
import {
  RoundedForm,
  RoundedButton,
  RoundedInput,
  RoundedInputWithPaste,
} from '~/components/rounded-form'
import DropdownSelect from '~/components/dropdown-select/DropdownSelect'
import TransactionModal from '~/components/send-cash/TransactionModal'
import { SendCashActions, SendCashState } from '~/reducers/send-cash/send-cash.reducer'
import { SystemInfoState } from '~/reducers/system-info/system-info.reducer'
import { OptionsState } from '~/reducers/options/options.reducer'
import styles from './send-cash.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import sendImg from '~/assets/images/main/send/send.png'
import addressImg from '~/assets/images/main/addressbook.png'
import deleteImg from '~/assets/images/main/send/delete.png'
import checkmarkImg from '~/assets/images/main/send/checkmark.png'
import ValidateAddressService from '~/service/validate-address-service'
import ValidateAmountService from '~/service/validate-amount-service'

const validateAddress = new ValidateAddressService()
const validateAmount = new ValidateAmountService()

type Props = {
	t: any,
	sendCash: SendCashState,
	systemInfo: SystemInfoState,
	options: OptionsState
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
			isTxModalVisible: false
		};
	}

	componentDidMount() {
		this.defaultReception()
	}

	componentDidUpdate(prevProps) {
    if (prevProps.options.amountUnit !== this.props.options.amountUnit) {
      this.props.sendCash.receptionUnits.forEach(u => {
				this.toggleAmountUnit(u.id, this.getDefaultAmountUnit())
			})
    }
  }

	getValidationSchema() {
		const { t, sendCash } = this.props
		const js = {}
		sendCash.receptionUnits.forEach(u => {
			const {id: i, unit} = u
			js[`toAddress${i}`] = (
				validateAddress.getJoi()
				.cloakAddress()
				.validAll()
				.label(t(`Send To`))
			)
			js[`label${i}`] = (
				validateAddress.getJoiWithAddressBook()
				.addressBook()
				.allow('', null)
				.valid()
				.label(t(`Label`))
			)
			if (unit === 1) {
				js[`amount${i}`] = (
					validateAmount.getJoi()
					.cloakAmount()
					.validCloak()
					.label(t(`Amount`))
				)
			} else if (unit === 1000) {
				js[`amount${i}`] = (
					validateAmount.getJoi()
					.cloakAmount()
					.validCloakM()
					.label(t(`Amount`))
				)
			} else if (unit === 1000000) {
				js[`amount${i}`] = (
					validateAmount.getJoi()
					.cloakAmount()
					.validCloakU()
					.label(t(`Amount`))
				)
			}
		})
		return Joi.object().keys(js)
	}

	defaultReception() {
		if (this.props.sendCash.receptionUnits.length <= 0) {
			this.newReception()
		}  else {
			setTimeout(this.scrollToBottom, 100)
		}
	}

	newReception() {
		let maxId = 0
		for (let i = 0; i < this.props.sendCash.receptionUnits.length; i += 1) {
			const {id} = this.props.sendCash.receptionUnits[i]
			if (maxId < id) {
				maxId = id
			}
		}
		this.props.actions.newReception(maxId + 1, this.getDefaultAmountUnit())
		setTimeout(this.scrollToBottom, 100)
	}

	scrollToBottom() {
		const receiverContainerDom = document.getElementById('receiverContainer')
		receiverContainerDom.scrollTop = receiverContainerDom.scrollHeight
	}

	removeReception(id) {
		if (!this.isAbleToSend()) {
			return
		}
		if (this.props.sendCash.receptionUnits.length <= 1) {
			this.clearReceptions()
		} else {
			this.props.actions.removeReception(id)		
		}
	}

	clearReceptions() {
		this.props.actions.removeReceptions()
		this.newReception()
	}

	toggleAmountUnit(id, unit) {
		if (!this.isAbleToSend()) {
			return
		}
		this.props.actions.toggleAmountUnit(id, unit)
	}

	checkNaviClickDisabled = (e) => {
		if (this.isAbleToSend()) {
			return
		}
    e.preventDefault()
  }

	toggleEnigmaSend() {
		if (!this.isAbleToEnigmaSend()) {
			return
		}
		this.props.actions.toggleEnigmaSend(!this.isEnigmaSend())
	}

	changeEnigmaSendCloakers(cloakers) {
		this.props.actions.changeEnigmaSendCloakers(parseInt(cloakers, 10))
	}

	changeEnigmaSendTimeout(timeout) {
		this.props.actions.changeEnigmaSendTimeout(parseInt(timeout, 10))
	}

	sendCash() {
		this.setState({isTxModalVisible: true})
		this.props.actions.sendCash(this.isAbleToEnigmaSend() && this.isEnigmaSend(),
																this.props.sendCash.enigmaSendCloakers,
																this.props.sendCash.enigmaSendTimeout)
	}

	closeTransactionModal() {
		this.setState({isTxModalVisible: false})
		this.clearReceptions()
	}

	isWalletLocked() {
    return this.props.systemInfo.blockchainInfo.unlockedUntil !== null && this.props.systemInfo.blockchainInfo.unlockedUntil.getTime() < Date.now()
  }

	isAbleToEnigmaSend() {
		return this.props.options.enigmaEnabled &&
						this.props.systemInfo.blockchainInfo.anons >= 5 &&
						this.props.systemInfo.blockchainInfo.blockchainSynchronizedPercentage >= 100
	}

	isAbleToSend() {
		return !this.props.sendCash.isSendingCash && !this.isWalletLocked()
	}

	isEnigmaSend() {
		return this.props.sendCash.isEnigmaSend
	}

	getDefaultAmountUnit() {
		let unit = 1
		if (this.props.options.amountUnit === 'cloakM') {
			unit = 1000
		} else if (this.props.options.amountUnit === 'cloakU') {
			unit = 1000 * 1000
		}
		return unit
	}

	getAmountUnitToDisplay() {
		const unit = this.getDefaultAmountUnit()
		let strUnit = 'CLOAK'
		if (unit === 1000) {
			strUnit = 'mCLOAK'
		} else if (unit === 1000 * 1000) {
			strUnit = 'μCLOAK'
		}
		return strUnit
	}

	getAmountToDisplay(amount: Decimal) {
		return truncateAmount(amount.mul(Decimal(this.getDefaultAmountUnit())))
	}

	renderRecipient(reception) {
		const { t } = this.props
		const i = reception.id
		const u = reception.unit

		return (<div key={i}>
			<div className={styles.sendAddress}>
				<p>{t('Send to')}</p>
				<RoundedInputWithPaste
					name={`toAddress${i}`}
					placeholder={t('Enter a valid CloakCoin or ENIGMA address')}
					disabled={!this.isAbleToSend()}
				/>
				<div className={styles.sendCtrl}>
					<NavLink
						className={cn(!this.isAbleToSend() ? styles.disabled : '')}
						disabled={!this.isAbleToSend()}
						to="/address-book"
						onClick={this.checkNaviClickDisabled}
					>
						<img src={addressImg} alt="img" />
					</NavLink>
					<img
						className={cn(!this.isAbleToSend() ? styles.disabled : '')}
						src={deleteImg}
						alt="img"
						disabled={!this.isAbleToSend()}
						onClick={() => this.removeReception(i)} />
				</div>
			</div>
			<div className={styles.addressLabel}>
				<p>{t('Label')}</p>
				<RoundedInput
					name={`label${i}`}
					placeholder={t('Enter a label for this address to add it to your address book')}
					disabled={!this.isAbleToSend()}
				/>
			</div>
			<div className={styles.sendAmount}>
				<p>{t('Amount')}</p>
				<div className={styles.amoutInputWrapper}>
					<div className={styles.amoutInput}>
						<RoundedInput
							name={`amount${i}`}
							type="number"
							placeholder={t('0.00')}
							disabled={!this.isAbleToSend()}
						/>
					</div>
					<div className={styles.amountUnit}>
						<span>{t('CLOAK')}</span>
						<div 
							className={cn((u === 1) ? styles.active : '', !this.isAbleToSend() ? styles.disabled : '')}
							disabled={!this.isAbleToSend()}
							onClick={() => this.toggleAmountUnit(i, 1)} />
						<span>{t('mCLOAK')}</span>
						<div 
							className={cn((u === 1000) ? styles.active : '', !this.isAbleToSend() ? styles.disabled : '')}
							disabled={!this.isAbleToSend()}
							onClick={() => this.toggleAmountUnit(i, 1000)} />
						<span>{t('μCLOAK')}</span>
						<div 
							className={cn((u === 1000000) ? styles.active : '', !this.isAbleToSend() ? styles.disabled : '')}
							disabled={!this.isAbleToSend()}
							onClick={() => this.toggleAmountUnit(i, 1000000)} />
					</div>
				</div>
			</div>
		</div>)
	}

	render() {
    const { t, sendCash } = this.props

		return (
			<div className={[styles.sendCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
				<div className={styles.sendCashWrapper}>
					<TransactionModal isVisible={this.state.isTxModalVisible && sendCash.transactionId} txId={sendCash.transactionId} onClose={() => this.closeTransactionModal()} />
					<RoundedForm
						className={styles.form}
						id="sendCash"
						schema={this.getValidationSchema()}
						options={{abortEarly: true}}
					>
						<div className={styles.leftSide}>
							<img className={styles.statusImg} src={sendImg} alt="img" />
							<p>{t('SEND COINS')}</p>
							<p>{this.getAmountToDisplay(this.props.systemInfo.blockchainInfo.balance)}&nbsp;{t(this.getAmountUnitToDisplay())}</p>
							<p>{t('BALANCE')}</p>
							<RoundedButton
								className={styles.send}
								type="submit"
								onClick={() => this.sendCash()}
								spinner={sendCash.isSendingCash}
								disabled={!this.isAbleToSend()}
							>
								{t(`Send`)}
							</RoundedButton>
						</div>
						<div className={styles.rightSide}>
							<div id="receiverContainer" className={styles.receiverContainer}>
								{sendCash.receptionUnits.map(r => (this.renderRecipient(r)))}
							</div>
							<div className={styles.sendOption}>
								<RoundedButton
									className={styles.addReception}
									type="button"
									onClick={() => this.newReception()}
									disabled={!this.isAbleToSend()}
								>
									{t(`Add recipient`)}
								</RoundedButton>
								<RoundedButton
									className={styles.clearReceptions}
									type="button"
									onClick={() => this.clearReceptions()}
									disabled={!this.isAbleToSend()}
								>
									{t(`Clear all`)}
								</RoundedButton>
								<span>{t('Enigma')}</span>
								<div 
									className={cn(styles.checkmark, !this.isAbleToSend() ? styles.disabled : '', !this.isAbleToEnigmaSend() ? styles.disabled : '')}
									onClick={() => this.toggleEnigmaSend()}
									disabled={!this.isAbleToSend() || !this.isAbleToEnigmaSend()}
								>
									{this.isEnigmaSend() && <img src={checkmarkImg} alt="img" /> }
								</div>
								<span className={styles.cloakers}>{t('Cloakers')}</span>
								<DropdownSelect 
									className={cn(styles.cloakersSelector, !this.isEnigmaSend() ? styles.disabled : '')}
									disabled={!this.isAbleToSend() || !this.isEnigmaSend()}
									onChange={(event) => this.changeEnigmaSendCloakers(event.target.value)}
									value={this.props.sendCash.enigmaSendCloakers}
								 	options={[
										{value: 5, label: 5},
										{value: 6, label: 6},
										{value: 7, label: 7},
										{value: 8, label: 8},
										{value: 9, label: 9},
										{value: 10, label: 10},
										{value: 11, label: 11},
										{value: 12, label: 12},
										{value: 13, label: 13},
										{value: 14, label: 14},
										{value: 15, label: 15},
										{value: 16, label: 16},
										{value: 17, label: 17},
										{value: 18, label: 18},
										{value: 19, label: 19},
										{value: 20, label: 20},
										{value: 21, label: 21},
										{value: 22, label: 22},
										{value: 23, label: 23},
										{value: 24, label: 24},
										{value: 25, label: 25}
									]} />
								<span className={styles.timeout}>{t('Timeout')}</span>
								<DropdownSelect
									className={cn(styles.timeoutSelector, !this.isEnigmaSend() ? styles.disabled : '')}
									disabled={!this.isAbleToSend() || !this.isEnigmaSend()}
									onChange={(event) => this.changeEnigmaSendTimeout(event.target.value)}
									value={this.props.sendCash.enigmaSendTimeout}
									options={[
										{value: 60, label: '1m'},
										{value: 120, label: '2m'},
										{value: 180, label: '3m'},
										{value: 240, label: '4m'},
										{value: 300, label: '5m'}
									]} />
							</div>
						</div>
					</RoundedForm>
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	sendCash: state.sendCash,
	systemInfo: state.systemInfo,
	options: state.options
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SendCashActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('send-cash')(SendCash))
