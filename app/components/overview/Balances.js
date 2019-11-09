// @flow
import React, { Component } from 'react'
import classNames from 'classnames'
import { translate } from 'react-i18next'

import { Decimal } from 'decimal.js'
import { truncateAmount } from '~/utils/decimal'
import { BalancesInfo } from '~/reducers/overview/overview.reducer'

import styles from './Balances.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import balanceUp from '~/assets/images/main/overview/ballance-up.png';
import balanceDown from '~/assets/images/main/overview/ballance-down.png';
import reward from '~/assets/images/main/overview/reward.png';

type Props = {
  t: any,
	balances: BalancesInfo
}

class Balances extends Component<Props> {
	props: Props

	hasUnconfirmedTransactionBalance(balanceType) {
		if (balanceType === 'cloak') {
			return false
    }

    if (balanceType === 'reward') {
			return false
    }

    if (balanceType === 'value') {
			return false
		}

		return false
	}

	getBalanceValueStyles(balanceType) {
		let hasUnconfirmed = false

		if (balanceType === 'cloak') {
			hasUnconfirmed = this.hasUnconfirmedTransactionBalance(balanceType)
		} else if (balanceType === 'reward') {
			hasUnconfirmed = this.hasUnconfirmedTransactionBalance(balanceType)
		} else if (balanceType === 'value') {
			hasUnconfirmed = this.hasUnconfirmedTransactionBalance(balanceType)
		}

		return hasUnconfirmed ? `${styles.balanceValue} ${styles.hasUnconfirmedTransactionBalance}` : `${styles.balanceValue}`
	}

	getBalanceChangeImage(changes) {
		return changes > 0 ? balanceUp : balanceDown
	}

	balanceValueToString(value: Decimal) {
		let balanceString = ``
		let unitString = ``
		if (value.sub(100*1000*1000).toNumber() >= 0) { // 100M
			balanceString = truncateAmount(value.div(1000*1000), 1)
			unitString = `M`
		} else if (value.sub(10*1000*1000).toNumber() >= 0) { // 10M
			balanceString = truncateAmount(value.div(1000*1000))
			unitString = `M`
		} else if (value.sub(1*1000*1000).toNumber() >= 0) { // 1M
			balanceString = truncateAmount(value.div(1000*1000))
			unitString = `M`
		} else if (value.sub(100*1000).toNumber() >= 0) { // 100K
			balanceString = truncateAmount(value.div(1000), 1)
			unitString = `K`
		} else if (value.sub(10*1000).toNumber() >= 0) { // 10K
			balanceString = truncateAmount(value.div(1000))
			unitString = `K`
		} else if (value.sub(1*1000).toNumber() >= 0) { // 1K
			balanceString = truncateAmount(value.div(1000))
			unitString = `K`
		} else {
			balanceString = truncateAmount(value)
			unitString = ``
		}

		return {balanceString, unitString}
	}

	renderBalanceValue(balance: Decimal, prefixString: string ) {
		const {balanceString, unitString} = this.balanceValueToString(balance)
		const isBottomDecimal = unitString === ``
		const strArr = balanceString.split('.')
		const length = strArr[0].length + (isBottomDecimal ? 0 : 2)
		let {balanceSize} = styles
		if (length >= 4) {
			balanceSize = styles.balanceSize4
		} else if (length >= 3) {
			balanceSize = styles.balanceSize3
		} else if (length >= 2) {
			balanceSize = styles.balanceSize2
		} else if (length >= 1) {
			balanceSize = styles.balanceSize1
		}
		return (
			<span className={classNames(balanceSize)}>
				<span className={classNames(styles.balancePrefixPart)}>{prefixString}</span>
				<span className={classNames(styles.balanceFrontPart)}>{strArr[0]}</span>
				<span className={classNames(isBottomDecimal ? styles.balanceDecimalPart : '')}>.{strArr.length > 1 ? strArr[1] : ''}</span>
				<span className={classNames(styles.unit)}>{unitString}</span>
			</span>
		)
	}

	getRewardEstimation() {
		return this.secondsToDisplay(this.props.balances.rewardEstimation)
	}

  secondsToDisplay(value: number) {
		if (!value) {
			return `N/A`
		}
		let time = (value / 3600)
		let unit = `h`
		if (time >= 24) {
			time /= 24
			unit = ` days`
		}
    return `${time.toFixed(2)}${unit}`
  }

	render() {
    const { t } = this.props
		const { balances } = this.props;
		return (
			<div className={[HLayout.hBoxContainer, styles.balanceContainer].join(' ')} data-tid="balance-container">

				<div className={[styles.cloakBalance, HLayout.hBoxChild].join(' ')}>
					<div className={styles.balanceWraper}>
						<div className={styles.balanceTitle}>{t(`CLOAK Balance`)}</div>
						<div className={this.getBalanceValueStyles('cloak')}>
							<div className={styles.balanceStatus}>
								<img src={this.getBalanceChangeImage(balances.balanceChangesIn7Days)} alt="img" />
								<p>7 days</p>
							</div>
							<p className={styles.balance}>
								{this.renderBalanceValue(balances.balance, ``)}
							</p>
						</div>
					</div>
				</div>

				<div className={[styles.rewardBalance, HLayout.hBoxChild].join(' ')}>
					<div className={styles.balanceWraper}>
						<div className={styles.balanceTitle}>
							<div>{t(`Last Reward`)}</div>
							<div className={styles.rewardDate}>est. {this.getRewardEstimation()}</div>
						</div>
						<div className={this.getBalanceValueStyles('reward')}>
							<div className={styles.rewardStatus}>
								<img src={reward} alt="img" />
								<p>7 days</p>
							</div>
							<p className={styles.balance}>
								{this.renderBalanceValue(balances.reward, `+`)}
							</p>
						</div>
					</div>
				</div>

				<div className={[styles.valueBalance, HLayout.hBoxChild].join(' ')}>
					<div className={styles.balanceWraper}>
						<div className={styles.balanceTitle}>{t(`Total Wallet Value`)}</div>
						<div className={this.getBalanceValueStyles('value')}>
							<div className={styles.balanceStatus}>
								<img src={this.getBalanceChangeImage(balances.valueChangesIn7Days)} alt="img" />
								<p>7 days</p>
							</div>
							<p className={styles.balance}>
								{this.renderBalanceValue(balances.value, `$`)}
							</p>
						</div>
					</div>
				</div>

			</div>
		)
	}
}

export default translate('overview')(Balances)
