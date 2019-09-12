/* eslint-disable import/no-unresolved */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-expressions */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import moment from 'moment'
import cn from 'classnames'

import { OverviewState, OverviewActions } from '~/reducers/overview/overview.reducer'
import RpcPolling from '~/components/rpc-polling/rpc-polling'
import TransactionModal from '~/components/send-cash/TransactionModal'

import styles from './TransactionsList.scss'
import mining from '~/assets/images/main/overview/mining.png';
import enigmaGreen from '~/assets/images/main/overview/enigma-green.png';
import send from '~/assets/images/main/overview/send.png';
import receive from '~/assets/images/main/overview/receive.png';
import question from '~/assets/images/main/overview/question.png';


const transactionsPollingInterval = 5.0 // 30.0
const icons = {
  receive,
  send
};

type Props = {
  t: any,
  overview: OverviewState,
  actions: object
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
  
	render() {
    const { t } = this.props
		return (
      <div className={cn(styles.transactionsList)}>
        <TransactionModal isvisible={this.state.isTxModalVisible} txId={this.state.txId} onClose={() => this.setState({isTxModalVisible: false})} />
        <RpcPolling
          interval={transactionsPollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: OverviewActions.getTransactionDataFromWallet,
            success: OverviewActions.gotTransactionDataFromWallet,
            failure: OverviewActions.getTransactionDataFromWalletFailure
          }}
        />
        <div className={styles.tableHeader}>
          <div className={styles.dateField}><span>{t('Date')}</span></div>
          <div className={styles.typeField}>{t('Type')}</div>
          <div className={styles.addressField}><span>{t('Address')}</span></div>
          <div className={styles.amountField}>{t('Amount')}</div>
        </div>
        <div className={styles.transactionListWrapper}>
          {
            this.props.overview.transactions.map((txData, index) => (
              (this.props.filterAddress === ''
                 || txData.destinationAddress.toLowerCase().indexOf(this.props.filterAddress.toLowerCase()) !== -1
              )
              && (!this.props.filterAmount || txData.amount.toFixed(2) >= this.props.filterAmount)
              && (this.props.filterPeriod === 'all' || (this.props.filterPeriod === 'lastmonth' && moment.unix(txData.timestamp).add(30, 'days').diff(new Date()) > 0 ))
              && (this.props.filterType === 'all' || txData.category === this.props.filterType)
              &&(  
              <div className={styles.txItem} key={index}>
                <div className={cn(styles.txInfo, styles.dateField)}>
                  <div className={txData.confirmations < 4 ? styles.redBage : ''}>
                    <img className={txData.category === 'minted' ? styles.grey : ''} src={icons[txData.category]} alt="img" />
                  </div>
                  <div className={txData.category === 'minted' ? styles.grey : ''}>
                    <p>{moment.unix(txData.timestamp).format('L kk:mm')}</p>
                  </div>
                </div>
                <div
                  className={
                    cn(
                      styles.typeField,
                      txData.category === 'minted' ? styles.grey : '',
                    )
                  }
                >
                  <p>{txData.category}</p>
                </div>
                <div
                  className={
                    cn(
                      styles.addressField,
                      txData.category === 'minted' ? styles.grey : '',
                    )
                  }
                >
                  <p>{txData.destinationAddress}</p>
                </div>
                <div
                  className={
                    cn(
                      styles.txValue,
                      txData.category === 'minted' ? styles.grey : '',
                      styles.amountField
                    )
                  }
                >
                  <p>{txData.amount.toFixed(2)}</p>
                  <div className={styles.btnTxId}>
                    <button type="button" onClick={() => this.setState({isTxModalVisible: true, txId: txData.transactionId})}>{t(`TX ID`)}</button>
                  </div>
                </div>
              </div>
            )))
          }
        </div>
      </div>
		)
	}
}

const mapStateToProps = (state) => ({
	overview: state.overview
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(OverviewActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('transaction-cash')(TransactionsList))
