/* eslint-disable arrow-body-style */
// @flow
import React, { Component } from 'react'
import * as Joi from 'joi'
import cn from 'classnames'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { translate } from 'react-i18next'
import styles from './DisplayOptions.scss'
import {
	RoundedInput,
	RoundedForm
} from '~/components/rounded-form'
import { OptionsState } from '~/reducers/options/options.reducer'

const getValidationSchema = () => Joi.object().keys({
	language: Joi.string().allow('default', 'en', 'fr', 'ru'),
	amountUnit: Joi.string().allow('cloak', 'cloakM', 'cloakU')
})

type Props = {
  t: Any,
	options: OptionsState
}

class DisplayOptions extends Component<Props> {
	props: Props

	getDefaultValues() {
		return {
			language: get(this.props, 'form.fields.language', this.props.options.language),
			amountUnit: get(this.props, 'form.fields.amountUnit', this.props.options.amountUnit)
		}
	}

  render() {
		const { t } = this.props

    return (
      <div className={cn(styles.container)}>
				<RoundedForm
					className={styles.form}
					id="displayOptions"
					schema={getValidationSchema()}
					defaultValues={this.getDefaultValues()}
				>
					<div className={cn(styles.languageOption)}>
						<span
						  className={cn(styles.label,
													this.props.options.isApplyingOptions ? styles.disabled : '')}
						>
							{t('User interface language')}
						</span>
            <div className={cn(styles.option)}>
              <RoundedInput
                type="radio"
                name="language"
                radioValue="default"
                label={t('Default')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                type="radio"
                name="language"
                radioValue="en"
                label={t('English (US)')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                className={cn(styles.languageFr)}
                type="radio"
                name="language"
                radioValue="fr"
                label={t('Français')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                className={cn(styles.languageRu)}
                type="radio"
                name="language"
                radioValue="ru"
                label={t('Pусский')}
                disabled={this.props.options.isApplyingOptions}
              />
            </div>
					</div>

          <div className={cn(styles.amountUnitOption)}>
						<span
						  className={cn(styles.label,
													this.props.options.isApplyingOptions ? styles.disabled : '')}
						>
							{t('Units to show amounts in')}
						</span>
            <div className={cn(styles.option)}>
              <RoundedInput
                type="radio"
                name="amountUnit"
                radioValue="cloak"
                label={t('CLOAK')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                className={cn(styles.cloakM)}
                type="radio"
                name="amountUnit"
                radioValue="cloakM"
                label={t('mCLOAK')}
                disabled={this.props.options.isApplyingOptions}
              />
              <RoundedInput
                className={cn(styles.cloakU)}
                type="radio"
                name="amountUnit"
                radioValue="cloakU"
                label={t('μCLOAK')}
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
	form: state.roundedForm ? state.roundedForm.displayOptions : null
})

export default connect(mapStateToProps)(translate('options')(DisplayOptions))
