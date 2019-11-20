// @flow
import React, { Component } from 'react'
import { v4 as uuid } from 'uuid'
import cn from 'classnames'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { toDecimalPlaces } from '~/utils/decimal'
import { translate } from '~/i18next.config'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'

import styles from './RoundedInput.scss'

type Props = {
	name: string,
  className?: string,
  labelClassName?: string,
	label?: string,
  currencies: { [string]: Currency },
  defaultValue?: string | null,
	onChange?: value => void,
  disabled?: boolean,
  popupMenu: object
}

type State = {
  symbol: string
}

class ChooseWallet extends Component<Props> {
	props: Props
  state: State
  popupMenuId: string

  static get displayName() { return 'ChooseWallet' }

	/**
	 * @param {*} props
	 * @memberof ChooseWallet
	 */
	constructor(props) {
		super(props)
    this.popupMenuId = `popup-menu-${uuid()}`
    this.state = {
      symbol: props.defaultValue || 'CLOAK',
    }
	}

	onChangeHandler(event, symbol) {
		event.stopPropagation()
    this.setState({ symbol })

		if (this.props.onChange) {
			this.props.onChange(symbol)
		}
	}

	render() {
    const selectedCurrency = this.props.currencies[this.state.symbol]
    const sortedCurrencies = Object.values(this.props.currencies).sort((item1, item2) => (
      item1.symbol.localeCompare(item2.symbol)
    ))

		return (
      <div
        className={cn(styles.container, styles.chooseWalletContainer, this.props.className)}
        name={this.props.name}
        disabled={this.props.disabled}
      >

      {this.props.label &&
        <div className={cn(styles.label, this.props.labelClassName)}>
          {this.props.label}
        </div>
      }

      <div className={styles.chooseWallet}>
        <CurrencyIcon className={styles.currencyIcon} symbol={this.state.symbol} size="1.0rem" />

        <div className={styles.walletName}>{t(`{{symbol}} Wallet`, {symbol: this.state.symbol})}</div>

        <div className={styles.balance}>{selectedCurrency && toDecimalPlaces(selectedCurrency.balance)}</div>

        <div className={styles.symbol}>{this.state.symbol}</div>

        <div
          className={cn('icon', styles.arrowDownButton)}
          role="button"
          tabIndex={0}
          onClick={() => this.props.popupMenu.show(this.popupMenuId) && false }
          onKeyDown={() => false}
        />

        <PopupMenu id={this.popupMenuId} className={styles.menu} relative>
          { sortedCurrencies.map(currency => (
            <PopupMenuItem
              key={currency.symbol}
              className={styles.menuItem}
              onClick={e => this.onChangeHandler(e, currency.symbol)}
            >
              <CurrencyIcon className={styles.icon} symbol={currency.symbol} size="1rem" />
              <div className={styles.walletName}>{currency.name}</div>
              <div className={styles.balance}>{currency.balance.toString()}</div>
              <div className={styles.symbol}>{currency.symbol}</div>
            </PopupMenuItem>
          ))
          }
        </PopupMenu>
      </div>

    </div>
		)
	}
}

const mapDispatchToProps = dispatch => ({
  popupMenu: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(null, mapDispatchToProps)(ChooseWallet)
