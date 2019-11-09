/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import moment from 'moment'
import cn from 'classnames'
import { CloakingRequest, EnigmaStatsActions } from '~/reducers/enigma-stats/enigma-stats.reducer'
import { OptionsState } from '~/reducers/options/options.reducer'
import RpcPolling from '~/components/rpc-polling/rpc-polling'
import TransactionModal from '~/components/send-cash/TransactionModal'
import styles from './EnigmaActivityList.scss'

const cloakingRequestsPollingInterval = 30.0

type Props = {
  t: any,
  options: OptionsState,
  cloakingRequests: Array<CloakingRequest>,
  sortedHeader: string,
  isDescending: boolean
}

class EnigmaActivityList extends Component<Props> {
  props: Props

  constructor(props) {
		super(props);
		this.state = {
      isTxModalVisible: false,
      txId: null,
		};
  }

  getStatus(req) {
    const { t } = this.props
    if (req.abored) {
      return t('Aborted')
    }
    if (req.txid) {
      return t('Complete')
    }
    if (req.signers.length < req.participantsRequired && req.expiresInMs > 0) {
      if (!req.retryCount) {
        return t(`Polling: {{expiresInMs}}secs left`, {expiresInMs: req.expiresInMs})
      }
      return t(`Retry {{retryCount}}: {{expiresInMs}}secs left`, {retryCount: req.retryCount, expiresInMs: req.expiresInMs})
    }
    if (req.autoRetry && req.retryCount < 3 && this.props.options.enigmaAutoRetry) {
      return t(`Will retry ({{retryCount}}) left`, {retryCount: 3 - req.retryCount})
    }
    return t(`Failed (Expired)`)
  }

  getValue(req, valueName) {
    let val = ''
    switch (valueName) {
      case 'type':
        val = req.mine ? 'Send' : 'Cloak'
        break
      case 'timeInitiated':
        val = req.timeInitiated
        break
      case 'amount':
        val = req.amount
        break
      case 'participantsRequired':
        val = req.participantsRequired + 1
        break
      case 'participantsAcquired':
        val = req.participants.length + 1
        break
      case 'participantsSigned':
        val = req.signers.length
        break
      case 'status':
        val = this.getStatus(req)
        break
      case 'txid':
        val = req.txid
        break
      default:
        val = ''
        break
    }
    return val
  }

	getCloakingRequests() {
		return this.props.cloakingRequests
			.sort((a, b) => {
        const i1 = this.props.isDescending ? b : a
        const i2 = this.props.isDescending ? a : b
        const val1 = this.getValue(i1, this.props.sortedHeader)
        const val2 = this.getValue(i2, this.props.sortedHeader)
        return val1.toString().toLowerCase().localeCompare(val2.toLowerCase())
      })
  }
  
  getHeaderStyle(header: string) {
    const sorted = header === this.props.sortedHeader
    return cn(
      styles.header,
      sorted ? styles.sorted : '',
      this.props.isDescending ? styles.descending : styles.ascending
    )
  }

  sortAddressBook(header: string) {
    const isDescending = header === this.props.sortedHeader ? !this.props.isDescending : false
    this.props.actions.sortCloakingRequests(header, isDescending)
  }

  onTxid(txId) {
    this.setState({txId, isTxModalVisible: true})
  }

	render() {
    const { t } = this.props
		return (
      <div className={cn(styles.enigmaActivityList)}>

        <RpcPolling
          interval={cloakingRequestsPollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: EnigmaStatsActions.getCloakingRequests,
            success: EnigmaStatsActions.gotCloakingRequests,
            failure: EnigmaStatsActions.getCloakingRequestsFailure
          }}
        />

        <TransactionModal isVisible={this.state.isTxModalVisible} txId={this.state.txId} onClose={() => this.setState({isTxModalVisible: false})} />

        <div className={styles.tableHeader}>
          <div
            className={this.getHeaderStyle('type')}
            onClick={() => this.sortAddressBook('type')}
          >
            {t('Type')}
          </div>
          <div
            className={this.getHeaderStyle('timeInitiated')}
            onClick={() => this.sortAddressBook('timeInitiated')}
          >
            {t('Initiated on')}
          </div>
          <div
            className={this.getHeaderStyle('amount')}
            onClick={() => this.sortAddressBook('amount')}
          >
            {t('Total')}
          </div>
          <div
            className={this.getHeaderStyle('participantsRequired')}
            onClick={() => this.sortAddressBook('participantsRequired')}
          >
            {t('Participants')}
          </div>
          <div
            className={this.getHeaderStyle('participantsAcquired')}
            onClick={() => this.sortAddressBook('participantsAcquired')}
          >
            {t('Acquired')}
          </div>
          <div
            className={this.getHeaderStyle('participantsSigned')}
            onClick={() => this.sortAddressBook('participantsSigned')}
          >
            {t('Signed')}
          </div>
          <div
            className={this.getHeaderStyle('status')}
            onClick={() => this.sortAddressBook('status')}
          >
            {t('Status')}
          </div>
          <div
            className={this.getHeaderStyle('txid')}
            onClick={() => this.sortAddressBook('txid')}
          >
            {t('Tx id')}
          </div>
        </div>
        <div className={styles.enigmaActivityListContent}>
          {
            this.getCloakingRequests().map((req, index) => (
              <div className={styles.enigmaItem} key={index}>
                <div className={styles.value}>
                  <span>{this.getValue(req, 'type')}</span>
                </div>
                <div className={styles.value}>
                <span>{moment.unix(this.getValue(req, 'timeInitiated')).format('L kk:mm')}</span>
                </div>
                <div className={styles.value}>
                  <span>{this.getValue(req, 'amount').toString()}</span>
                </div>
                <div className={styles.value}>
                  <span>{this.getValue(req, 'participantsRequired')}</span>
                </div>
                <div className={styles.value}>
                  <span>{this.getValue(req, 'participantsAcquired')}</span>
                </div>
                <div className={styles.value}>
                  <span>{this.getValue(req, 'participantsSigned')}</span>
                </div>
                <div className={styles.value}>
                  <span>{this.getValue(req, 'status')}</span>
                </div>
                <div className={styles.value}>
                  { this.getValue(req, 'txid') && (
                    <button
                      type="button"
                      onClick={() => this.onTxid(this.getValue(req, 'txid'))}
                    >
                      {t(`See`)}
                    </button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </div>
		)
	}
}

const mapStateToProps = state => ({
  options: state.options,
  cloakingRequests: state.enigmaStats.cloakingRequests,
  sortedHeader: state.enigmaStats.sortedHeader,
  isDescending: state.enigmaStats.isDescending
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(EnigmaStatsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('enigma-stats')(EnigmaActivityList))
