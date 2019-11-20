/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import styles from './DropdownSelect.scss'

type Props = {
  options?: Array,
  className?: string
}

class DropdownSelect extends Component<Props> {
	props: Props
    
	render() {
		return (
      <div className={cn(styles.select_box, this.props.className)}>
        <select
          {...this.props}
        >
          {
            this.props.options.map(item => {
              return (
                <option value={item.value} key={item.value}>
                  {item.label}
                </option> 
              )
            })
          }
        </select>
      </div>
    )
  }
}

export default DropdownSelect
