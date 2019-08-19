/* eslint-disable import/no-unresolved */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-expressions */
// @flow
// import moment from 'moment'
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import cn from 'classnames'
import styles from './TransactionsList.scss'
import mining from '~/assets/images/main/overview/mining.png';
import enigmaGreen from '~/assets/images/main/overview/enigma-green.png';
import send from '~/assets/images/main/overview/send.png';
import receive from '~/assets/images/main/overview/receive.png';
import question from '~/assets/images/main/overview/question.png';

const mockData = [
  {
    type: 'mining',
    typeLabel: "Minted",
    iconSrc: mining,
    dateStr: "19.7.2019 19:05",
    txId: "(n/a)",
    value: 0.5
  },
  {
    type: 'enigmaGreen',
    typeLabel: "ENIGMA",
    iconSrc: enigmaGreen,
    dateStr: "19.7.2019 19:05",
    txId: "(n/a)",
    value: 24.27
  },
  {
    type: 'send',
    typeLabel: "Sent",
    iconSrc: send,
    dateStr: "19.7.2019 19:05",
    txId: "CBAEF2SAFPWETWERYJJH4LJABCCC",
    value: 130.0
  },
  {
    type: 'question',
    typeLabel: "Minted",
    iconSrc: question,
    dateStr: "19.7.2019 19:05",
    txId: "(n/a)",
    value: 0.02345
  },
  {
    type: 'receive',
    typeLabel: "Received with",
    iconSrc: receive,
    dateStr: "19.7.2019 19:05",
    txId: "Send here",
    value: 0.02345
  },
]

class TransactionsList extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props
    // {moment.unix(transaction.timestamp).locale(i18n.language).format('L kk:mm:ss')}
		return (
      <div className={cn(styles.transactionsList)}>
        <div className={styles.tableHeader}>
          <div className={styles.dateField}><span>{t('Date')}</span></div>
          <div className={styles.typeField}>{t('Type')}</div>
          <div className={styles.addressField}><span>{t('Address')}</span></div>
          <div className={styles.amountField}>{t('Amount')}</div>
        </div>
        <div className={styles.transactionListWrapper}>
          {
            mockData.map((txData, index) => (
              <div className={styles.txItem} key={index}>
                <div className={cn(styles.txInfo, styles.dateField)}>
                  <div>
                    <img className={txData.type === 'question' ? styles.grey : ''} src={txData.iconSrc} alt="img" />
                  </div>
                  <div className={txData.type === 'question' ? styles.grey : ''}>
                    <p>{txData.dateStr}</p>
                  </div>
                </div>
                <div
                  className={
                    cn(
                      styles.typeField,
                      txData.type === 'question' ? styles.grey : '',
                    )
                  }
                >
                  <p>{txData.typeLabel}</p>
                </div>
                <div
                  className={
                    cn(
                      styles.addressField,
                      txData.type === 'question' ? styles.grey : '',
                    )
                  }
                >
                  <p>{txData.txId}</p>
                </div>
                <div
                  className={
                    cn(
                      styles.txValue,
                      txData.type === 'question' ? styles.grey : '',
                      styles.amountField
                    )
                  }
                >
                  <p>{txData.value}</p>
                  {txData.type === 'send' && (
                    <div>
                      <button type="button">{t(`TX ID`)}</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </div>
		)
	}
}

export default translate('transaction-cash')(TransactionsList)
