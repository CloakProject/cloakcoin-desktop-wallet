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
import question from '~/assets/images/main/overview/question.png';

const mockData = [
  {
    type: 'mining',
    iconSrc: mining,
    dateStr: "19.7.2019",
    txId: "(N/A)",
    value: 0.5
  },
  {
    type: 'enigmaGreen',
    iconSrc: enigmaGreen,
    dateStr: "19.7.2019",
    txId: "(N/A)",
    value: 24.27
  },
  {
    type: 'send',
    iconSrc: send,
    dateStr: "19.7.2019",
    txId: "CBAEF2SAFPWETWERYJJH4LJABCCC",
    value: 130.0
  },
  {
    type: 'question',
    iconSrc: question,
    dateStr: "19.7.2019",
    txId: "(N/A)",
    value: 0.02345
  },
]

class TransactionsList extends Component<Props> {
	props: Props

	render() {
    // const { t } = this.props
    // {moment.unix(transaction.timestamp).locale(i18n.language).format('L kk:mm:ss')}
		return (
      <div className={cn(styles.transactionsList)}>
        {
          mockData.map((txData, index) => (
            <div className={styles.txItem} key={index}>
              <div className={styles.txInfo}>
                <div>
                  <img src={txData.iconSrc} alt="img" />
                </div>
                <div>
                  <p>{txData.dateStr}</p>
                  <p>{txData.txId}</p>
                </div>
              </div>
              <div
                className={
                  cn(
                    styles.txValue,
                    (txData.type === 'mining' || txData.type === 'enigmaGreen') && styles.green,
                    txData.type === 'send' && styles.red,
                    txData.type === 'question' && styles.grey
                  )
                }
              >
                {
                  (txData.type === 'mining' || txData.type === 'enigmaGreen' || txData.type === 'question') ? `+${  txData.value}` : `-${  txData.value}`
                }
              </div>
            </div>
          ))
        }
      </div>
		)
	}
}

export default translate('overview')(TransactionsList)
