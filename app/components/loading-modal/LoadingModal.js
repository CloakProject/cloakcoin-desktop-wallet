import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'

import animatedLoader from '~/assets/images/animated-loader.svg'
import styles from './LoadingModal.scss'


type Props = {
  t: any
}


/**
 * @class LoadingModal
 * @extends {Component<Props>}
 */
class LoadingModal extends Component<Props> {
  render() {
    const { t } = this.props

    return (
      <div className={styles.overlay}>
        <div className={styles.container}>
          <img className={styles.animatedLoader} src={animatedLoader} alt="cloak" />
          <div className={styles.header}>
            {t(`Please wait`)}
          </div>
          <div className={styles.explanation}>
            {0}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
	newAddressModal: state.addressBook.newAddressModal
})

export default connect(mapStateToProps, null)(translate('other')(LoadingModal))
