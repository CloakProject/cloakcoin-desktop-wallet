/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable import/no-unresolved */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { NavLink } from 'react-router-dom'
import cn from 'classnames'
import { translate } from 'react-i18next'

import { Decimal } from 'decimal.js'
import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { OverviewState, OverviewActions } from '~/reducers/overview/overview.reducer'
import { AddressBookActions } from '~/reducers/address-book/address-book.reducer'
import { SystemInfoState } from '~/reducers/system-info/system-info.reducer'
import { OptionsState } from '~/reducers/options/options.reducer'
import Balances from '~/components/overview/Balances'
import TransactionHistory from '~/components/overview/TransactionHistory'
import PriceChart from '~/components/overview/PriceChart'

import styles from './overview.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

const overviewPopupMenuId = 'overview-row-popup-menu-id'
const transactionsPollingInterval = 30.0
const priceChartPollingInterval = 60.0

type Props = {
  t: any,
  overview: OverviewState,
  systemInfo: SystemInfoState,
  options: OptionsState,
  popupMenu: object,
  addressBookActions: object
}

/**
 * @class Overview
 * @extends {Component<Props>}
 */
class Overview extends Component<Props> {
  props: Props
  
  componentDidMount() {
    this.props.addressBookActions.loadAddressBook()
  }
  
  getBalances() {
    const week = 7

    let timeLimit = ((Date.now() / 1000 / 3600 / 24) - (week - 1)) * 24 * 3600
    if (timeLimit < 0) {
      timeLimit = 0
    }

    let balanceChangesIn7Days = Decimal(`0`)
    this.props.overview.transactions.forEach((t) => {
      if (t.timestamp >= timeLimit) {
        balanceChangesIn7Days = balanceChangesIn7Days.add(t.amount)
      }
    })

    const balance7DaysAgo = this.props.systemInfo.blockchainInfo.balance.sub(balanceChangesIn7Days)
    const price7DaysAgo = (this.props.overview.prices && this.props.overview.prices.length >= (week+1)) ? this.props.overview.prices[this.props.overview.prices.length - 1 - week].price : Decimal(`0`)
    const value7DaysAgo = balance7DaysAgo.mul(price7DaysAgo)
    const priceToday = (this.props.overview.prices && this.props.overview.prices.length > 0) ? this.props.overview.prices[this.props.overview.prices.length - 1].price : Decimal(`0`)
    const valueToday = this.props.systemInfo.blockchainInfo.balance.mul(priceToday)
    const valueChangesIn7Days = valueToday.sub(value7DaysAgo)
    
    const val = {
      balance: this.props.systemInfo.blockchainInfo.balance,
      balanceChangesIn7Days,
      reward: this.props.systemInfo.blockchainInfo.cloakingEarnings,
      rewardEstimation: this.props.systemInfo.blockchainInfo.mintEstimation,
      value: this.props.systemInfo.blockchainInfo.balance.mul(priceToday),
      valueChangesIn7Days
    }

    return val
  }

	/**
	 * @returns
	 * @memberof Overview
	 */
	render() {
    const { t } = this.props
		return (
			<div className={cn(styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer)}>

        <RpcPolling
          interval={transactionsPollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: OverviewActions.getTransactionDataFromWallet,
            success: OverviewActions.gotTransactionDataFromWallet,
            failure: OverviewActions.getTransactionDataFromWalletFailure
          }}
        />
        
        <RpcPolling
          interval={priceChartPollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: OverviewActions.getPriceChart,
            success: OverviewActions.gotPriceChart,
            failure: OverviewActions.getPriceChartFailed
          }}
        />

				{ /* Route content */}
				<div className={cn(styles.overviewContainer, VLayout.vBoxChild, HLayout.hBoxContainer)}>
          <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer)}>
            <Balances balances={this.getBalances()} />
            <div className={cn(styles.transactionChart)}>
              <div className={cn(styles.transactionsContainer)}>
                <div className={cn(styles.transactionTitle)} >
                  <div>{t(`Transactions`)}</div>
                  <NavLink to="/transaction-cash">
                    <div className={cn(styles.viewAll)}>{t(`view all`)}</div>
                  </NavLink>
                </div>
                <TransactionHistory
                  items={this.props.overview.transactions}
                  amountUnit={this.props.options.amountUnit}
                  onRowContextMenu={(e, transactionId) => this.props.popupMenu.show(overviewPopupMenuId, transactionId, e.clientY, e.clientX)}
                />
              </div>
              <PriceChart prices={this.props.overview.prices}/>
            </div>

          </div>
				</div>

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
  systemInfo: state.systemInfo,
  overview: state.overview,
  options: state.options
})

const mapDispatchToProps = dispatch => ({
  addressBookActions: bindActionCreators(AddressBookActions, dispatch),
  popupMenu: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('overview')(Overview))
