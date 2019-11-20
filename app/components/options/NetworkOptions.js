/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import * as Joi from 'joi'
import cn from 'classnames'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { translate } from 'react-i18next'
import styles from './NetworkOptions.scss'
import {
	RoundedInput,
	RoundedForm
} from '~/components/rounded-form'
import { OptionsState } from '~/reducers/options/options.reducer'

const getValidationSchema = () => Joi.object().keys({
	mapPortUsingUpnp: Joi.boolean().allow(true, false),
	connectThroughSocksProxy: Joi.boolean().allow(true, false),
	proxyIp: Joi.string().required(),
	proxyPort: Joi.number().min(1000).max(65535),
	socksVersion: Joi.string().allow('v4', 'v5')
})

type Props = {
  t: Any,
	options: OptionsState,
	form: Any
}

class NetworkOptions extends Component<Props> {
	props: Props
	
	isCheckedConnectThroughSocksProxy() {
		return this.props.form && this.props.form.fields.connectThroughSocksProxy
	}

	getDefaultValues() {
		return {
			mapPortUsingUpnp: get(this.props, 'form.fields.mapPortUsingUpnp', this.props.options.mapPortUsingUpnp),
			connectThroughSocksProxy: get(this.props, 'form.fields.connectThroughSocksProxy', this.props.options.connectThroughSocksProxy),
			proxyIp: get(this.props, 'form.fields.proxyIp', this.props.options.proxyIp),
			proxyPort: get(this.props, 'form.fields.proxyPort', this.props.options.proxyPort),
			socksVersion: get(this.props, 'form.fields.socksVersion', this.props.options.socksVersion)
		}
	}

  render() {
		const { t } = this.props

    return (
      <div className={cn(styles.container)}>
				<RoundedForm
					className={styles.form}
					id="networkOptions"
					schema={getValidationSchema()}
					defaultValues={this.getDefaultValues()}
				>
					<div className={cn(styles.checkboxGroup)}>
						<RoundedInput
							type="checkbox"
							name="mapPortUsingUpnp"
							rightLabel
							label={t('Map port using UPnp')}
							disabled={this.props.options.isApplyingOptions}
						/>
						<RoundedInput
							type="checkbox"
							name="connectThroughSocksProxy"
							rightLabel
							label={t('Connect through SOCKS proxy')}
							disabled={this.props.options.isApplyingOptions}
						/>
					</div>
					<div className={cn(styles.socksProxy)}>
						<RoundedInput
							className={cn(styles.proxyIp)}
							type="text"
							name="proxyIp"
							label={t('Proxy IP')}
							disabled={this.props.options.isApplyingOptions || !this.isCheckedConnectThroughSocksProxy()}
						/>
						<RoundedInput
							className={cn(styles.proxyPort)}
							type="text"
							name="proxyPort"
							label={t('Proxy Port')}
							disabled={this.props.options.isApplyingOptions || !this.isCheckedConnectThroughSocksProxy()}
						/>
						<span
						  className={cn(styles.socksVersionLabel,
														(this.props.options.isApplyingOptions || !this.isCheckedConnectThroughSocksProxy()) ? styles.disabled : '')}
						>
							{t('SOCKS version')}
						</span>
						<RoundedInput
							type="radio"
							name="socksVersion"
							radioValue="v4"
							label={t('4')}
							disabled={this.props.options.isApplyingOptions || !this.isCheckedConnectThroughSocksProxy()}
						/>
						<RoundedInput
							type="radio"
							name="socksVersion"
							radioValue="v5"
							label={t('5')}
							disabled={this.props.options.isApplyingOptions || !this.isCheckedConnectThroughSocksProxy()}
						/>
					</div>
				</RoundedForm>
			</div>
    )
  }
}

const mapStateToProps = state => ({
	options: state.options,
	form: state.roundedForm ? state.roundedForm.networkOptions : null
})

export default connect(mapStateToProps)(translate('options')(NetworkOptions))
