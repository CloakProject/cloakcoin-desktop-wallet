// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'

import { truncateAmount } from '~/utils/decimal'
import { AddressDropdownItem } from '~/reducers/send-cash/send-cash.reducer'

import styles from './address-drodown-popup-menu.scss'

type Props = {
  t: any,
  addressList?: AddressDropdownItem[],
  onPickupAddress: (address: string) => void
}

class AddressDropdownPopupMenu extends Component<Props> {
  props: Props

  eventConfirm(event) {
    event.preventDefault()
    event.stopPropagation()
  }

  onAddressItemClicked(event, selectedAddress: string) {
    this.eventConfirm(event)
    if (this.props.onPickupAddress) {
      this.props.onPickupAddress(event, selectedAddress)
    }
  }

  checkAndApplyLastGroupItemClass(tempIndex) {
    const { addressList } = this.props
    const currentItem = addressList[tempIndex]
    const nextItem = tempIndex < addressList.length ? addressList[tempIndex + 1] : null
    const isTheLastGroupItem = currentItem && currentItem.address.startsWith('r') && nextItem && nextItem.address.startsWith('z')

    return isTheLastGroupItem ? styles.groupLastItem : ''
  }

  renderAddressItems() {
    const { t } = this.props

    if (!this.props.addressList ||
        !Array.isArray(this.props.addressList) ||
          this.props.addressList.length <= 0) {
      return (
        <div
          role="none"
          className={styles.lastMenuItem}
          onClick={event => this.onAddressItemClicked(event, '')}
          onKeyDown={() => { }}
        >
          {t(`Have no any available address`)}
        </div>
      )
    }

    return this.props.addressList.map((addressItem, index) => (
      <div
        role="none"
        className={[
          index === this.props.addressList.length - 1 ? styles.lastMenuItem : styles.menuItem,
          addressItem.disabled ? styles.disabledMenItem : '',
          this.checkAndApplyLastGroupItemClass(index)
        ].join(' ')}
        onClick={event => this.onAddressItemClicked(event, addressItem.address ? addressItem.address : '')}
        onKeyDown={() => { }}
        key={index}
      >
        <div className={styles.itemRowAddress}>{addressItem.address}</div>
        <div className={styles.itemRowBalance}>
          {addressItem.balance === null ? t('Error') : `${truncateAmount(addressItem.balance)} CLOAK`}
        </div>
      </div>
    ))
  }

  render() {
    return (
      <div className={[styles.AddressDropdownPopupMenuContainer].join(' ')}>
        {this.renderAddressItems()}
      </div>
    )
  }
}

export default translate('send-cash')(AddressDropdownPopupMenu)
