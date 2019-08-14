// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import styles from './AddressBook.scss'
import DropdownSelect from '~/components/dropdown-select/DropdownSelect'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import addressbookImg from '~/assets/images/main/addressbook/addressbook.png';

type Props = {
  t: any
  // actions: object,
  // popupMenu: object,
	// addressBook: AddressBookState
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

	render() {
    const { t } = this.props
		return (
			<div className={[styles.addressBookContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
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
							<div>
								<p>{t('ENIGMA Address 01')}</p>
								<p>smYhhPyTAU724DkAPysHcegj5SPjPxMYnS6E4...</p>
							</div>
							<div>
								<p>{t('CLOAK Address')}</p>
								<p>C6qQ3syfTeRK4rA7wFox6gLJN1pZkSuofZ</p>
							</div>
							<div>
								<p>{t('Address 03')}</p>
								<p>C3vGyjauAJAAyBGnhdD8jKDCZEuy8L88J1</p>
							</div>
						</div>
					</div>
				</div>
				<div className={styles.addressBookButtons}>
					<button	type="button">
						{t(`New address`)}
					</button>
					<button	type="button">
						{t(`New ENIGMA address`)}
					</button>
					<button	type="button">
						{t(`Copy address`)}
					</button>
					<button	type="button">
						{t(`Show QR code`)}
					</button>
					<button	type="button">
						{t(`Verify message`)}
					</button>
          <button	type="button">
						{t(`Delete`)}
					</button>
				</div>
			</div>
		)
	}
}
