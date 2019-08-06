import React from 'react'
import cn from 'classnames'

import RoundedInput, { RoundedInputProps } from './NewRoundedInput'
import styles from './RoundedTextArea.scss'


export type RoundedTextAreaProps = {
  ...RoundedInputProps,
  rows?: number,
  cols?: number
}

export default class RoundedTextArea extends RoundedInput {
  props: RoundedTextAreaProps
  customContainerClassName = styles.container

  renderInput() {
    return (
      <textarea
        className={cn(
          styles.textarea,
          { [styles.withPlaceholder]: Boolean(this.props.placeholder) }
        )}
        name={this.props.name}
        rows={this.props.rows}
        cols={this.props.cols}
        disabled={this.props.disabled}
        onChange={event => this.onChangeHandler(event)}
        onFocus={event => this.onFocusHandler(event)}
        onBlur={event => this.onBlurHandler(event)}
        value={this.state.value}
        placeholder={this.props.placeholder}
        readOnly={this.props.readOnly}
      />
    )
  }
}
