// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import moment from 'moment'
import cn from 'classnames'

import 'react-tabs/style/react-tabs.scss'
import { UniformList, UniformListHeader, UniformListRow, UniformListColumn} from '~/components/uniform-list'
import { SystemInfoActions } from '~/reducers/system-info/system-info.reducer'
import humanizeOperationName from './humanize-operation'

import styles from './OperationsModal.scss'


const getStatusName = (t, status) => ({
  'queued': t(`Queued`),
  'executing': t(`Executing`),
  'cancelled': t(`Cancelled`),
  'failed': t(`Failed`),
  'success': t(`Success`)
}[status] || t(`Unknown`))

type Props = {
  t: any,
  i18n: any,
  systemInfo: SystemInfoState,
  actions: object
}

class OperationsModal extends Component<Props> {
	props: Props

  getSortedOperations() {
    const sortedOperations = this.props.systemInfo.operations.sort((first, second) => {
      const isPending = operation => Number(['queued', 'executing'].includes(operation.status))
      const priorityComparisonResult = isPending(first) - isPending(second)
      return priorityComparisonResult !== 0 ? -priorityComparisonResult : second.creation_time - first.creation_time
    })

    return sortedOperations
  }

  getListRowRenderer(operation) {
    const { t, i18n } = this.props

    return (
      <UniformListRow key={operation.id}>
        <UniformListColumn>
          {humanizeOperationName(t, operation)}
        </UniformListColumn>
        <UniformListColumn>
          {moment.unix(operation.creation_time).locale(i18n.language).fromNow()}
        </UniformListColumn>
        <UniformListColumn>
          <span className={cn(styles.status, styles[operation.status])}>{getStatusName(t, operation.status)}</span>
        </UniformListColumn>
        <UniformListColumn>
          {operation.error && operation.error.message}
        </UniformListColumn>
        <UniformListColumn>
          {operation.params && operation.params.amounts && operation.params.amounts[0].amount}
        </UniformListColumn>
        <UniformListColumn>
          {operation.params && operation.params.fee}
        </UniformListColumn>
      </UniformListRow>
    )
  }

  getListHeaderRenderer() {
    const { t } = this.props

    return (
      <UniformListHeader>
        <UniformListColumn width="15%">{t(`Operation`)}</UniformListColumn>
        <UniformListColumn width="15%">{t(`Triggered`)}</UniformListColumn>
        <UniformListColumn width="10%">{t(`Status`)}</UniformListColumn>
        <UniformListColumn width="30%">{t(`Error`)}</UniformListColumn>
        <UniformListColumn width="10%">{t(`Amount`)}</UniformListColumn>
        <UniformListColumn width="10%">{t(`Fee`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

  render() {
    const { t } = this.props

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.operationsModal)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeOperationsModal}
            onKeyDown={() => false}
          />

          <div className={styles.title}>
              {t(`Operations`)}&nbsp;
              {this.props.systemInfo.operations.length ? `(${this.props.systemInfo.operations.length})`: ``}
          </div>

          <UniformList
            className={styles.list}
            items={this.props.systemInfo.operations}
            headerRenderer={() => this.getListHeaderRenderer()}
            rowRenderer={operation => this.getListRowRenderer(operation)}
            emptyMessage={t(`You have no operations yet`)}
          />

        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  systemInfo: state.systemInfo
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SystemInfoActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('other')(OperationsModal))
