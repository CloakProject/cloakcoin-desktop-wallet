/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/prop-types */
// @flow
import { clipboard } from 'electron'
import React, { Component } from 'react'
import { toastr } from 'react-redux-toastr'
import cn from 'classnames'
import styles from './AddressBook.scss'
import DropdownSelect from '~/components/dropdown-select/DropdownSelect'
import NewAddressModal from '~/components/address-book/NewAddressModal'
import QRCodeModal from '~/components/address-book/QRCodeModal'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import addressbookImg from '~/assets/images/main/addressbook/addressbook.png';

type Props = {
  t: any
  // actions: object,
	// popupMenu: object,
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
			 isNewAddressVisible: false,
			 isQRcodeVisible: false,
			 isEnigma: false,
		 }
	 }

	componentDidMount() {
    this.props.actions.loadAddressBook()
	}

	handleAddressBook = record => {
		this.setState({selectedAddress: record});
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

	render() {
		const { t } = this.props
		return (
			<div className={[styles.addressBookContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
				<NewAddressModal
					isvisible={this.state.isNewAddressVisible}
					isEnigma={this.state.isEnigma}
					onClose={() => this.setState({isNewAddressVisible: false})} 
					isOwnAddress={false}
				/>
				{ this.state.selectedAddress && <QRCodeModal isvisible={this.state.isQRcodeVisible} value={this.state.selectedAddress.address} onClose={() => this.setState({isQRcodeVisible: false})} /> }
				<div className={styles.addressBookWrapper}>
					<div className={styles.leftSide}>
						<img src={addressbookImg} alt="img" />
						<p>{t('ADDRESS BOOK')}</p>
					</div>
					<div className={styles.rightSide}>
            <div className={styles.addressFilterContainer}>
              <div className={styles.labelFilter}>
                <DropdownSelect options={[{value: 'Label', label: 'Label'}]} />
              </div>
              <div className={styles.addressFilter}>
                <DropdownSelect options={[{value: 'Address', label: 'Address'}]} />
              </div>
            </div>
						<div className={styles.addressBook}>
							{this.props.addressBook.records.map(record => (
								<div
									key={record.name}
									className={cn((this.state.selectedAddress && this.state.selectedAddress.name === record.name) ? styles.active: '', record.isEnigma ? styles.enigmaAddress : styles.cloakAddress)}
									onClick={() => this.handleAddressBook(record)}
								>
									<p>{record.name}</p>
									<p>{record.address}</p>
								</div>
								))
							}
						</div>
					</div>
				</div>
				<div className={styles.addressBookButtons}>
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
						{t(`Verify message`)}
					</button>
          <button	type="button" onClick={this.removeAddress}>
						{t(`Delete`)}
					</button>
				</div>
			</div>
		)
	}
}
