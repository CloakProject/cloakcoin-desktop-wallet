import path from 'path'
import * as fs from 'fs'
import * as Joi from 'joi'

/**
 * Returns a Joi verifying that the new wallet file doesn't exist
 *
 */
function getWalletNameJoi() {
  const walletNameJoi = Joi.extend((joi) => ({
    base: joi.string(),
    name: 'walletName',
    language: {
      fileDoesntExist: `points to an already existing file`,
    },
    rules: [
      {
        name: 'fileDoesntExist',
        params: {
          walletPath: joi.func().ref()
        },
        validate: (params, value, state, options) => {
          const walletPath = state.parent[params.walletPath.key]

          if (walletPath) {
            const filePath = path.join(walletPath, `${value}.dat`)

            if (fs.existsSync(filePath)) {
              return joi.createError('walletName.fileDoesntExist', {}, state, options)
            }
          }

          return value
        }
      }
    ]
  }))

  return walletNameJoi
}

export {
  getWalletNameJoi
}
