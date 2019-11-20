// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import cn from 'classnames'

import styles from './TransactionModal.scss'
import fingerImg from '~/assets/images/main/send/finger.png';
import {
  RoundedInput,
  RoundedInputWithCopy,
} from '~/components/rounded-form'

type Props = {
  t: any
}

/**
 * @class TransactionModal
 * @extends {Component<Props>}
 */
class TransactionModal extends Component<Props> {
  props: Props
  
	render() {
    const { t, isVisible, onClose, txId } = this.props
    if (!isVisible) {
      return null
    }

    let { canCopyTxId } = this.props
    if (canCopyTxId === undefined || canCopyTxId === null) {
      canCopyTxId = true
    }

		return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.txAddress)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.modalClose)}
            onClick={onClose}
            onKeyDown={() => {}}
          />
          <img className={cn(styles.finger)} src={fingerImg} alt="finger" />
          <p>{t('TX ID')}</p>
          {canCopyTxId ? (
            <RoundedInputWithCopy
              className={styles.transactionId}
              readOnly={true}
              defaultValue={txId}
            />) : (
            <RoundedInput
              className={styles.transactionId}
              readOnly={true}
              defaultValue={txId}
            />
          )}
        </div>
      </div>
		)
	}
}

export default (translate('send-cash')(TransactionModal))
