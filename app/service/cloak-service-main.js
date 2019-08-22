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
    const configPath = path.join(configFolder, configFileName)

    if (!fs.existsSync(configFolder)) {
      fs.mkdirSync(configFolder)
    }

    let cloakNodeConfig

    if (fs.existsSync(configPath)) {
      cloakNodeConfig = PropertiesReader(configPath).path()
      log.info(`The Cloak config file ${configPath} exists and does not need to be created.`);
    } else {
      cloakNodeConfig = this.createConfig(configPath)
      log.info(`The Cloak config file ${configPath} was successfully created.`);
    }

    if (!cloakNodeConfig.rpcport) {
      cloakNodeConfig.rpcport = cloakNodeConfig.testnet ? 19661 : 29661
    }

    cloakNodeConfig.configPath = configPath

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
