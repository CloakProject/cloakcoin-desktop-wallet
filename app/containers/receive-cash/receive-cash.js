/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// @flow
import { clipboard } from 'electron'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toastr } from 'react-redux-toastr'
import { translate } from 'react-i18next'
import styles from './receive-cash.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import NewAddressModal from '~/components/address-book/NewAddressModal'
import QRCodeModal from '~/components/address-book/QRCodeModal'
import { OwnAddressesActions } from '~/reducers/own-addresses/own-addresses.reducer'
import RpcPolling from '~/components/rpc-polling/rpc-polling'
import receiveImg from '~/assets/images/main/receive/receive.png';

const pollingInterval = 5.0

type Props = {
  t: any
}

/**
 * @class receiveCash
 * @extends {Component<Props>}
 */
class ReceiveCash extends Component<Props> {
	props: Props
	/**
	 * @memberof receiveCash
	 */

	constructor(props) {
		super(props);
		this.state = {
			selectedAddress: null,
      isNewAddressVisible: false,
      isQRcodeVisible: false,
			isEnigma: false,
		}
	}

  getAddressLabel = address => {
    const records = this.props.addressBook.records.filter(record => record.address.toLowerCase() === address.toLowerCase());
    return records.length !== 0 ? records[0].name : 'No Label';
  }

  handleAddressBook = record => {
		this.setState({selectedAddress: record});
  }
  
  handleCopy = () => {
		if (this.state.selectedAddress) {
			clipboard.writeText(this.state.selectedAddress.address)
			toastr.success(`Copied to clipboard`)
		}
  }
  
	render() {
    const { t } = this.props
    
		return (
			<div className={[styles.receiveCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
			  <RpcPolling
          interval={pollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: OwnAddressesActions.getOwnAddresses,
            success: OwnAddressesActions.gotOwnAddresses,
            failure: OwnAddressesActions.getOwnAddressesFailure
          }}
        />
				<NewAddressModal
					isvisible={this.state.isNewAddressVisible}
					isEnigma={this.state.isEnigma}
					onClose={() => this.setState({isNewAddressVisible: false})} 
					isOwnAddress
				/>
        { this.state.selectedAddress && <QRCodeModal isvisible={this.state.isQRcodeVisible} value={this.state.selectedAddress.address} onClose={() => this.setState({isQRcodeVisible: false})} /> }
				<div className={styles.receiveCashWrapper}>
					<div className={styles.leftSide}>
						<img src={receiveImg} alt="img" />
						<p>{t('RECEIVE COINS')}</p>
					</div>
					<div className={styles.rightSide}>
						<p>{t('CloakCoin addresses')}</p>
						<div className={styles.receiveAddress}>
              {
                this.props.ownAddresses.addresses && this.props.ownAddresses.addresses.map(item => (
                  <div
                    key={item.address}
                    className={(this.state.selectedAddress && this.state.selectedAddress.address === item.address) ? styles.active: ''}
                    onClick={() => this.handleAddressBook(item)}
                  >
                    <p>
                      {this.getAddressLabel(item.address)}
                      {item.cloaking && `(Cloaking)`}
                    </p>
                    <p>{item.address || 'aa'}</p>
                  </div>
                ))
              }
						</div>
					</div>
				</div>
				<div className={styles.receiveButtons}>
					<button	type="button" onClick={() => this.setState({isNewAddressVisible: true, isEnigma: false})}>
						{t(`New address`)}
					</button>
					<button	type="button" onClick={() => this.setState({isNewAddressVisible: true, isEnigma: true})}>
						{t(`New ENIGMA address`)}
					</button>
					<button	type="button" onClick={this.handleCopy}>
						{t(`Copy address`)}
					</button>
					<button	type="button" onClick={() => this.setState({isQRcodeVisible: true})}>
						{t(`Show QR code`)}
					</button>
					<button	type="button">
						{t(`Sign message`)}
					</button>
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	receiveCash: state.receiveCash,
  addressBook: state.addressBook,
  ownAddresses: state.ownAddresses
})

export default connect(mapStateToProps, null)(translate('receive-cash')(ReceiveCash))
