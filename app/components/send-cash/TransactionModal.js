// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import cn from 'classnames'

import styles from './TransactionModal.scss'
import fingerImg from '~/assets/images/main/send/finger.png';

type Props = {
  t: any,
}

/**
 * @class AddressModal
 * @extends {Component<Props>}
 */
class TransactionModal extends Component<Props> {
  props: Props
  
	render() {
    const { t, isvisible, onClose, txId } = this.props
    if (!isvisible) {
      return null
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
          <img src={fingerImg} alt="finger" />
          <p>TX ID</p>
          <div className={styles.transactionId}>
            {txId}
          </div>
        </div>
      </div>
		)
	}
}

export default (translate('send-cash')(TransactionModal))
