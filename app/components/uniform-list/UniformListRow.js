// @flow
import React, { Component } from 'react'
import classNames from 'classnames'

import styles from './UniformList.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'

type Props = {
  className?: string,
  onClick?: func,
  onContextMenu?: func,
  header?: boolean,
  +children: any
}

export default class UniformListRow extends Component<Props> {
	props: Props

  static get displayName() { return 'UniformListRow' }

	/**
	 * @memberof UniformListRow
	 */
  onClick(event: SyntheticEvent<any>): boolean {
    event.preventDefault()

    if (this.props.onClick) {
      this.props.onClick(event)
		}

    return false
  }

	/**
	 * @memberof UniformListRow
	 */
  onContextMenu(event: SyntheticEvent<any>): boolean {
    event.preventDefault()

    window.getSelection().removeAllRanges()

		if (this.props.onContextMenu) {
      this.props.onContextMenu(event)
		}

    return false
	}

  getColumns() {
    const children = this.props.children.filter(React.isValidElement)

    const columns = children.map((child, index) => {
      const className = index === this.props.children.length - 1
        ? classNames(HLayout.hBoxChild, child.props.className)
        : child.props.className

      /* eslint-disable-next-line react/no-array-index-key */
      return React.cloneElement(child, { key: index, className })
    })

    return columns
  }

	/**
	 * @memberof UniformListRow
	 */
  render() {
    return (
      <div
        role="none"
        className={classNames({ [styles.row]: !this.props.header }, HLayout.hBoxContainer, this.props.className)}
        onClick={e => this.onClick(e)}
        onContextMenu={e => this.onContextMenu(e)}
      >
        {this.getColumns()}
      </div>
    )
  }

}
