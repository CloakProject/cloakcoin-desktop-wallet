// @flow
import bs58check from 'bs58check'
import bech32 from 'bech32'
import * as Joi from 'joi'
import { remote } from 'electron'

import { i18n } from '../i18next.config'

/**
 * ES6 singleton
 */
let instance = null

const cAddrLeadingBytes = [27]

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
  validate(address: string): boolean {
    let isValid = false

    const getLeadingBytes = () => {
      try {
        const decoded = bs58check.decode(address).slice(0, 1).readInt16BE(0)
        return decoded
      } catch(err) {
        return 0x00
      }
    }

    const getBech32Prefix = () => {
      try {
        const decoded = bech32.decode(address)
        return decoded.prefix
      } catch(err) {
        return null
      }
    }

    if (address.startsWith('C')) {
      isValid = address.length === 34 && cAddrLeadingBytes.includes(getLeadingBytes())
    } if (address.startsWith('s')) {
      isValid = address.length === this.getSAddressLength() && ['s'].includes(getBech32Prefix())
    }

    return isValid
  }

  getSAddressLength() {
    return 102
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
        cs: this.t(`has to begin with C- for a cloak address or s- for a enigma one`),
        cLength: this.t(`C-addresses are 34 characters long, not {{length}}`, { length: `{{l}}` }),
        sLength: this.t(`E-addresses are {{sAddressLength}} characters long, not {{length}}`, {
          sAddressLength: this.getSAddressLength(),
          length: `{{l}}`
        }),
        valid: this.t(`is not a valid Cloak address`)
      },
      /* eslint-disable-next-line no-unused-vars */
      pre: (value, state, options) => value.replace(/\s+/g, ''),
      rules: [
        {
          name: 'cs',
          validate: (params, value, state, options) => {
            if (!value.startsWith('C') && !value.startsWith('s')) {
              return joi.createError('cloakAddress.cs', {}, state, options)
            }
            return value
          }
        },
        {
          name: 'cLength',
          validate: (params, value, state, options) => {
            if (value.startsWith('C') && value.length !== 34) {
              return joi.createError('cloakAddress.cLength', { l: value.length }, state, options)
            }
            return value
          }
        },
        {
          name: 'sLength',
          validate: (params, value, state, options) => {
            if (value.startsWith('s') && value.length !== this.getSAddressLength()) {
              return joi.createError('cloakAddress.sLength', { l: value.length }, state, options)
            }
            return value
          }
        },
        {
          name: 'valid',
          validate: (params, value, state, options) => {
            if (!this.validate(value)) {
              return joi.createError('cloakAddress.valid', {}, state, options)
            }
            return value
          }
        }
      ]
    }))

    return newJoi
  }
}
