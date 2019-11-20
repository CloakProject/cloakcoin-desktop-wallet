/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// @flow
import { clipboard } from 'electron'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
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
import { RoundedButton } from '~/components/rounded-form'
import { AddressBookActions } from '~/reducers/address-book/address-book.reducer'

const pollingInterval = 10.0

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
      isNewStealthAddress: false,
      isQRcodeVisible: false
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.addressBook.records !== this.props.addressBook.records) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({ selectedAddress: null })
		}
	}

  getAddressLabel = addressRecord => {
		const records = this.props.addressBook.records.filter(record => record.address.toLowerCase() === addressRecord.address.toLowerCase())
		if (records.length !== 0) {
			return records[0].name
		}
		return addressRecord.cloaking ? `(Cloaking)` : 'No label'
  }

  handleSelectAddress = record => {
		this.setState({selectedAddress: record});
  }
  
	handleNewAddress = (isStealth = false) => {
		this.setState({isNewStealthAddress: isStealth})
		this.props.actions.openNewAddressModal()
	}

	handleCopy = () => {
		if (this.state.selectedAddress) {
			clipboard.writeText(this.state.selectedAddress.address)
			toastr.success(`Copied to clipboard`)
		}
  }
  
	handleShowQrCode = () => {
		if (this.state.selectedAddress) {
			this.setState({isQRcodeVisible: true})
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
					isVisible={this.props.addressBook.newAddressModal.isVisible}
					isStealth={this.state.isNewStealthAddress}
					onClose={this.props.newAddressModalActions.close}
					isOwnAddress
				/>
        { this.state.selectedAddress && <QRCodeModal isVisible={this.state.isQRcodeVisible} value={this.state.selectedAddress.address} onClose={() => this.setState({isQRcodeVisible: false})} /> }
				<div className={styles.receiveCashWrapper}>
					<div className={styles.leftSide}>
						<img className={styles.statusImg} src={receiveImg} alt="img" />
						<p>{t('RECEIVE COINS')}</p>
					</div>
					<div className={styles.rightSide}>
						<p>{t('CloakCoin addresses')}</p>
						<div className={styles.receiveAddress}>
              {
								this.props.ownAddresses.addresses &&
								this.props.ownAddresses.addresses
									.slice()
									.sort((a, b) => this.getAddressLabel(a).toLowerCase().localeCompare(this.getAddressLabel(b).toLowerCase()))
									.map(item => (
										<div
											key={item.address}
											className={(this.state.selectedAddress && this.state.selectedAddress.address === item.address) ? styles.active: ''}
											onClick={() => this.handleSelectAddress(item)}
										>
											<p>
												{this.getAddressLabel(item)}
											</p>
											<p>{item.address}</p>
										</div>
									))
              }
						</div>
					</div>
				</div>
				<div className={styles.receiveButtons}>
					<RoundedButton className={styles.newCloakAddress} type="button" onClick={() => this.handleNewAddress()}>
						{t(`New address`)}
					</RoundedButton>
					<RoundedButton className={styles.newStealthAddress} type="button" onClick={() => this.handleNewAddress(true)}>
						{t(`New ENIGMA address`)}
					</RoundedButton>
					<RoundedButton className={styles.copyAddress} type="button" onClick={() => this.handleCopy()}>
						{t(`Copy address`)}
					</RoundedButton>
					<RoundedButton className={styles.showQrCode} type="button" onClick={() => this.handleShowQrCode()}>
						{t(`Show QR code`)}
					</RoundedButton>
					{/* <RoundedButton className={styles.verifyMessage} type="button">
						{t(`Sign message`)}
					</RoundedButton> */}
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
  addressBook: state.addressBook,
  ownAddresses: state.ownAddresses
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(AddressBookActions, dispatch),
  newAddressModalActions: bindActionCreators(AddressBookActions.newAddressModal, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('receive-cash')(ReceiveCash))
