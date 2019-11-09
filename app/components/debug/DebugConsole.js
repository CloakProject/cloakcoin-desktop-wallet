/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import moment from 'moment'
import cn from 'classnames'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import styles from './DebugConsole.scss'
import {
	RoundedButton
} from '~/components/rounded-form'
import { DebugActions, DebugState } from '~/reducers/debug/debug.reducer'
import icon from '~/assets/images/icon.png'

type Props = {
	t: Any,
	debug: DebugState
}

class DebugConsole extends Component<Props> {
	props: Props

	componentDidMount() {
		this.componentDidUpdate()
	}

	componentDidUpdate() {
		const listDom = document.getElementById('responseList')
		listDom.lastChild.scrollIntoView()
		this.commandPrompt.focus()
	}

	dateToString(date) {
		const { t } = this.props

		if (!date) {
			return t('N/A')
		}

		return moment.unix(date.getTime() / 1000).format('HH:mm:ss')
	}

	onCommand(e) {
		if (this.commandPrompt) {
			if (e.key === 'Enter') {
				let command = this.commandPrompt.value
				if (command !== undefined && command !== null) {
					command = command.trim()
				}
				if (!command) {
					return
				}
				const listDom = document.getElementById('responseList')
				this.props.actions.requestCommand(command)
				this.commandPrompt.value = ''
			} else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
				const up = e.key === 'ArrowUp'
				let history = []
				if (this.props.debug.commandHistory.length > 0) {
					for (let i = this.props.debug.commandHistory.length - 1; i >= 0; i--) {
						const cmdItem = this.props.debug.commandHistory[i]
						if (cmdItem.command) {
							if (history.find((h) => h.response === cmdItem.response) === undefined) {
								history = [cmdItem, ...history]
							}
						}
					}
				}
				if (history.length > 0) {
					let historyPos = this.props.debug.historyPos
					if (historyPos === null) {
						historyPos = history.length
					}
					historyPos = up ? (historyPos - 1) : (historyPos + 1)
					if (historyPos < 0) {
						historyPos = 0
					}
					if (historyPos >= history.length) {
						this.props.actions.updateHistoryPos(null)
						this.commandPrompt.value = ''
						return
					}
					this.props.actions.updateHistoryPos(historyPos)
					this.commandPrompt.value = history[historyPos].response
				}
			} else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
				this.clearHistory()
			}
		}
	}

	clearHistory() {
		if (this.commandPrompt) {
			this.commandPrompt.value = ''
		}
		this.props.actions.clearCommandHistory()
		this.commandPrompt.focus()
	}

	render() {
		const { t, debug } = this.props

		return (
			<div className={cn(styles.container)}>
				<div id="responseList" className={cn(styles.responseList)}>
					{debug.commandHistory.map((command, index) => (
						<div key={index} className={cn(styles.command)}>
							<div className={cn(styles.time)}>
								{this.dateToString(command.time)}
							</div>
							<img className={cn(styles.icon)} src={icon} alt="img" />
							<div className={cn(styles.response)}>
								<ul>
									{command.response.split('\n').map((text, index) => <li key={index}>{text}</li>)}
								</ul>
							</div>
						</div>
					))}
				</div>
				<div className={cn(styles.actions)}>
					<div className={cn(styles.prompt)}>
						<b>></b>
						<input
							type="text"
							ref={(input) => this.commandPrompt = input}
							onKeyDown={(e) => this.onCommand(e)}
						/>
					</div>
					<RoundedButton
						className={styles.debugLogFileButton}
						type="button"
						onClick={() => this.clearHistory()}
						important
					>
						{t(`Clear console`)}
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

export default connect(mapStateToProps, mapDispatchToProps)(translate('debug')(DebugConsole))
