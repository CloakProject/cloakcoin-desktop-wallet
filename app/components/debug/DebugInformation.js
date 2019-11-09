/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import styles from './DebugInformation.scss'
import {
	RoundedButton
} from '~/components/rounded-form'
import { DebugActions, DebugState } from '~/reducers/debug/debug.reducer'
import { BlockchainInfo } from '~/reducers/system-info/system-info.reducer'

type Props = {
  t: Any,
  debug: DebugState,
  blockchainInfo: BlockchainInfo
}

class DebugInformation extends Component<Props> {
	props: Props
	
	dateToString(date) {
    const { t } = this.props

    if (!date) {
      return t('N/A')
    }
		
		return date.toLocaleString()
  }

	render() {
		const { t } = this.props
		
    const coreGroupData = [
      {label: 'Client name', value: this.props.blockchainInfo.clientName},
      {label: 'Client version', value: this.props.blockchainInfo.version},
      {label: 'Using OpenSSL version', value: this.props.blockchainInfo.openSslVersion},
      {label: 'Build date', value: this.props.blockchainInfo.clientBuiltDate},
      {label: 'Startup time', value: this.dateToString(this.props.blockchainInfo.clientStartupTime)}
    ]
    const networkGroupData = [
      {label: 'Number of connections', value: this.props.blockchainInfo.connections},
      {label: 'On testnet', value: this.props.blockchainInfo.testnet}
    ]
    const blockchainGroupData = [
      {label: 'Current number of blocks', value: this.props.blockchainInfo.blocks},
      {label: 'Estimated total blocks', value: this.props.blockchainInfo.highestBlock},
      {label: 'Last block time', value: this.dateToString(this.props.blockchainInfo.lastBlockTime)}
    ]
    
    return (
			<div className={cn(styles.container)}>
				<div className={cn(styles.group)}>
					<div className={cn(styles.header)}>
						{t(`Cloakcoin Core`)}
					</div>
					<div className={cn(styles.body)}>
						{
							coreGroupData.map((item, index) => {
								return (
									<div className={cn(styles.item, index !== coreGroupData.length - 1 ? styles.borderBottom : '')} key={item.label}>
										<p>{t(item.label)}</p>
										<p>{item.value}</p>
									</div>
								)
							})
						}
					</div>
				</div>

				<div className={cn(styles.group)}>
					<div className={cn(styles.header)}>
						{t(`Network`)}
					</div>
					<div className={cn(styles.body)}>
						{
							networkGroupData.map((item, index) => {
								return (
									<div className={cn(styles.item, index !== networkGroupData.length - 1 ? styles.borderBottom : '')} key={item.label}>
										<p>{t(item.label)}</p>
										<p>
											{ typeof item.value === 'boolean' ?
												(<input
													type="checkbox"
													value={item.value}
													disabled
												/>) :
												item.value
											}
										</p>
									</div>
								)
							})
						}
					</div>
				</div>

				<div className={cn(styles.group)}>
					<div className={cn(styles.header)}>
						{t(`Blockchain`)}
					</div>
					<div className={cn(styles.body)}>
						{
							blockchainGroupData.map((item, index) => {
								return (
									<div className={cn(styles.item, index !== blockchainGroupData.length - 1 ? styles.borderBottom : '')} key={item.label}>
										<p>{t(item.label)}</p>
										<p>{item.value}</p>
									</div>
								)
							})
						}
					</div>
				</div>
				<div className={cn(styles.actions)}>
					<RoundedButton
						className={styles.debugLogFileButton}
						type="button"
						onClick={this.props.actions.openNodeLogFile}
						important
					>
						{t(`Debug log file`)}
					</RoundedButton>
					<RoundedButton
						className={styles.closeButton}
						type="button"
						onClick={this.props.actions.closeDebug}
						important
					>
						{t(`Close`)}
					</RoundedButton>
				</div>
			</div>
    )
  }
}

const mapStateToProps = state => ({
  debug: state.debug,	
  blockchainInfo: state.systemInfo.blockchainInfo
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(DebugActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('debug')(DebugInformation))
