/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import * as Joi from 'joi'
import cn from 'classnames'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { translate } from 'react-i18next'
import styles from './EnigmaCloakShieldOptions.scss'
import {
	RoundedInput,
	RoundedForm
} from '~/components/rounded-form'
import { OptionsState } from '~/reducers/options/options.reducer'

const getValidationSchema = () => Joi.object().keys({
	enigmaReserveBalance: Joi.number().allow(0, 25, 50, 75),
	enigmaAutoRetry: Joi.boolean().allow(true, false),
	cloakShieldEnigmaTransactions: Joi.boolean().allow(true, false),
	cloakShieldNonEnigmaTransactions: Joi.boolean().allow(true, false),
	cloakShieldRoutes: Joi.number().allow(1, 2, 3, 4, 5),
	cloakShieldNodes: Joi.number().allow(1, 2, 3, 4, 5),
	cloakShieldHops: Joi.number().allow(1, 2, 3, 4, 5)
})

type Props = {
  t: Any,
	options: OptionsState
}

class EnigmaCloakShieldOptions extends Component<Props> {
	props: Props

	getDefaultValues() {
		return {
			enigmaReserveBalance: get(this.props, 'form.fields.enigmaReserveBalance', this.props.options.enigmaReserveBalance),
			enigmaAutoRetry: get(this.props, 'form.fields.enigmaAutoRetry', this.props.options.enigmaAutoRetry),
			cloakShieldEnigmaTransactions: get(this.props, 'form.fields.cloakShieldEnigmaTransactions', this.props.options.cloakShieldEnigmaTransactions),
			cloakShieldNonEnigmaTransactions: get(this.props, 'form.fields.cloakShieldNonEnigmaTransactions', this.props.options.cloakShieldNonEnigmaTransactions),
			cloakShieldRoutes: get(this.props, 'form.fields.cloakShieldRoutes', this.props.options.cloakShieldRoutes),
			cloakShieldNodes: get(this.props, 'form.fields.cloakShieldNodes', this.props.options.cloakShieldNodes),
			cloakShieldHops: get(this.props, 'form.fields.cloakShieldHops', this.props.options.cloakShieldHops)
		}
	}

  render() {
    const { t } = this.props
    
    console.log("this.props", this.props)
    console.log("getDefaultValues", this.getDefaultValues())

    return (
      <div className={cn(styles.container)}>
				<RoundedForm
					className={styles.form}
					id="enigmaCloakShieldOptions"
					schema={getValidationSchema()}
					defaultValues={this.getDefaultValues()}
				>
					<div className={cn(styles.enigmaReserveBalanceOption)}>
						<span
						  className={cn(styles.label,
													this.props.options.isApplyingOptions ? styles.disabled : '')}
						>
							{t('Enigma reserve balance %')}
						</span>
            <div className={cn(styles.option)}>
              <RoundedInput
                type="radio"
                name="enigmaReserveBalance"
                radioValue="0"
                label={t('0')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="enigmaReserveBalance"
                radioValue="25"
                label={t('25')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="enigmaReserveBalance"
                radioValue="50"
                label={t('50')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="enigmaReserveBalance"
                radioValue="75"
                label={t('75')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="enigmaReserveBalance"
                radioValue="100"
                label={t('100')}
                disabled={this.props.options.isApplyingOptions}
              />
            </div>
					</div>

					<div className={cn(styles.checkboxGroup)}>
						<RoundedInput
							type="checkbox"
							name="enigmaAutoRetry"
							rightLabel
							label={t('Enable Enigma auto-retry')}
							disabled={this.props.options.isApplyingOptions}
						/>
						<RoundedInput
							type="checkbox"
							name="cloakShieldEnigmaTransactions"
							rightLabel
							label={t('Use CloakShield for Enigma transactions')}
							disabled={this.props.options.isApplyingOptions}
						/>
						<RoundedInput
							type="checkbox"
							name="cloakShieldNonEnigmaTransactions"
							rightLabel
							label={t('Use CloakShield for non-Enigma transactions')}
							disabled={this.props.options.isApplyingOptions}
						/>
					</div>

          <div className={cn(styles.cloakShieldRoutesOption)}>
						<span
						  className={cn(styles.label,
													this.props.options.isApplyingOptions ? styles.disabled : '')}
						>
							{t('CloakShield min. routes')}
						</span>
            <div className={cn(styles.option)}>
              <RoundedInput
                type="radio"
                name="cloakShieldRoutes"
                radioValue="1"
                label={t('1')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="cloakShieldRoutes"
                radioValue="2"
                label={t('2')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="cloakShieldRoutes"
                radioValue="3"
                label={t('3')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="cloakShieldRoutes"
                radioValue="4"
                label={t('4')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="cloakShieldRoutes"
                radioValue="5"
                label={t('5')}
                disabled={this.props.options.isApplyingOptions}
              />
            </div>
					</div>

          <div className={cn(styles.cloakShieldNodesOption)}>
						<span
						  className={cn(styles.label,
													this.props.options.isApplyingOptions ? styles.disabled : '')}
						>
							{t('CloakShield min. nodes')}
						</span>
            <div className={cn(styles.option)}>
              <RoundedInput
                type="radio"
                name="cloakShieldNodes"
                radioValue="1"
                label={t('1')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="cloakShieldNodes"
                radioValue="2"
                label={t('2')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="cloakShieldNodes"
                radioValue="3"
                label={t('3')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="cloakShieldNodes"
                radioValue="4"
                label={t('4')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="cloakShieldNodes"
                radioValue="5"
                label={t('5')}
                disabled={this.props.options.isApplyingOptions}
              />
            </div>
					</div>

          <div className={cn(styles.cloakShieldHopsOption)}>
						<span
						  className={cn(styles.label,
													this.props.options.isApplyingOptions ? styles.disabled : '')}
						>
							{t('CloakShield min. hops')}
						</span>
            <div className={cn(styles.option)}>
              <RoundedInput
                type="radio"
                name="cloakShieldHops"
                radioValue="1"
                label={t('1')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="cloakShieldHops"
                radioValue="2"
                label={t('2')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="cloakShieldHops"
                radioValue="3"
                label={t('3')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="cloakShieldHops"
                radioValue="4"
                label={t('4')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="cloakShieldHops"
                radioValue="5"
                label={t('5')}
                disabled={this.props.options.isApplyingOptions}
              />
            </div>
					</div>
				</RoundedForm>
			</div>
    )
  }
}

const mapStateToProps = state => ({
	options: state.options,
	form: state.roundedForm ? state.roundedForm.enigmaCloakShieldOptions : null
})

export default connect(mapStateToProps)(translate('options')(EnigmaCloakShieldOptions))
