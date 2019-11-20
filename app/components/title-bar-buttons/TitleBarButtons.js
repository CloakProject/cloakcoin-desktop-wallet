// @flow
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

// TODO: move from Navi actions to here #114
import { NaviActions } from '~/reducers/navi/navi.reducer'
import styles from './TitleBarButtons.scss'

type Props = {
  navi: Object
}

export const DragBar = () => (
  <div className={styles.dragBar} />
)

class TitleBarButtons extends Component<Props> {
	props: Props

	render() {
		return (
      <div className={[styles.titleBarButtonsContainer]}>
        <div
          role="none"
          className={styles.closeButton}
          onClick={this.props.navi.mainWindowClose}
          onKeyDown={this.props.navi.mainWindowClose}
        />
        <div
          role="none"
          className={styles.minimizeButton}
          onClick={this.props.navi.mainWindowMinimize}
          onKeyDown={this.props.navi.mainWindowMinimize}
        />
        <div
          role="none"
          className={styles.maximizeButton}
          onClick={this.props.navi.mainWindowMaximize}
          onKeyDown={this.props.navi.mainWindowMaximize}
        />
      </div>
		)
	}
}

const mapDispatchToProps = dispatch => ({
  navi: bindActionCreators(NaviActions, dispatch),
})

export default connect(null, mapDispatchToProps)(TitleBarButtons)
