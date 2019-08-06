// @flow
import * as fs from 'fs'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { LazyLog } from 'react-lazylog'
import cn from 'classnames'

import { ChildProcessService, ChildProcessName } from '~/service/child-process-service'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'

import 'react-tabs/style/react-tabs.scss'
import styles from './status-modal.scss'

const childProcess = new ChildProcessService()

const processNames = ['NODE']

type Props = {
  t: any,
	settings: SettingsState,
  systemInfo: SystemInfoState,
  actions: object
}

type ModalState = {
  processLogFilesPath: { [ChildProcessName]: string },
  selectedTabIndex: number
}

class StatusModal extends Component<Props> {
	props: Props
  state: ModalState
  refreshPathKey: number

	/**
	 * @memberof StatusModal
	 */
  constructor(props) {
    super(props)
    this.state = {
      processLogFilesPath: {},
      selectedTabIndex: 0
    }
    this.refreshPathKey = 0
  }

	/**
	 * @memberof StatusModal
	 */
	componentDidMount() {
    this.checkLogFilesExistence()
  }

	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

  onTabSelected(index: number) {
    this.setState({ selectedTabIndex: index })
    this.checkLogFilesExistence()
  }

	/**
   * Check every process log file for accessibility.
   *
	 * @memberof StatusModal
	 */
  checkLogFilesExistence() {
    processNames.forEach((processName) => {
      let logFilePath = childProcess.getLogFilePath(processName)

      fs.access(logFilePath, err => {
        if (err) {
          logFilePath = null
        }
        this.setState({ processLogFilesPath:  {
          // eslint-disable-next-line react/no-access-state-in-setstate
          ...this.state.processLogFilesPath,
          [processName]: logFilePath
        }})
      })
    })
  }

  getLazyLogElement(processName: ChildProcessName) {
    if (this.state.processLogFilesPath[processName]) {
      return (
        <LazyLog url={this.state.processLogFilesPath[processName]} selectableLines follow />
      )
    }

    return (
      <span>
        {this.props.t(`The log file for {{processName}} doesn't exist yet. Start the process in order to have something here.`, { processName })}
      </span>
    )
  }

  getChildProcessStatusClassNames(processName: ChildProcessName) {
    const processStatus = this.props.settings.childProcessesStatus[processName]
    const statusClassNames = [styles.statusIcon]

    if (processStatus === 'RUNNING' || processStatus === 'STARTING') {
      statusClassNames.push('icon-status-running')
    } else {
      statusClassNames.push('icon-status-stop')
    }

    const color = childProcess.getChildProcessStatusColor(processStatus)

    if (color) {
      statusClassNames.push(styles[color])
    }

    return statusClassNames.join(' ')
  }

  getIsRefreshButtonDisabled() {
    const processName = processNames[this.state.selectedTabIndex - 1]
    return this.state.selectedTabIndex === 0 || this.state.processLogFilesPath[processName] === null
  }

  onRefreshClicked(event) {
		this.eventConfirm(event)

    const processName = processNames[this.state.selectedTabIndex - 1]
    const logFilePath = childProcess.getLogFilePath(processName)
    const pathWithRefreshKey = `${logFilePath}?refreshPathKey=${this.refreshPathKey}`

    this.setState({ processLogFilesPath:  {
      // eslint-disable-next-line react/no-access-state-in-setstate
      ...this.state.processLogFilesPath,
      [processName]: pathWithRefreshKey
    }})
    this.refreshPathKey += 1
  }

  render() {
    const { t } = this.props
    const nodeInfo = this.props.systemInfo.daemonInfo

    return (
        <div className={styles.overlay}>
          <div className={cn(styles.container, styles.statusModal)}>
            <div
              role="button"
              tabIndex={0}
              className={cn('icon', styles.closeButton)}
              onClick={this.props.actions.closeStatusModal}
              onKeyDown={() => {}}
            />

            <div className={styles.title}>
              {t(`Services status`)}
            </div>

            <Tabs
              className={styles.tabs}
              selectedTabClassName={styles.selectedTab}
              selectedTabPanelClassName={styles.selectedTabPanel}
              onSelect={(index) => {this.onTabSelected(index)}}
            >
              <TabList className={styles.tabList}>
                <Tab className={styles.tab}>{t(`Get Info`)}</Tab>
                <Tab className={styles.tab}>
                  <i
                    className={this.getChildProcessStatusClassNames('NODE')}
                    title={childProcess.getStatusName(this.props.settings.childProcessesStatus.NODE)}
                  />
                  {t(`Node`)}
                </Tab>
              </TabList>

              <TabPanel className={styles.tabPanel}>
                <table className={styles.table}>
                  <tbody>
                    <tr><td width="30%">{t(`Balance`)}</td><td>{nodeInfo.balance}</td></tr>
                    <tr><td>{t(`Blocks`)}</td><td>{nodeInfo.blocks}</td></tr>
                    <tr><td>{t(`Connections`)}</td><td>{nodeInfo.connections}</td></tr>
                    <tr><td>{t(`Difficulty`)}</td><td>{nodeInfo.difficulty}</td></tr>
                    <tr><td>{t(`Errors`)}</td><td><div>{nodeInfo.errors}</div></td></tr>
                    <tr><td>{t(`Key Pool Oldest`)}</td><td>{nodeInfo.keypoololdest}</td></tr>
                    <tr><td>{t(`Key Pool Size`)}</td><td>{nodeInfo.keypoolsize}</td></tr>
                    <tr><td>{t(`Pay TX Fee`)}</td><td>{nodeInfo.paytxfee}</td></tr>
                    <tr><td>{t(`Protocol Version`)}</td><td>{nodeInfo.protocolversion}</td></tr>
                    <tr><td>{t(`Proxy`)}</td><td>{nodeInfo.proxy}</td></tr>
                    <tr><td>{t(`Relay Fee`)}</td><td>{nodeInfo.relayfee}</td></tr>
                    <tr><td>{t(`Testnet`)}</td><td>{nodeInfo.testnet}</td></tr>
                    <tr><td>{t(`Time Offset`)}</td><td>{nodeInfo.timeoffset}</td></tr>
                    <tr><td>{t(`Version`)}</td><td>{nodeInfo.version}</td></tr>
                    <tr><td>{t(`Wallet Version`)}</td><td>{nodeInfo.walletversion}</td></tr>
                  </tbody>
                </table>
              </TabPanel>

              {processNames.map(processName => (
                <TabPanel key={processName}>
                  {this.getLazyLogElement(processName)}
                </TabPanel>
              ))}

            </Tabs>

            {!this.getIsRefreshButtonDisabled() &&
              <button
                type="button"
                className={cn('icon', styles.refreshButton)}
                onClick={event => this.onRefreshClicked(event)}
              />
            }

          </div>

        </div>
    )
  }
}

const mapStateToProps = state => ({
	settings: state.settings,
  systemInfo: state.systemInfo,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SettingsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('settings')(StatusModal))
