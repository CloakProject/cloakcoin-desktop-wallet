// @flow
import * as Joi from 'joi'
import { Decimal } from 'decimal.js'

import { i18n } from '../i18next.config'

import { ellipsisString } from '~/utils/string'


/**
 * ES6 singleton
 */
let instance = null

/**
 * Validates Cloak amount
 *
 * @export
 * @class ValidateAmountService
 */
export default class ValidateAmountService {
	/**
	 * Creates an instance of ValidateAmountService.
   *
	 * @memberof ValidateAmountService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

    instance.t = i18n.getFixedT(null, 'service')

		return instance
	}

  /**
   * Returns true if a valid address is given.
   *
   * @param {string} address
   * @memberof ValidateAmountService
   * @returns {boolean}
   */
  validate(amount: string, unit: number = 1): boolean {
    const num = Decimal(amount).div(Decimal(unit)).toNumber()
    let decimal = num - Math.floor(num)
    if (decimal === 0) {
      decimal = num
    }

    return decimal >= 0.00000001
  }

	/**
   * Returns a Joi for Cloak address validation.
   *
	 * @memberof ValidateAmountService
	 */
  getJoi() {
    const newJoi = Joi.extend((joi) => ({
      base: joi.string(),
      name: 'cloakAmount',
      language: {
        validCloak: this.t(`is less than 0.00000001`),
        validCloakM: this.t(`is less than 0.00001`),
        validCloakU: this.t(`is less than 0.01`),
      },
      /* eslint-disable-next-line no-unused-vars */
      pre: (value, state, options) => value.trim(), // pre: (value, state, options) => value.replace(/\s+/g, ''),
      rules: [
        {
          name: 'validCloak',
          validate: (params, value, state, options) => {
            if (!this.validate(value, 1)) {
              const err = joi.createError('cloakAmount.validCloak', {}, state, options)
              err.context.label = ellipsisString(value, 16, 'middle')
              return err
            }
            return value
          }
        },
        {
          name: 'validCloakM',
          validate: (params, value, state, options) => {
            if (!this.validate(value, 1000)) {
              const err = joi.createError('cloakAmount.validCloakM', {}, state, options)
              err.context.label = ellipsisString(value, 16, 'middle')
              return err
            }
            return value
          }
        },
        {
          name: 'validCloakU',
          validate: (params, value, state, options) => {
            if (!this.validate(value, 1000000)) {
              const err = joi.createError('cloakAmount.validCloakU', {}, state, options)
              err.context.label = ellipsisString(value, 16, 'middle')
              return err
            }
            return value
          }
        }
      ]
    }))

    return newJoi
  }
}
