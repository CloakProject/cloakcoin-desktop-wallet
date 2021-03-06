// @flow
import React, { Component } from 'react'
import QRCode from 'qrcode.react'
import cn from 'classnames'

import styles from './QRCodeModal.scss'
import {
  RoundedInputWithCopy,
} from '~/components/rounded-form'

/**
 * @class QRCodeModal
 * @extends {Component<Props>}
 */
class QRCodeModal extends Component<Props> {
	render() {
    const { isVisible, value, onClose } = this.props
    if (!isVisible) {
      return null
    }

		return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.qrCodeWrapper)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.modalClose)}
            onClick={onClose}
            onKeyDown={() => {}}
          />
          <div className={styles.qrCode}>
            <QRCode value={value} size={300} />
          </div>
          <RoundedInputWithCopy
            className={styles.qrValue}
            readOnly={true}
            defaultValue={value}
          />
        </div>
      </div>
		)
	}
}

export default QRCodeModal
