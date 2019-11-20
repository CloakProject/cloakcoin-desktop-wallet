// @flow
import log from 'electron-log'
import React from 'react'
import cn from 'classnames'

import GenericControl, { GenericProps } from './GenericControl'

import genericStyles from './GenericInput.scss'

export type GenericInputProps = {
  ...GenericProps,
  defaultValue?: string,
  labelClassName?: string,
  inputClassName?: string,
  addonClassName?: string,
  rightLabel?: boolean,
	label?: string,
	onChange?: value => void,
  error?: string | null,
  large?: boolean,
	children: any
}

export type GenericInputState = {
  value: string
}

export default class GenericInput extends GenericControl {
	props: GenericInputProps
  state: GenericInputState

  customContainerClassName: string | null = null

	/**
	 * @param {*} props
	 * @memberof GenericInput
	 */
	constructor(props) {
		super(props)

    this.state = {
      value: props.defaultValue || '',
    }
	}

	/**
	 * @param {*} prevProps
	 * @memberof GenericInput
	 */
  componentDidUpdate(prevProps) {
    if (prevProps.defaultValue !== this.props.defaultValue ) {
      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ value: this.props.defaultValue || '' })
    }
  }

	/**
	 * @param {string | boolean} value
	 * @memberof GenericInput
	 */
  changeValue(value: string | boolean) {
    this.setState({ value })

		if (this.props.onChange) {
			this.props.onChange(value)
		}
  }

	onChangeHandler(event) {
    event.stopPropagation()
    if (event.target.type === 'checkbox') {
      this.changeValue(event.target.checked)
    } else {
      this.changeValue(event.target.value)
    }
	}

  renderLabel() {
    return this.props.label
  }

  renderInput() {
    log.error(`Generic input component cannot be used directly and should be inherited`)
    return null
  }

  renderAddon() {
    return null
  }

	renderControl() {
		return (
      <div className={genericStyles.wrapper}>
        <div
          className={cn(
            this.props.className,
            genericStyles.container,
            this.props.type === 'checkbox' ? genericStyles.checkbox : '',
            this.customContainerClassName,
            {
              [genericStyles.hasError]: Boolean(this.props.error),
              [genericStyles.large]: this.props.large
            }
          )}
        >

        {!this.props.rightLabel && this.props.label &&
          <div className={cn(this.props.labelClassName, genericStyles.label)}>
            {this.renderLabel()}
          </div>
        }

        <div className={cn(this.props.inputClassName, genericStyles.input)}>
          {this.renderInput()}
        </div>

        {this.props.rightLabel && this.props.label &&
          <div className={cn(this.props.labelClassName, genericStyles.label, genericStyles.rightLabel)}>
            {this.renderLabel()}
          </div>
        }

        <div className={cn(this.props.addonClassName, genericStyles.addon)}>
          {this.renderAddon()}
        </div>

        {this.props.children &&
          this.props.children}
        </div>

        <div className={genericStyles.error}>
          {this.props.error
            && !this.state.isFocused
            && this.props.error
          }
        </div>

      </div>
		)
	}
}

