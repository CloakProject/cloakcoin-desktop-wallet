// @flow
import * as Joi from 'joi'

import { i18n } from '../i18next.config'

import { AddressBookService } from '~/service/address-book-service'
import { ellipsisString } from '~/utils/string'


/**
 * ES6 singleton
 */
let instance = null

/**
 * Validates Cloak addresses
 *
 * @export
 * @class ValidateAddressService
 */
export default class ValidateAddressService {
	/**
	 * Creates an instance of ValidateAddressService.
   *
	 * @memberof ValidateAddressService
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
   * @memberof ValidateAddressService
   * @returns {boolean}
   */
  validate(address: string, isCloak: boolean = true, isStealth: boolean = false): boolean {
    let isValid = false

    if (isCloak && ValidateAddressService.isCAddress(address)) {
      isValid = true
    } else if (isStealth && ValidateAddressService.isSAddress(address)) {
      isValid = true
    }

    return isValid
  }

  static getCAddressLength() {
    return 34
  }

  static getSAddressLength() {
    return 102
  }

  static isCAddress(address: string) {
    return address.length === ValidateAddressService.getCAddressLength()
  }

  static isSAddress(address: string) {
    return address.length === ValidateAddressService.getSAddressLength()
  }

	/**
   * Returns a Joi for Cloak address validation.
   *
	 * @memberof ValidateAddressService
	 */
  getJoi() {
    const newJoi = Joi.extend((joi) => ({
      base: joi.string(),
      name: 'cloakAddress',
      language: {
        validCloak: this.t(`is not a valid Cloak address`),
        validStealth: this.t(`is not a valid Stealth address`),
        validAll: this.t(`is not a valid Cloak or stealth address`)
      },
      /* eslint-disable-next-line no-unused-vars */
      pre: (value, state, options) => value.trim(), // pre: (value, state, options) => value.replace(/\s+/g, ''),
      rules: [
        {
          name: 'validCloak',
          validate: (params, value, state, options) => {
            if (!this.validate(value, true, false)) {
              const err = joi.createError('cloakAddress.validCloak', {}, state, options)
              err.context.label = ellipsisString(value, 16, 'middle')
              return err
            }
            return value
          }
        },
        {
          name: 'validStealth',
          validate: (params, value, state, options) => {
            if (!this.validate(value, false, true)) {
              const err = joi.createError('cloakAddress.validStealth', {}, state, options)
              err.context.label = ellipsisString(value, 16, 'middle')
              return err
            }
            return value
          }
        },
        {
          name: 'validAll',
          validate: (params, value, state, options) => {
            if (!this.validate(value, true, true)) {
              const err = joi.createError('cloakAddress.validAll', {}, state, options)
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

  /**
   * Returns a Joi for Cloak address validation.
   *
	 * @memberof ValidateAddressService
	 */
  getJoiWithAddressBook() {
    const newJoi = Joi.extend((joi) => ({
      base: joi.string(),
      name: 'addressBook',
      language: {
        valid: this.t(`is predefined address name, please type another one`)
      },
      /* eslint-disable-next-line no-unused-vars */
      pre: (value, state, options) => value.trim(),
      rules: [
        {
          name: 'valid',
          validate: (params, value, state, options) => {
            if (!AddressBookService.isValidName(value)) {
              const err = joi.createError('addressBook.valid', {}, state, options)
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

  static isStealthAddress(address: string) {
    return address.length > 0 && address.length !== ValidateAddressService.getCAddressLength()
  }
}
