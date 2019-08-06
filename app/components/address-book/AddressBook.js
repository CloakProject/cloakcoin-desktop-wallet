// @flow
import React, { Component } from 'react'
import cn from 'classnames'

import { AddressBookState } from '~/reducers/address-book/address-book.reducer'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import { RoundedButton } from '~/components/rounded-form'
import NewAddressModal from './NewAddressModal'
import AddressBookList from './AddressBookList'

import styles from './AddressBook.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

const addressBookPopupMenuId = 'address-book-row-popup-menu-id'

type Props = {
  t: any,
  actions: object,
  popupMenu: object,
	addressBook: AddressBookState
}

/**
 * @class AddressBook
 * @extends {Component<Props>}
 */
export class AddressBook extends Component<Props> {
	props: Props

	componentDidMount() {
    this.props.actions.loadAddressBook()
	}

	/**
	 * @returns
	 */
	render() {
    const { t } = this.props

		return (
      /* Layout container */
			<div
        role="none"
				className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}
				onKeyDown={() => {}}
			>

				{/* Top bar */}
				<div className={cn(styles.header, HLayout.hBoxContainer)}>
					<div className={styles.title}>{t(`Address Book`)}</div>

          <div className={styles.buttonsContainer}>
            <RoundedButton
              className={styles.addAddressButton}
              onClick={() => this.props.actions.openNewAddressModal()}
              glyph="add"
              important
            >
              {t(`Add new address`)}
            </RoundedButton>
          </div>

				</div>

        <NewAddressModal />

        <AddressBookList
          items={this.props.addressBook.records}
          onRowContextMenu={(e, record) => this.props.popupMenu.show(addressBookPopupMenuId, record, e.clientY, e.clientX)}
        />

				<PopupMenu id={addressBookPopupMenuId}>
          <PopupMenuItem onClick={(e, record) => this.props.actions.openNewAddressModal(record)}>
            {t(`Edit address`)}
          </PopupMenuItem>
          <PopupMenuItem onClick={(e, record) => this.props.actions.copyAddress(record)}>
            {t(`Copy Address`)}
          </PopupMenuItem>
          <PopupMenuItem onClick={(e, record) => this.props.actions.confirmAddressRemoval(record)}>
            {t(`Remove Address`)}
          </PopupMenuItem>
				</PopupMenu>

			</div>
		)
	}
}
