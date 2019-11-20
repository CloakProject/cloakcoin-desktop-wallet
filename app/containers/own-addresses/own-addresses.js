// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { toastr } from 'react-redux-toastr'
import { translate } from 'react-i18next'
import cn from 'classnames'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import OwnAddressList from '~/components/own-addresses/own-address-list'
import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { SettingsState } from '~/reducers/settings/settings.reducer'
import { OwnAddressesActions, OwnAddressesState } from '~/reducers/own-addresses/own-addresses.reducer'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import { RoundedButtonWithDropdown } from '~/components/rounded-form'

import styles from './own-addresses.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

const pollingInterval = 5.0
const addressRowPopupMenuId = 'own-addresses-address-row-popup-menu-id'
const createAddressPopupMenuId = 'own-addresses-create-address-popup-menu-id'

type Props = {
  t: any,
  settings: SettingsState,
	ownAddresses: OwnAddressesState,
  actions: object,
  popupMenu: object
}

type State = {
  isZAddressClicked: boolean
}

/**
 * @class OwnAddresses
 * @extends {Component<Props>}
 */
class OwnAddresses extends Component<Props> {
	props: Props
  state: State

	/**
	 * @memberof OwnAddresses
	 */
  constructor(props) {
    super(props)
    this.state = {
      isZAddressClicked: false
    }
  }

  onAddressRowClicked(event, address) {
    this.setState({ isZAddressClicked: address.toLowerCase().startsWith('z')})
    this.props.popupMenu.show(addressRowPopupMenuId, address, event.clientY, event.clientX)
  }

  mergeAllMinedCoinsClicked(event, address, t) {
    const confirmOptions = { onOk: () => this.props.actions.mergeAllMinedCoins(address) }
    toastr.confirm(t(`Are you sure want to merge all the mined coins?`), confirmOptions)
  }

  mergeAllTransparentAddressCoinsClicked(event, address, t) {
    const confirmOptions = { onOk: () => this.props.actions.mergeAllRAddressCoins(address) }
    toastr.confirm(t(`Are you sure want to merge all the transparent address coins?`), confirmOptions)
  }

  mergeAllEnigmaAddressCoinsClicked(event, address, t) {
    const confirmOptions = { onOk: () => this.props.actions.mergeAllZAddressCoins(address) }
    toastr.confirm(t(`Are you sure want to merge all the enigma address coins?`), confirmOptions)
  }

  mergeAllCoinsClicked(event, address, t) {
    const confirmOptions = { onOk: () => this.props.actions.mergeAllCoins(address) }
    toastr.confirm(t(`Are you sure want to merge all the coins?`), confirmOptions)
  }

	/**
	 * @returns
	 * @memberof OwnAddresses
	 */
	render() {
    const { t } = this.props

		return (
			// Layout container
			<div
        role="none"
				className={cn(HLayout.hBoxChild, VLayout.vBoxContainer)}
			>
        <RpcPolling
          interval={pollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: OwnAddressesActions.getOwnAddresses,
            success: OwnAddressesActions.gotOwnAddresses,
            failure: OwnAddressesActions.getOwnAddressesFailure
          }}
        />

				{ /* Route content */}
				<div className={cn(styles.container, VLayout.vBoxChild, HLayout.hBoxContainer)}>

					<div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer)}>

						{ /* Top bar */}
						<div className={cn(styles.header, HLayout.hBoxContainer)}>

							<div className={styles.title}>{t(`My Addresses`)}</div>

              <div className={styles.buttonsContainer}>
                <RoundedButtonWithDropdown
                  className={styles.menuButton}
                  onDropdownClick={() => this.props.popupMenu.show(createAddressPopupMenuId)}
                  disabled={this.props.settings.childProcessesStatus.NODE !== 'RUNNING'}
                  glyph="add"
                  important
                >
                  {t(`Add new address`)}

                  <PopupMenu id={createAddressPopupMenuId} relative>
                    <PopupMenuItem onClick={() => this.props.actions.createAddress(false)}>
                      {t(`New transparent (C) address`)}
                    </PopupMenuItem>
                    <PopupMenuItem onClick={() => this.props.actions.createAddress(true)}>
                      {t(`New enigma address`)}
                    </PopupMenuItem>
                    <PopupMenuItem onClick={this.props.actions.importPrivateKey}>
                      {t(`Import private key`)}
                    </PopupMenuItem>
                    <PopupMenuItem onClick={this.props.actions.initiatePrivateKeysImport}>
                      {t(`Import private keys form file`)}
                    </PopupMenuItem>
                    <PopupMenuItem onClick={this.props.actions.showPrivateKey} disabled>
                      {t(`Show private key`)}
                    </PopupMenuItem>
                    <PopupMenuItem onClick={this.props.actions.initiatePrivateKeysExport}>
                      {t(`Export private keys`)}
                    </PopupMenuItem>
                  </PopupMenu>

                </RoundedButtonWithDropdown>

              </div>

						</div>

            <OwnAddressList
              items={this.props.ownAddresses.addresses}
              frozenAddresses={this.props.ownAddresses.frozenAddresses}
              onRowClick={(e, address) => this.onAddressRowClicked(e, address)}
            />

            <PopupMenu id={addressRowPopupMenuId}>
              {this.state.isZAddressClicked &&
                <PopupMenuItem onClick={(e, address) => this.mergeAllMinedCoinsClicked(e, address, t)}>
                  {t(`Merge all mined coins here`)}
                </PopupMenuItem>
              }
              <PopupMenuItem onClick={(e, address) => this.mergeAllTransparentAddressCoinsClicked(e, address, t)}>
                {t(`Merge all transparent address coins here`)}
              </PopupMenuItem>
              <PopupMenuItem onClick={(e, address) => this.mergeAllEnigmaAddressCoinsClicked(e, address, t)}>
                {t(`Merge all enigma address coins here`)}
              </PopupMenuItem>
              <PopupMenuItem onClick={(e, address) => this.mergeAllCoinsClicked(e, address, t)}>
                {t(`Merge all coins here`)}
              </PopupMenuItem>
            </PopupMenu>

					</div>
				</div>

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
  settings: state.settings,
	ownAddresses: state.ownAddresses
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(OwnAddressesActions, dispatch),
  popupMenu: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('own-addresses')(OwnAddresses))
