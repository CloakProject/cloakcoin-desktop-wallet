import React from 'react'
import cn from 'classnames'

import RoundedInput, { RoundedInputProps } from './RoundedInput'

import styles from './RoundedInputWithDropdown.scss'

export type Props = {
  ...RoundedInputProps,
  onDropdownClick: () => boolean
}

export default class RoundedInputWithDropdown extends RoundedInput {
  props: Props

  onDropdownClickHandler(event) {
    event.stopPropagation()
    this.props.onDropdownClick(event)
    return false
  }

  renderAddon() {
    return (
      <div
        role="button"
        tabIndex={0}
        className={cn('icon', styles.dropdownButton)}
        onClick={e => this.onDropdownClickHandler(e)}
        onKeyDown={e => [13, 32].includes(e.keyCode) ? this.onDropdownClickHandler(e) : false}
      />
    )
  }
}
