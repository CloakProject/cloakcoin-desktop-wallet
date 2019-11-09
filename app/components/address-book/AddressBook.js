/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/prop-types */
// @flow
import { clipboard } from 'electron'
import React, { Component } from 'react'
import { toastr } from 'react-redux-toastr'
import cn from 'classnames'
import styles from './AddressBook.scss'
import NewAddressModal from '~/components/address-book/NewAddressModal'
import QRCodeModal from '~/components/address-book/QRCodeModal'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import addressbookImg from '~/assets/images/main/addressbook/addressbook.png';
import { RoundedButton } from '~/components/rounded-form'

type Props = {
	t: any
}

/**
 * @class AddressBook
 * @extends {Component<Props>}
 */
export class AddressBook extends Component<Props> {
  props: Props
  
	/**
	 * @memberof AddressBook
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

	handleSelectAddress = record => {
		this.setState({ selectedAddress: record });
	}

	handleNewAddress = (isStealth = false) => {
		this.setState({ isNewStealthAddress: isStealth })
		this.props.actions.openNewAddressModal()
	}

	removeAddress = () => {
		if (this.state.selectedAddress) {
			this.props.actions.confirmAddressRemoval(this.state.selectedAddress)
		}
	}

	handleCopy = () => {
		if (this.state.selectedAddress) {
			clipboard.writeText(this.state.selectedAddress.address)
			toastr.success(`Copied to clipboard`)
		}
	}

	handleShowQrCode = () => {
		if (this.state.selectedAddress) {
			this.setState({ isQRcodeVisible: true })
		}
	}

	getAddressBookRecords() {
		return this.props.addressBook.records
			.sort((a, b) => {
        const i1 = this.props.addressBook.isDescending ? b : a
        const i2 = this.props.addressBook.isDescending ? a : b
        const valueName = this.props.addressBook.sortedHeader === 'address' ? 'address' : 'name'
        return i1[valueName].toLowerCase().localeCompare(i2[valueName].toLowerCase())
      })
  }
  
  getHeaderStyle(header: string) {
    const sorted = header === this.props.addressBook.sortedHeader
    return cn(
      styles.header,
      sorted ? styles.sorted : '',
      this.props.addressBook.isDescending ? styles.descending : styles.ascending
    )
  }

  sortAddressBook(header: string) {
    const isDescending = header === this.props.addressBook.sortedHeader ? !this.props.addressBook.isDescending : false
    this.props.actions.sortAddressBook(header, isDescending)
  }


	render() {
		const { t } = this.props
		return (
			<div className={[styles.addressBookContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
				<NewAddressModal
					isVisible={this.props.addressBook.newAddressModal.isVisible}
					isStealth={this.state.isNewStealthAddress}
					onClose={this.props.newAddressModalActions.close}
				/>
				{this.state.selectedAddress && <QRCodeModal isVisible={this.state.isQRcodeVisible} value={this.state.selectedAddress.address} onClose={() => this.setState({ isQRcodeVisible: false })} />}
				<div className={styles.addressBookWrapper}>
					<div className={styles.leftSide}>
						<img className={styles.statusImg} src={addressbookImg} alt="img" />
						<p>{t('ADDRESS BOOK')}</p>
					</div>
					<div className={styles.rightSide}>
						<div className={styles.addressFilterContainer}>
              <div
                className={this.getHeaderStyle('label')}
                onClick={() => this.sortAddressBook('label')}
              >
                {t('Label')}
							</div>
              <div
                className={this.getHeaderStyle('address')}
                onClick={() => this.sortAddressBook('address')}
              >
                {t('Address')}
							</div>
						</div>
						<div className={styles.addressBook}>
							{this.getAddressBookRecords()
								.map(record => (
									<div
										key={record.name}
										className={cn((this.state.selectedAddress && this.state.selectedAddress.name === record.name) ? styles.active : '', record.isEnigma ? styles.enigmaAddress : styles.cloakAddress)}
										onClick={() => this.handleSelectAddress(record)}
									>
										<p>{record.name}</p>
										<p>{record.address}</p>
									</div>
								))}
						</div>
					</div>
				</div>
				<div className={styles.addressBookButtons}>
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
					<RoundedButton className={styles.delete} type="button" onClick={() => this.removeAddress()}>
						{t(`Delete`)}
					</RoundedButton>
				</div>
			</div>
		)
	}
}

export default AddressBook;
