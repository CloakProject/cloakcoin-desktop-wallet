// @flow
import React, { Component } from 'react'
import cn from 'classnames'

import styles from './UniformList.scss'

type Props = {
  className?: string,
  width?: string,
  children?: any
}

export default class UniformListColumn extends Component<Props> {
	props: Props

  static get displayName() { return 'UniformListColumn' }

	/**
	 * @memberof UniformListColumn
	 */
  render() {
    return (
      <div className={cn(styles.column, this.props.className)} style={{ width: this.props.width }}>
        {this.props.children}
      </div>
    )
  }

}
