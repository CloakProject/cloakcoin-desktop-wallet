/* eslint-disable import/no-unresolved */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-expressions */
// @flow
// import moment from 'moment'
import React, { Component } from 'react'
import moment from 'moment'
import { translate } from 'react-i18next'
import cn from 'classnames'
import styles from './TransactionHistory.scss'
import mining from '~/assets/images/main/overview/mining.png';
import enigmaGreen from '~/assets/images/main/overview/enigma-green.png';
import send from '~/assets/images/main/overview/send.png';
import question from '~/assets/images/main/overview/question.png';
import receive from '~/assets/images/main/overview/receive.png';

const icons = {
  receive,
  send
};

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

class TransactionHistory extends Component<Props> {
	props: Props
  constructor(props) {
    super(props);
    this.state = {
      height: 200,
    }
  }

  componentWillMount() {
      this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener("resize", e => this.updateDimensions(e));
  }

  updateDimensions = e => {
    const h = window.innerHeight;
    this.setState({ height: (h - 550) })

    if (e) {
      this.setState({ height: (e.target.innerHeight - 550) })
    }
  }

	render() {
    // const { t } = this.props
    // {moment.unix(transaction.timestamp).locale(i18n.language).format('L kk:mm:ss')}
		return (
      <div className={cn(styles.transactionHistory)}>
        {
          this.props.items && this.props.items.map((txData, index) => (
            index < Math.floor(this.state.height / 50) && (
            <div className={styles.txItem} key={index}>
              <div className={styles.txInfo}>
                <div>
                  <img className={txData.category === 'minted' ? styles.grey : ''} src={icons[txData.category]} alt="img" />
                </div>
                <div>
                  <p>{moment.unix(txData.timestamp).format('L')}</p>
                  <p>{txData.destinationAddress}</p>
                </div>
              </div>
              <div
                className={
                  cn(
                    styles.txValue,
                    (txData.category === 'mining' || txData.category === 'enigmaGreen') && styles.green,
                    txData.category === 'send' && styles.red
                  )
                }
              >
                {txData.amount.toFixed(2)}
              </div>
            </div>
          )))
        }
      </div>
		)
	}
}

export default translate('overview')(TransactionHistory)
