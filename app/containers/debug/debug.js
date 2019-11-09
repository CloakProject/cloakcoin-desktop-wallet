// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import DebugInformation from '~/components/debug/DebugInformation'
import DebugConsole from '~/components/debug/DebugConsole'

import styles from './debug.scss'

import { DebugState } from '~/reducers/debug/debug.reducer'

type Props = {
  t: any,
  debug: DebugState
}

/**
 * @class Debug
 * @extends {Component<Props>}
 */
class Debug extends Component<Props> {
  props: Props
  
  constructor(props) {
    super(props);
    this.state = {
      tabId: 'Information'
    }
  }

  onChooseTab = id => {
    this.setState({ tabId: id });
  }

	render() {
    if (!this.props.debug.isDebugOpen) {
      return null
    }

    const { t } = this.props

    const debugTabs = [
      {label: 'Information'},
      {label: 'Console'}
    ]

		return (
      <div className={styles.overlay}>
        <div className={cn(styles.container)}>
          <div className={styles.debugTabs}>
            {
              debugTabs.map(item => (
                <div
                  className={cn(styles.tab, this.state.tabId === item.label ? styles.active : '')}
                  key={item.label}
                  onClick={() => this.onChooseTab(item.label)}
                >
                  <p>{t(item.label)}</p>
                </div>
              ))
            }
          </div>
          <div className={styles.tabContent}>
            {this.state.tabId === 'Information' && <DebugInformation />}
            {this.state.tabId === 'Console' && <DebugConsole />}
          </div>
        </div>
      </div>
		)
	}
}

const mapStateToProps = state => ({
	debug: state.debug
})

export default connect(mapStateToProps, null)(translate('debug')(Debug))
