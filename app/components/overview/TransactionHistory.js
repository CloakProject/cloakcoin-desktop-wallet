/* eslint-disable import/no-unresolved */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-expressions */
// @flow
// import moment from 'moment'
import React, { Component } from 'react'
import moment from 'moment'
import { translate } from 'react-i18next'
import cn from 'classnames'
import { Decimal } from 'decimal.js'
import styles from './TransactionHistory.scss'
import { truncateAmount } from '~/utils/decimal'
import generateIcon from '~/assets/images/main/overview/mining.png';
import enigmaGreenIcon from '~/assets/images/main/overview/enigma-green.png';
import enigmaRedIcon from '~/assets/images/main/overview/enigma-red.png';
import sendIcon from '~/assets/images/main/overview/send.png';
import receiveIcon from '~/assets/images/main/overview/receive.png';
import unknownIcon from '~/assets/images/main/overview/question.png';

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

class TransactionHistory extends Component<Props> {
  props: Props
  
  constructor(props) {
    super(props);
    this.state = {
      height: 200,
    }
  }

  componentWillMount() {
    window.addEventListener("resize", this.updateDimensions)
    this.updateDimensions()
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions)
  }

  updateDimensions = e => {
    const h = window.innerHeight;
    this.setState({ height: (h - 550) })

    if (e) {
      this.setState({ height: (e.target.innerHeight - 550) })
    }
  }

  getCategory(tx) {
    const category = categories.find(c => c.category === tx.category && c.enigma === tx.isStealthAddress)
    return category || categories[categories.length - 1]
  }

  isKnownCategory(tx) {
    return categories.findIndex(c => c.category === tx.category && c.known === true) >= 0
  }

  getGrayStyle(tx) {
    return !this.isKnownCategory(tx) ? styles.grey : ''
  }

	getDefaultAmountUnit() {
		let unit = 1
		if (this.props.amountUnit === 'cloakM') {
			unit = 1000
		} else if (this.props.amountUnit === 'cloakU') {
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

  renderAmount(tx) {
    let strAmount = ``
    if (tx.amount.toNumber() > 0) {
      strAmount = `+`
    }
    strAmount += this.getAmountToDisplay(tx.amount)
    return (<div
              className={
                cn(
                  styles.txValue,
                  this.getGrayStyle(tx),
                  tx.amount.toNumber() > 0 ? styles.green : styles.red
                )
              }
            >
              {strAmount}
            </div>)
  }

	render() {
		return (
      <div className={cn(styles.transactionHistory)}>
        {
          this.props.items && this.props.items.map((tx, index) => (
            index < Math.floor(this.state.height / 50) && (
            <div className={styles.txItem} key={index}>
              <div className={styles.txInfo}>
                <div className={tx.confirmations < 4 ? styles.redBage : ''}>
                  <img src={this.getCategory(tx).icon} alt="img" />
                </div>
                <div className={cn(styles.dateField, this.getGrayStyle(tx))}>
                  <p>{moment.unix(tx.timestamp).format('L')}</p>
                  <p className={styles.addressField}>{tx.destinationAddress}</p>
                </div>
              </div>
              {this.renderAmount(tx)}
            </div>
          )))
        }
      </div>
		)
	}
}

export default translate('overview')(TransactionHistory)
