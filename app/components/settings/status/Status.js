/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import { connect } from 'react-redux'
import { BlockchainInfo } from '~/reducers/system-info/system-info.reducer'
import styles from './Status.scss'

type Props = {
  className?: string,
	blockchainInfo?: BlockchainInfo
}

class Status extends Component<Props> {
  props: Props

  elapsedMinutes(date: Date)
  {
    if (!date) {
      return 'N/A'
    }
    const elapsedMs = Date.now() - date
    const elapsedMin = Math.round(elapsedMs / 1000 / 60)
    return `${elapsedMin || 1}m`
  }
    
	render() {
    const statusData = [
      {label: 'Blockchain', value: `${this.props.blockchainInfo.blockchainSynchronizedPercentage}%`},
      {label: 'Current difficulty', value: this.props.blockchainInfo.difficulty.toFixed(2)},
      {label: 'Download blocks', value: this.props.blockchainInfo.blocks},
      {label: 'Last received', value: this.elapsedMinutes(this.props.blockchainInfo.lastBlockDate)},
      {label: 'Anons', value: this.props.blockchainInfo.anons},
      {label: 'Cloaking', value: this.props.blockchainInfo.cloakings},
      {label: 'Minting', value: this.props.blockchainInfo.newMint.toFixed(2)},
      {label: 'Your weight', value: this.props.blockchainInfo.weight},
      {label: 'Network weight', value: this.props.blockchainInfo.networkWeight},
      {label: 'Stake', value: this.props.blockchainInfo.stake.toFixed(2)},
      {label: 'Unconfirmed', value: this.props.blockchainInfo.unconfirmedBalance.toFixed(2)},
      {label: 'Immature', value: this.props.blockchainInfo.immatureBalance.toFixed(2)},
      {label: 'Earnings', value: this.props.blockchainInfo.cloakingEarnings.toFixed(2)},
    ]
    
    return (
      <div className={cn(styles.statusContainer, this.props.className)}>
        {
          statusData.map((item, index) => {
            return (
              <div className={cn(styles.item, index !== statusData.length - 1 ? styles.borderBottom : '')} key={item.label}>
                <p>{item.label}</p>
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
  blockchainInfo: state.systemInfo.blockchainInfo
});

// const mapDispatchToProps = dispatch => ({
//   blockchainInfo: bindActionCreators(SystemInfoActions.gotBlockchainInfo, dispatch)
// })

export default connect(mapStateToProps)(Status)
