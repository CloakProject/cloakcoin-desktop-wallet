/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import DropdownSelect from '~/components/dropdown-select/DropdownSelect'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import TransactionsList from '~/components/transactions/TransactionsList'
import styles from './transaction-cash.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'


type Props = {
  t: any
}

/**
 * @class TransactionCash
 * @extends {Component<Props>}
 */
class TransactionCash extends Component<Props> {
	props: Props
	/**
	 * @memberof TransactionCash
	 */
	constructor(props) {
    super(props);
    this.state = {
      address: '',
			amount: 0,
			period: -1,
			category: 'all|all'
    }
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

  handleAddressChange = (value) => {
    this.setState({address: value});
	}

	handleAmountChange = (value) => {
		const amount = parseInt(value, 10) / this.getDefaultAmountUnit()
    this.setState({amount});
	}

	render() {
    const { t } = this.props
		return (
			<div className={[styles.transactionCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
				<div className={styles.txListWrapper}>
					<div className={styles.txFilterContainer}>
						<div className={styles.dateField}>
							<DropdownSelect
								options={
									[
										{value: -1, label: 'All'},
										{value: 30, label: 'Last month'},
										{value: 7, label: 'Last week'}
									]
								}
								onChange={e => this.setState({period: e.target.value})}
							/>
						</div>
						<div className={styles.categoryField}>
							<DropdownSelect
								options={
									[
										{value: 'all|all', label: 'All'},
										{value: 'receive', label: 'Received'},
										{value: 'receive|enigma', label: 'Received with Enigma'},
										{value: 'send', label: 'Sent'},
										{value: 'send|enigma', label: 'Sent with Enigma'},
										{value: 'generate', label: 'Mined'},
										{value: 'immature|all', label: 'Immature'},
										{value: 'orphan|all', label: 'Orphan'}
									]
								}
								onChange={e => this.setState({category: e.target.value})}
							/>
						</div>
						<div className={styles.addressField}>
							<RoundedInput
								name="label"
								placeholder={t('Enter address or label to search')}
								onChange={value => this.handleAddressChange(value)}
							/>
						</div>
						<div className={styles.amountField}>
							<RoundedInput
								type="number"
								name="amount"
								placeholder={t('Min. amount')}
								onChange={value => this.handleAmountChange(value)}
							/>
						</div>
					</div>
					<TransactionsList
						filterPeriod={this.state.period}
						filterCategory={this.state.category}
						filterAddress={this.state.address}
						filterAmount={this.state.amount} 
					/>
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	TransactionCash: state.TransactionCash,
	options: state.options
})

export default connect(mapStateToProps, null)(translate('transaction-cash')(TransactionCash))
