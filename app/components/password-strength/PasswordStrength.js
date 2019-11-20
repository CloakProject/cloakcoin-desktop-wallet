// @flow
import React, { Component } from 'react'
import { PasswordMeter } from 'password-meter'
import { translate } from 'react-i18next'

import styles from './PasswordStrength.scss'

type StrengthStatus = null | 'weak' | 'medium' | 'good' | 'excellent'

const getStatusMessage = (t, status: StrengthStatus) => ({
  'weak': t(`Weak`),
  'medium': t(`Medium`),
  'good': t(`Good`),
  'excellent': t(`Excellent`)
}[status])

type Props = {
  t: any,
  +password: string | undefined
}

type State = {
  strengthRate: number,
  status: StrengthStatus
}

class PasswordStrength extends Component<Props> {
	props: Props
  state: State

	/**
	 * @memberof PasswordStrength
	 */
	constructor(props) {
		super(props)

    this.state = {
      strengthRate: 0,
      status: null
    }

	}

	/**
	 * @memberof PasswordStrength
	 */
  componentDidUpdate(prevProps) {
    if (prevProps.password !== this.props.password) {
      const passwordMeter = new PasswordMeter({})
      const strengthRate = passwordMeter.getResult(this.props.password).percent
      console.log(strengthRate)

      let status = null

      if (strengthRate >= 99) {
        status = 'excellent'
      } else if (strengthRate <= 50) {
        status = 'weak'
      } else if (strengthRate <= 70) {
        status = 'medium'
      } else {
        status = 'good'
      }

      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ strengthRate, status })
    }
  }

	/**
	 * @memberof PasswordStrength
	 */
	render() {
    const { t } = this.props

		return (
			<div className={styles.container}>
        <div className={styles.strength}>
          Password strength
          <div className={styles[this.state.status]}>
            {getStatusMessage(t, this.state.status) || ''}
          </div>
        </div>
        <div className={styles.progressBar}>
          <div style={{ width: `${this.state.strengthRate}%` }} />
        </div>
			</div>
		)
	}
}

export default translate('other')(PasswordStrength)
