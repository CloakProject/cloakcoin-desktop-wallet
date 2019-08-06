import { Decimal } from 'decimal.js'
import React from 'react'
import cn from 'classnames'

import { translate } from '~/i18next.config'
import RoundedInput, { RoundedInputProps } from './NewRoundedInput'

import parentStyles from './NewRoundedInput.scss'
import styles from './CurrencyAmountInput.scss'


const t = translate('other')

type CurrencyAmountInputProps = {
  ...RoundedInputProps,
  maxAmount?: object,
  buttonLabel?: string,
  symbol: string,
  step?: string
}

export default class CurrencyAmountInput extends RoundedInput {
  props: CurrencyAmountInputProps

  renderLabel() {
    return (
      this.props.label
    )
  }

  getTruncatedMaxAmount() {
    const { maxAmount } = this.props

    if (maxAmount) {
      const decimalPlaces = this.props.symbol === 'USD' ? 2 : 8
      return maxAmount.toDP(decimalPlaces, Decimal.ROUND_FLOOR).toString()
    }

    return maxAmount
  }

  renderInput() {
    return (
      <div className={styles.inputContainer}>
        <input
          className={cn(parentStyles.input, styles.input)}
          name={this.props.name}
          type="number"
          step={this.props.step || '0.1'}
          min="0"
          max={this.getTruncatedMaxAmount()}
          value={this.state.value}
          disabled={this.props.disabled}
          onChange={event => this.onChangeHandler(event)}
          onFocus={(event) => this.onFocusHandler(event)}
          onBlur={(event) => this.onBlurHandler(event)}
          placeholder={this.props.placeholder}
          readOnly={this.props.readOnly}
        />
        {this.props.symbol}
      </div>
    )
  }

  renderAddon() {
    if (!this.props.maxAmount) {
      return null
    }

    return (
      <div className={styles.buttonWrapper}>
        <button
          type="button"
          className={styles.maxButton}
          onClick={() => this.changeValue(this.getTruncatedMaxAmount())}
          onKeyDown={() => false}
        >
          {this.props.buttonLabel || t(`Max`)}
        </button>
      </div>
    )
  }
}
