// @flow
import * as bip39 from 'bip39'
import * as Joi from 'joi'

import { i18n } from '~/i18next.config'

/**
 * ES6 singleton
 */
let instance = null

export type Wallet = {
  +mnemonicSeed: string,
  +privateKey: string
}

/**
 * @export
 * @class Bip39Service
 */
export class Bip39Service {
	/**
	 * Creates an instance of Bip39Service.
   *
	 * @memberof Bip39Service
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

    instance.t = i18n.getFixedT(null, 'service')

		return instance
	}

	/**
	 *
	 * @memberof Bip39Service
	 */
  generateWallet(isTestnet: boolean): Wallet {
    const seed = bip39.generateMnemonic(256)

    return {
      mnemonicSeed: seed,
      privateKey: 'dummy'
    }
  }

	/**
   *
	 * @memberof Bip39Service
	 */
  retrievePrivateKeyFromMnemonicSeed(seed: string): string {
    return 'dummy'
  }

	/**
   * Returns a Joi for mnemonic seed validation
	 * @memberof Bip39Service
	 */
  getMnemonicValidationJoi() {
    const newJoi = Joi.extend((joi) => ({
      base: joi.string(),
      name: 'mnemonicSeed',
      language: {
        wordCount: this.t(`needs to consist of 24 words, not {{w}}`),
        valid: this.t(`is not a valid Bitcoin BIP39 mnemonic seed`)
      },
      /* eslint-disable-next-line no-unused-vars */
      pre: (value, state, options) => value.replace(/\s\s+/g, ' ').toLowerCase(),
      rules: [
        {
          name: 'wordCount',
          validate: (params, value, state, options) => {
            const wordCount = value.trim().split(' ').length
            if (wordCount !== 24) {
              return joi.createError('mnemonicSeed.wordCount', { w: wordCount }, state, options)
            }
            return value
          }
        },
        {
          name: 'valid',
          validate: (params, value, state, options) => {
            if (!bip39.validateMnemonic(value)) {
              return joi.createError('mnemonicSeed.valid', {}, state, options)
            }
            return value
          }
        }
      ]
    }))

    return newJoi
  }
}
