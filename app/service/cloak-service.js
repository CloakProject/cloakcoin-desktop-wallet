// @flow
import { EOL } from 'os'
import * as fs from 'fs'
import path from 'path'
import log from 'electron-log'
import generator from 'generate-password'
import PropertiesReader from 'properties-reader'
import config from 'electron-settings'
import { app, remote } from 'electron'

import { getClientInstance } from '~/service/rpc-service'
import { getStore } from '~/store/configureStore'
import { getOS, getExportDir, verifyDirectoryExistence } from '~/utils/os'
import { ChildProcessService } from './child-process-service'

const childProcess = new ChildProcessService()


/**
 * ES6 singleton
 */
let instance = null

// Uncomment for testnet
// const walletFolderName = 'testnet3'

const walletFolderName = ''
const configFolderName = 'CloakCoin'
const configFileName = 'CloakCoin.conf'
const configFileContents = [
  `rpcuser=resuser`,
  `rpcpassword=%generatedPassword%`,
  ``
].join(EOL)

const cloakcoindArgs = ['-enigma', '-daemon']


/**
 * @export
 * @class CloakService
 */
export class CloakService {
  isDoneLoading: boolean

	/**
	 * Creates an instance of CloakService.
   *
	 * @memberof CloakService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

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
   * This is for the raw wallet path i.e. the testnet3 directory
   *
	 * @memberof CloakService
	 * @returns {string}
	 */
  getWalletPath() {
    return path.join(this.getDataPath(), walletFolderName)
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
      log.info(`The Cloak config file ${configPath} exists and does not need to be created.`)
    } else {
      cloakNodeConfig = this.createConfig(configPath)
      log.info(`The Cloak config file ${configPath} was successfully created.`)
    }

    if (!cloakNodeConfig.rpcport) {
      cloakNodeConfig.rpcport = cloakNodeConfig.testnet ? 18132 : 8132
    }

    cloakNodeConfig.configPath = configPath

    return cloakNodeConfig
  }

	/**
   * Starts cloakcoind
   *
	 * @memberof CloakService
	 */
	async start() {
    await this::startOrRestart({start: true})
	}

	/**
   * Restarts cloakcoind
   *
   * @param {boolean} start
	 * @memberof CloakService
	 */
	async restart() {
    await this::startOrRestart({start: false})
	}

	/**
   * Stops cloakcoind
   *
	 * @memberof CloakService
	 */
	async stop() {
    const client = getClientInstance()
    return client.stop()
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

/* Cloak Service private methods */

/**
 * Private method. Starts or restarts the local node process based on the start switch
 *
 * @param {boolean} start Starts if true, restarts otherwise
 * @memberof CloakService
 */
async function startOrRestart({start}) {
  const caller = start ? childProcess.startProcess : childProcess.restartProcess

  const args = cloakcoindArgs.slice()

  const walletName = config.get('wallet.name', 'wallet')
  args.push(`-wallet=${walletName}.dat`)

  const miningAddress = config.get('miningAddress', false)

  if (miningAddress) {
    args.push(`-mineraddress=${miningAddress}`)
  }

  const exportDir = getExportDir()

  log.info(`Export Dir: ${exportDir}`)

  try {
    await verifyDirectoryExistence(exportDir)
  } catch (err) {
    log.error(`Can't create local node export directory`, err)
    const actions = childProcess.getSettingsActions()
    getStore().dispatch(actions.childProcessFailed('NODE', err.message))
    return
  }

  args.push(`-exportdir=${exportDir}`)

  this.isDoneLoading = false

  await caller.bind(childProcess)({
    processName: 'NODE',
    args,
    shutdownFunction: async () => this.stop(),
    outputHandler: this::handleOutput,
    waitUntilReady: childProcess.createReadinessWaiter(this::getRpcAvailabilityChecker())
  })
}

/**
 * Private method. Called on new data in stdout, returns true if Cloak node has been initialized.
 *
 * @param {string} configFilePath
 * @memberof CloakService
 */
function handleOutput(data: Buffer) {
  if (!this.isDoneLoading) {
    this.isDoneLoading = data.toString().includes(`init message: Done loading`)
  }
}

function getRpcAvailabilityChecker() {
  const checker = async () => {
    const client = getClientInstance()

    if (!this.isDoneLoading) {
      return false
    }

    try {
      await client.getInfo()
      log.debug(`The local node has successfully accepted an RPC call`)
      return true
    } catch (err) {
      log.debug(`The local node hasn't accepted an RPC check call`)
      return false
    }
  }

  return checker
}
