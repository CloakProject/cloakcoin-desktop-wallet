// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { truncateAmount } from '~/utils/decimal'
import { CopyButton, MoreButton } from '~/components/rounded-form'
import { UniformList, UniformListHeader, UniformListRow, UniformListColumn} from '~/components/uniform-list'
import { Address } from '~/components/address/Address'
import { AddressRow } from '~/reducers/own-addresses/own-addresses.reducer'

import styles from './own-address-list.scss'

type Props = {
  t: any,
	items: AddressRow[],
  frozenAddresses: { [string]: Decimal },
	onRowClick: (event: any, address: string) => void
}

class OwnAddressList extends Component<Props> {
	props: Props

  getListHeaderRenderer(t) {
    return (
      <UniformListHeader>
        <UniformListColumn width="6.875rem">{t(`Balance`)}</UniformListColumn>
        <UniformListColumn width="7.25rem">{t(`Confirmed`)}</UniformListColumn>
        <UniformListColumn>{t(`Address`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(t, address: AddressRow) {
    const frozenBalance = this.props.frozenAddresses[address.address]
    const balance = frozenBalance === undefined ? address.balance : frozenBalance
    const displayBalance = balance === null ? t('ERROR') : truncateAmount(balance)

    return (
      <UniformListRow
        key={address.address}
        className={cn(styles.row, [styles.mergingContainer]: frozenBalance)}
        onContextMenu={e => this.props.onRowClick(e, address.address)}
      >
        <UniformListColumn>{displayBalance}</UniformListColumn>
        <UniformListColumn>{address.confirmed ? t('Yes') : address.balance && t('No') || ''}</UniformListColumn>
        <UniformListColumn className={styles.addressColumn}>
          {address.address.startsWith('z') &&
            <div className={cn('icon', styles.privacyIcon)} />
          }
          <Address className={styles.address} value={address.address} />

          <CopyButton className={styles.copyButton} valueToCopy={address.address} />

          <MoreButton
            className={styles.moreButton}
            onClick={e => this.props.onRowClick(e, address.address)}
          />

          {Boolean(frozenBalance) &&
            <div className={styles.merging}>{t(`Merging`)}</div>
          }
        </UniformListColumn>

      </UniformListRow>
    )
  }

	render() {
    const { t } = this.props

		return (
      <UniformList
        items={this.props.items}
        headerRenderer={() => this.getListHeaderRenderer(t)}
        rowRenderer={address => this.getListRowRenderer(t, address)}
      />
		)
	}
}

export default translate('own-addresses')(OwnAddressList)
