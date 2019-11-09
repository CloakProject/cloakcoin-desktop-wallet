/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import { Decimal } from 'decimal.js'
import { BlockchainInfo } from '~/reducers/system-info/system-info.reducer'
import { OptionsState } from '~/reducers/options/options.reducer'
import { truncateAmount } from '~/utils/decimal'
import styles from './Status.scss'

type Props = {
  t: Any,
  className?: string,
	blockchainInfo?: BlockchainInfo,
  options: OptionsState
}

class Status extends Component<Props> {
  props: Props

  elapsedMinutes(date) {
    const { t } = this.props

    if (!date) {
      return t('N/A')
    }
    const elapsedMs = Date.now() - date.getTime()
    const elapsedMin = Math.round(elapsedMs / 1000 / 60)
    return elapsedMin <= 0 ? t('Just') : (`${elapsedMin || 1}${t('m')}`)
  }

  secondsToDisplay(value: number) {
    const { t } = this.props

		if (!value) {
			return t('N/A')
		}
    let time = (value / 3600)
		let unit = t(' hours')
		if (time >= 24) {
			time /= 24
			unit = t(' days')
		}
    return `${time.toFixed(2)}${unit}`
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
    const statusData = [
      {label: 'Blockchain', value: `${this.props.blockchainInfo.blockchainSynchronizedPercentage.toFixed(2)}%`},
      {label: 'Current difficulty', value: this.props.blockchainInfo.difficulty.toFixed(2)},
      {label: 'Download blocks', value: this.props.blockchainInfo.blocks},
      {label: 'Last received', value: this.elapsedMinutes(this.props.blockchainInfo.lastBlockTime)},
      {label: 'Anons', value: this.props.blockchainInfo.anons},
      {label: 'Cloaking', value: this.props.blockchainInfo.cloakings},
      {label: 'Minting', value: this.secondsToDisplay(this.props.blockchainInfo.mintEstimation)},
      {label: 'Your weight', value: this.props.blockchainInfo.weight},
      {label: 'Network weight', value: this.props.blockchainInfo.networkWeight},
      {label: 'Stake', value: this.getAmountToDisplay(this.props.blockchainInfo.stake)},
      {label: 'Unconfirmed', value: this.getAmountToDisplay(this.props.blockchainInfo.unconfirmedBalance)},
      {label: 'Immature', value: this.getAmountToDisplay(this.props.blockchainInfo.immatureBalance)},
      {label: 'Earnings', value: this.getAmountToDisplay(this.props.blockchainInfo.cloakingEarnings)},
    ]
    
    return (
      <div className={cn(styles.statusContainer, this.props.className)}>
        {
          statusData.map((item, index) => {
            return (
              <div className={cn(styles.item, index !== statusData.length - 1 ? styles.borderBottom : '')} key={item.label}>
                <p>{t(item.label)}</p>
                <p>{item.value}</p>
              </div>
            )
          })
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({
  blockchainInfo: state.systemInfo.blockchainInfo,
  options: state.options
})

export default connect(mapStateToProps)(translate('settings')(Status))
