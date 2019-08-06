// @flow
import { EOL } from 'os'
import * as fs from 'fs'
import path from 'path'
import log from 'electron-log'
import { app, remote } from 'electron'

import { getOS } from '../utils/os'


const generator = require('generate-password')
const PropertiesReader = require('properties-reader')

/**
 * ES6 singleton
 */
let instance = null

const configFolderName = 'CloakCoin'
const configFileName = 'CloakCoin.conf'
const configFileContents = [
  `testnet=1`,
  `port=18233`,
  `rpcport=18232`,
  `rpcuser=resuser`,
  `rpcpassword=%generatedPassword%`,
  ``
].join(EOL)


/**
 * @export
 * @class CloakService
 */
export class CloakService {
	/**
	 * Creates an instance of CloakService.
   *
	 * @memberof CloakService
	 */
	constructor() {
		if (!instance) { instance = this }

		return instance
	}

	/**
	 * Returns Cloak service data path.
   *
	 * @memberof CloakService
	 */
  getDataPath() {
    const validApp = process.type === 'renderer' ? remote.app : app
    let configFolder = path.join(validApp.getPath('appData'), configFolderName)
    if (getOS() === 'linux') {
      configFolder = path.join(validApp.getPath('home'), '.CloakCoin')
    }
    return configFolder
  }

	/**
   * Checks if Cloak node config is present and creates one if it doesn't.
   *
	 * @memberof CloakService
	 * @returns {Object} Node configuration dictionary
	 */
  checkAndCreateConfig(): Object {
    const configFolder = this.getDataPath()
    const configFile = path.join(configFolder, configFileName)

    if (!fs.existsSync(configFolder)) {
      fs.mkdirSync(configFolder)
    }

    let cloakNodeConfig

    if (fs.existsSync(configFile)) {
      cloakNodeConfig = PropertiesReader(configFile).path()
      log.info(`The Cloak config file ${configFile} exists and does not need to be created.`);
    } else {
      cloakNodeConfig = this.createConfig(configFile)
      log.info(`The Cloak config file ${configFile} was successfully created.`);
    }

    return cloakNodeConfig
  }

	/**
   * Creates Cloak config file with a generated password.
   *
   * @param {string} configFilePath
	 * @memberof CloakService
	 */
  createConfig(configFilePath: string): Object {
    const rpcPassword = generator.generate({
      length: 32,
      numbers: true
    })
    const contentsWithPassword = configFileContents.replace('%generatedPassword%', rpcPassword)
    fs.writeFileSync(configFilePath, contentsWithPassword)
    return PropertiesReader().read(contentsWithPassword).path()
  }

}
