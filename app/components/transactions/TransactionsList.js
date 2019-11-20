/* eslint-disable import/no-unresolved */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-expressions */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import moment from 'moment'
import cn from 'classnames'

import { Decimal } from 'decimal.js'
import { Transaction, OverviewActions } from '~/reducers/overview/overview.reducer'
import { OptionsState } from '~/reducers/options/options.reducer'
import RpcPolling from '~/components/rpc-polling/rpc-polling'
import TransactionModal from '~/components/send-cash/TransactionModal'
import { RoundedButton } from '~/components/rounded-form'
import { truncateAmount } from '~/utils/decimal'

import styles from './TransactionsList.scss'
import generateIcon from '~/assets/images/main/overview/mining.png';
import enigmaGreenIcon from '~/assets/images/main/overview/enigma-green.png';
import enigmaRedIcon from '~/assets/images/main/overview/enigma-red.png';
import sendIcon from '~/assets/images/main/overview/send.png';
import receiveIcon from '~/assets/images/main/overview/receive.png';
import unknownIcon from '~/assets/images/main/overview/question.png';


const transactionsPollingInterval = 30.0

const categories = [
  {category: 'generate', enigma: false, known: true, icon: generateIcon, text: 'Mined'},
  {category: 'receive', enigma: false, known: true, icon: receiveIcon, text: 'Received'},
  {category: 'send', enigma: false, known: true, icon: sendIcon, text: 'Sent'},
  {category: 'receive', enigma: true, known: true, icon: enigmaGreenIcon, text: 'Received with Enigma'},
  {category: 'send', enigma: true, known: true, icon: enigmaRedIcon, text: 'Sent with Enigma'},
  {category: 'immature', enigma: false, known: false, icon: unknownIcon, text: 'Immature'},
  {category: 'immature', enigma: true, known: false, icon: unknownIcon, text: 'Immature with Enigma'},
  {category: 'orphan', enigma: false, known: false, icon: unknownIcon, text: 'Orphan'},
  {category: 'orphan', enigma: true, known: false, icon: unknownIcon, text: 'Orphan with Enigma'},

  {category: 'unknown', enigma: false, known: false, icon: unknownIcon, text: 'Unknown'},
  {category: 'unknown', enigma: true, known: false, icon: unknownIcon, text: 'Unknown'},
]

type Props = {
  t: any,
  transactions: Array<Transaction>,
  options: OptionsState,
  filterAddress?: string,
  filterAmount?: Decimal,
  filterPeriod?: number,
  filterCategory?: string
}

class TransactionsList extends Component<Props> {
  props: Props
  
  constructor(props) {
		super(props);
		this.state = {
      isTxModalVisible: false,
      txId: null,
		};
  }

  isMatchedByAddressFilter(tx) {
    return this.props.filterAddress === '' || 
            tx.destinationAddress.toLowerCase().indexOf(this.props.filterAddress.toLowerCase()) !== -1
  }

  isMatchedByAmountFilter(tx) {
    return !this.props.filterAmount || 
            Math.abs(tx.amount) >= this.props.filterAmount
  }

  isMatchedByPeriodFilter(tx) {
    return this.props.filterPeriod < 0 || 
            moment.unix(tx.timestamp).add(this.props.filterPeriod, 'days').diff(new Date()) > 0
  }

  isMatchedByCategoryFilter(tx) {
    let filters = this.props.filterCategory.toString().split('|')
    if (!filters || filters.length <= 0) {
      filters = ['all', 'all']
    }
    const category = filters[0]
    const includeNormal = filters.length <= 1 || filters[1] === 'all'
    const includeEnigma = filters.length > 1 && (filters[1] === 'enigma' || filters[1] === 'all')

    return (category === 'all' || tx.category === category) &&
            ((includeNormal && !tx.isStealthAddress) ||
              (includeEnigma && tx.isStealthAddress))
  }

  getFilteredTransactions() {
    return this.props.transactions.filter(tx => this.isMatchedByAddressFilter(tx) &&
                                                this.isMatchedByAmountFilter(tx) &&
                                                this.isMatchedByPeriodFilter(tx) &&
                                                this.isMatchedByCategoryFilter(tx))
  }

  isKnownCategory(tx) {
    return categories.findIndex(c => c.category === tx.category && c.known === true) >= 0
  }

  getGrayStyle(tx) {
    return !this.isKnownCategory(tx) ? styles.grey : ''
  }

  getCategory(tx) {
    const category = categories.find(c => c.category === tx.category && c.enigma === tx.isStealthAddress)
    return category || categories[categories.length - 1]
  }

  onTxId(tx) {
    this.setState({isTxModalVisible: true, txId: tx.transactionId})
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
  
	render() {
    const { t } = this.props
		return (
      <div className={cn(styles.transactionsList)}>

        <RpcPolling
          interval={transactionsPollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: OverviewActions.getTransactionDataFromWallet,
            success: OverviewActions.gotTransactionDataFromWallet,
            failure: OverviewActions.getTransactionDataFromWalletFailure
          }}
        />

        <TransactionModal isVisible={this.state.isTxModalVisible} txId={this.state.txId} onClose={() => this.setState({isTxModalVisible: false})} />
        <div className={styles.tableHeader}>
          <div className={styles.dateField}><span>{t('Date')}</span></div>
          <div className={styles.categoryField}>{t('Type')}</div>
          <div className={styles.addressField}><span>{t('Address')}</span></div>
          <div className={styles.amountField}>{t('Amount')}</div>
        </div>
        <div className={styles.transactionListWrapper}>
          {this.getFilteredTransactions().map((tx, index) => (
            <div className={styles.txItem} key={index}>
              <div className={cn(styles.txInfo, styles.dateField)}>
                <div className={tx.confirmations < 4 ? styles.redBage : ''}>
                  <img src={this.getCategory(tx).icon} alt="img" />
                </div>
                <div className={this.getGrayStyle(tx)}>
                  <p>{moment.unix(tx.timestamp).format('L kk:mm')}</p>
                </div>
              </div>
              <div className={cn(styles.categoryField, this.getGrayStyle(tx))}>
                <p>{t(this.getCategory(tx).text)}</p>
              </div>
              <div className={cn(styles.addressField, this.getGrayStyle(tx))}>
                <p>{tx.destinationAddress}</p>
              </div>
              <div className={cn(styles.txValue, styles.amountField, this.getGrayStyle(tx))}>
                <p>{this.getAmountToDisplay(tx.amount)}</p>
                <div className={styles.btnTxId}>
                  <RoundedButton onClick={() => this.onTxId(tx)}>{t(`TX ID`)}</RoundedButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
		)
	}
}

const mapStateToProps = (state) => ({
  transactions: state.overview.transactions,
  options: state.options
})

export default connect(mapStateToProps, null)(translate('transaction-cash')(TransactionsList))
