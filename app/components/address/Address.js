// @flow
import React, { Component } from 'react'
import cn from 'classnames'

import styles from './Address.scss'


type Props = {
  className?: string,
  value: string
}

export class Address extends Component<Props> {
	props: Props

  getValue() {
    let charsToCut
    const { value } = this.props
    const minLength = 34

    // Calculate how many chars have to be cut out
    if (!this.element) {
      charsToCut = value.length - minLength
    } else {
      const { scrollWidth, clientWidth } = this.element

      const averageCharWidth = scrollWidth / value.length
      charsToCut = 1 + (scrollWidth - clientWidth) / averageCharWidth
    }

    charsToCut = Math.max(0, Math.min(charsToCut, value.length - minLength))

    if (charsToCut < 2) {
      return value
    }

    const left = value.slice(0, (value.length - charsToCut) / 2)
    const right = value.slice((value.length + charsToCut) / 2)

    return `${left}…${right}`
  }

	render() {
		return (
      <div className={cn(styles.container, this.props.className)}>
      <div className={styles.address}>
        {this.getValue()}

        <div
          className={styles.widthMeasurer}
          ref={el => {this.element = el}}
        >
          {this.props.value}
        </div>

      </div>
      </div>
    )
  }
}
