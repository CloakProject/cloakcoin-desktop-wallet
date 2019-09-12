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
			period: 'all',
			type: 'all'
    }
  }

  handleAddressChange = (value) => {
    this.setState({address: value});
	}

	handleAmountChange = (value) => {
    this.setState({amount: value});
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
										{value: 'all', label: 'All'},
										{value: 'lastmonth', label: 'Last month'}
									]
								}
								onChange={e => this.setState({period: e.target.value})}
							/>
						</div>
						<div className={styles.typeField}>
							<DropdownSelect
								options={
									[
										{value: 'all', label: 'All'},
										{value: 'receive', label: 'receive'},
										{value: 'send', label: 'send'}
									]
								}
								onChange={e => this.setState({type: e.target.value})}
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
								name="label"
								placeholder={t('Min. amount')}
								onChange={value => this.handleAmountChange(value)}
								number
							/>
						</div>
					</div>
					<TransactionsList
						filterPeriod={this.state.period}
						filterType={this.state.type}
						filterAddress={this.state.address}
						filterAmount={this.state.amount} 
					/>
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	TransactionCash: state.TransactionCash
})

export default connect(mapStateToProps, null)(translate('transaction-cash')(TransactionCash))
