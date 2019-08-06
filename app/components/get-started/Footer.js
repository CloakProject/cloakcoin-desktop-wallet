// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'

import { NaviState } from '~/reducers/navi/navi.reducer'

import styles from './Footer.scss'

type Props = {
  t: any,
	navi: NaviState
}

class Footer extends Component<Props> {
	props: Props

	/**
	 * @memberof Footer
	 */
	render() {
    const { t } = this.props

		return (
			<div className={styles.container}>
        {t(``)}
			</div>
		)
	}
}

const mapStateToProps = state => ({
	navi: state.navi
})

export default connect(mapStateToProps, null)(translate('get-started')(Footer))
