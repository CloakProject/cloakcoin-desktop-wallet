/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import * as Joi from 'joi'
import cn from 'classnames'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { translate } from 'react-i18next'
import styles from './WindowOptions.scss'
import {
  RoundedInput,
	RoundedForm,
} from '~/components/rounded-form'
import { OptionsState } from '~/reducers/options/options.reducer'

const getValidationSchema = () => Joi.object().keys({
	minimizeToTray: Joi.boolean().allow(true, false),
	closeToTray: Joi.boolean().allow(true, false)
})

type Props = {
  t: Any,
  options: OptionsState
}

class WindowOptions extends Component<Props> {
  props: Props

	getDefaultValues() {
		return {
			minimizeToTray: get(this.props, 'form.fields.minimizeToTray', this.props.options.minimizeToTray),
			closeToTray: get(this.props, 'form.fields.closeToTray', this.props.options.closeToTray)
		}
	}

  render() {
    const { t } = this.props
    
    return (
      <div className={cn(styles.container)}>
				<RoundedForm
					className={styles.form}
					id="windowOptions"
					schema={getValidationSchema()}
					defaultValues={this.getDefaultValues()}
				>
					<div className={cn(styles.checkboxGroup)}>
						<RoundedInput
							type="checkbox"
							name="minimizeToTray"
							rightLabel
							label={t('Minimize to the tray instead of the taskbar')}
							disabled={this.props.options.isApplyingOptions}
						/>
						<RoundedInput
							type="checkbox"
							name="closeToTray"
							rightLabel
							label={t('Minimize on close')}
							disabled={this.props.options.isApplyingOptions}
						/>
					</div>
				</RoundedForm>
			</div>
    )
  }
}

const mapStateToProps = state => ({
  options: state.options,
	form: state.roundedForm ? state.roundedForm.windowOptions : null
})

export default connect(mapStateToProps)(translate('options')(WindowOptions))
