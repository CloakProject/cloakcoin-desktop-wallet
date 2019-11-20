/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import * as Joi from 'joi'
import cn from 'classnames'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import get from 'lodash.get'
import styles from './MainOptions.scss'
import {
	RoundedInput,
	RoundedForm,
} from '~/components/rounded-form'
import { OptionsState } from '~/reducers/options/options.reducer'

const getValidationSchema = () => Joi.object().keys({
	startupAtSystemLogin: Joi.boolean().allow(true, false),
	detachDatabaseAtShutdown: Joi.boolean().allow(true, false)
})

type Props = {
  t: Any,
  options: OptionsState
}

class MainOptions extends Component<Props> {
  props: Props

	getDefaultValues() {
		return {
			startupAtSystemLogin: get(this.props, 'form.fields.startupAtSystemLogin', this.props.options.startupAtSystemLogin),
			detachDatabaseAtShutdown: get(this.props, 'form.fields.detachDatabaseAtShutdown', this.props.options.detachDatabaseAtShutdown)
		}
	}

	render() {
    const { t } = this.props
    
    return (
      <div className={cn(styles.container)}>
				<RoundedForm
					className={styles.form}
					id="mainOptions"
					schema={getValidationSchema()}
					defaultValues={this.getDefaultValues()}
				>
					<div className={cn(styles.checkboxGroup)}>
						<RoundedInput
							type="checkbox"
							name="startupAtSystemLogin"
							rightLabel
							label={t('Start CloakCoin on system login')}
							disabled={this.props.options.isApplyingOptions}
						/>
						<RoundedInput
							type="checkbox"
							name="detachDatabaseAtShutdown"
							rightLabel
							label={t('Detach databases at shutdown')}
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
	form: state.roundedForm ? state.roundedForm.mainOptions : null
})

export default connect(mapStateToProps)(translate('options')(MainOptions))
