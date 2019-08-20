/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import styles from './Status.scss'

type Props = {
  className?: string
}

const statusData = [
  {label: 'Blockchain', value: '100%'},
  {label: 'Current difficulty', value: 0.01233422},
  {label: 'Download blocks', value: 263453345},
  {label: 'Last received', value: '1m'},
  {label: 'Anons', value: 87},
  {label: 'Cloaking', value: 0},
  {label: 'Minting', value: '5h'},
  {label: 'Your weight', value: 87},
  {label: 'Network weight', value: 103234},
  {label: 'Stake', value: '0.00'},
  {label: 'Unconfirmed', value: '0.00'},
  {label: 'Immature', value: '0.00'},
  {label: 'Earnings', value: '0.50'},
]

class Status extends Component<Props> {
	props: Props
    
	render() {
		return (
      <div className={cn(styles.statusContainer, this.props.className)}>
        {
          statusData.map((item, index) => {
            return (
              <div className={cn(styles.item, index !== statusData.length - 1 ? styles.borderBottom : '')} key={item.label}>
                <p>{item.label}</p>
                <p>{item.value}</p>
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default Status
