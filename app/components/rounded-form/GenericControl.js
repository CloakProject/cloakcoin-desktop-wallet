import log from 'electron-log'
import React, { Component } from 'react'
import cn from 'classnames'

import genericStyles from './GenericControl.scss'


export type GenericProps = {
  className?: string,
	disabled?: boolean,
  tooltip?: string | null
}

export default class GenericControl extends Component<Props> {
  props: Props

  static get isRoundedFormComponent() { return true }

  renderControl() {
    log.error(`Generic control cannot be used directly and should be inherited`)
    return null
  }

	render() {
		return (
      <div
        className={cn(genericStyles.control, {
          [genericStyles.disabled]: this.props.disabled,
        })}
        title={this.props.tooltip}
      >
        {this.renderControl()}
      </div>
    )
  }

}
