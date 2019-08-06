// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'

import { AddressBookRecord } from '~/reducers/address-book/address-book.reducer'
import { Address } from '~/components/address/Address'
import { MoreButton } from '~/components/rounded-form'
import {
  UniformList,
  UniformListHeader,
  UniformListRow,
  UniformListColumn
} from '~/components/uniform-list'

import styles from './AddressBookList.scss'


type Props = {
  t: any,
	items: AddressBookRecord[],
	onRowContextMenu: (event: SyntheticEvent<any>, transactionId: string) => void
}

/**
 * @export
 * @class AddressBookList
 * @extends {Component<Props>}
 */
class AddressBookList extends Component<Props> {
	props: Props

  getListHeaderRenderer() {
    const { t } = this.props

    return(
      <UniformListHeader>
        <UniformListColumn width="10rem">{t(`Name`)}</UniformListColumn>
        <UniformListColumn>{t(`Address`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(record: AddressBookRecord) {
    return (
      <UniformListRow
        key={record.address}
        onContextMenu={e => this.props.onRowContextMenu(e, record)}
      >
        <UniformListColumn>{record.name}</UniformListColumn>
        <UniformListColumn className={styles.addressColumn}>
          <Address className={styles.address} value={record.address} />

          <MoreButton
            className={styles.moreButton}
            onClick={e => this.props.onRowContextMenu(e, record)}
          />
        </UniformListColumn>
      </UniformListRow>
    )
  }

	/**
	 * @returns
	 * @memberof AddressBookList
	 */
	render() {
    const { t } = this.props

		return (
      <UniformList
        items={this.props.items}
        sortKeys={['name']}
        headerRenderer={() => this.getListHeaderRenderer()}
        rowRenderer={record => this.getListRowRenderer(record)}
        emptyMessage={t(`You don't have any address records yet.`)}
      />
		)
	}
}

export default translate('address-book')(AddressBookList)
