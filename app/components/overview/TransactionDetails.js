// @flow
import log from 'electron-log'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import cn from 'classnames'
import { routerActions } from 'react-router-redux'

import { BorderlessButton } from '~/components/rounded-form'
import {
  UniformList,
  UniformListHeader,
  UniformListRow,
  UniformListColumn
} from '~/components/uniform-list'
import { OverviewState } from '~/reducers/overview/overview.reducer'

import styles from './TransactionDetails.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

type Props = {
  t: any,
  overview: OverviewState,
  routerActions: object
}

const getNameTranslation = (t, name) => ({
  amount: t(`Amount`),
  blockhash: t(`Block hash`),
  blockindex: t(`Block index`),
  blocktime: t(`Block time`),
  confirmations: t(`Confirmations`),
  expiryheight: t(`Expiry height`),
  generated: t(`Generated`),
  hex: t(`Hex`),
  time: t(`Time`),
  timereceived: t(`Time received`),
  txid: t(`Transaction ID`),
})[name] || name

/**
 * @export
 * @class TransactionDetails
 * @extends {Component<Props>}
 */
class TransactionDetails extends Component<Props> {
	props: Props

  getListHeaderRenderer() {
    const { t } = this.props

    return(
      <UniformListHeader>
        <UniformListColumn width="10rem">{t(`Name`)}</UniformListColumn>
        <UniformListColumn>{t(`Value`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(item: object) {
    const { t } = this.props

    return (
      <UniformListRow key={item.name}>
        <UniformListColumn>{getNameTranslation(t, item.name)}</UniformListColumn>
        <UniformListColumn>{item.value.toString()}</UniformListColumn>
      </UniformListRow>
    )
  }

	/**
	 * @returns
	 * @memberof TransactionDetails
	 */
	render() {
    const { t } = this.props

    const { transactionDetails } = this.props.overview

    log.debug(`transactionDetails`, transactionDetails, this.props.overview.transactionDetails)
    const items = Object.keys(transactionDetails).map(key => ({
      name: key,
      value: transactionDetails[key]
    }))

		return (
			<div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.container)}>
        <BorderlessButton
          className={styles.backButton}
          onClick={() => this.props.routerActions.push('/overview')}
          glyphClassName={styles.glyph}
        >
          {t(`Back to transactions list`)}
        </BorderlessButton>

				<div className={styles.title}>{t(`Transaction details`)}</div>

        <UniformList
          items={items}
          sortKeys={['name']}
          headerRenderer={() => this.getListHeaderRenderer()}
          rowRenderer={record => this.getListRowRenderer(record)}
        />
			</div>
		)
	}
}

const mapStateToProps = state => ({
  overview: state.overview,
})

const mapDispatchToProps = dispatch => ({
  routerActions: bindActionCreators(routerActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('overview')(TransactionDetails))
