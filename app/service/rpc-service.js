// @flow
import log from 'electron-log'
import { Decimal } from 'decimal.js'
import { remote } from 'electron'
import config from 'electron-settings'
import Client from 'bitcoin-core'
import { from, race } from 'rxjs'
import { map, take, switchMap, mergeMap } from 'rxjs/operators'
import { ofType } from 'redux-observable'

import { translate } from '~/i18next.config'
import { getStore } from '~/store/configureStore'
import { AddressBookService } from './address-book-service'
import { BlockchainInfo, SystemInfoActions } from '../reducers/system-info/system-info.reducer'
import { OverviewActions, Transaction } from '../reducers/overview/overview.reducer'
import { OwnAddressesActions } from '../reducers/own-addresses/own-addresses.reducer'
import { SendCashActions } from '~/reducers/send-cash/send-cash.reducer'
import { AddressBookActions, AddressBookRecord } from '~/reducers/address-book/address-book.reducer'
import { EnigmaStatsActions } from '~/reducers/enigma-stats/enigma-stats.reducer'
import { DebugActions } from '~/reducers/debug/debug.reducer'
import { SettingsActions } from '~/reducers/settings/settings.reducer'
import ValidateAddressService from '~/service/validate-address-service'

const t = translate('service')

const addressBookService = new AddressBookService()

/**
 * ES6 singleton
 */
let instance = null
let clientInstance = null

/**
 * Create a new cloak client instance.
 */
export const getClientInstance = () => {
  if (!clientInstance) {
    const nodeConfig = remote.getGlobal('cloakNodeConfig')
    let network

    if (nodeConfig.testnet) {
      network = 'testnet'
    } else if (nodeConfig.regtest) {
      network = 'regtest'
    }

    clientInstance = new Client({
      network,
      port: nodeConfig.rpcport,
      username: nodeConfig.rpcuser,
      password: nodeConfig.rpcpassword,
      timeout: 60000
    })
  }

  return clientInstance
}

/**
 * @export
 * @class RpcService
 */
export class RpcService {
  /**
   * Creates an instance of RpcService.
   *
   * @memberof RpcService
   */
  constructor() {
    if (!instance) {
      instance = this
    }

    return instance
  }

  /**
   * Encrypts the wallet with a passphrase.
   *
   * @memberof RpcService
   */
  encryptWallet(password: string) {
    const client = getClientInstance()
    return client.command('encryptwallet', password)
  }

  /**
   * Locks the wallet.
   *
   * @memberof RpcService
   */
  lockWallet() {
    const client = getClientInstance()
    return client.command('walletlock')
  }

  /**
   * Unlocks the wallet.
   *
   * @memberof RpcService
     */
  sendWalletPassword(password: string, timeoutSec: number, mintOnly: boolean) {
    const client = getClientInstance()
    return client.command('walletpassphrase', password, timeoutSec, mintOnly)
  }

  /**
   * Encrypts the wallet with a passphrase.
   *
   * @memberof RpcService
   */
  changeWalletPassword(oldPassword: string, newPassword: string) {
    const client = getClientInstance()
    return client.command('walletpassphrasechange', oldPassword, newPassword)
  }

  /**
   * Request wallet transactions.
   *
   * @memberof RpcService
   */
  requestTransactionsDataFromWallet() {
    const client = getClientInstance()

    const queryPromiseArr = [
      this:: getPublicTransactionsPromise(client),
    ]

    const combineQueryPromise = Promise.all(queryPromiseArr)
      .then(result => {
        const combinedTransactionsList = [...result[0]]
        const sortedByDateTransactions = combinedTransactionsList.sort((trans1, trans2) => (
          new Date(trans2.timestamp) - new Date(trans1.timestamp)
        ))
        return { transactions: sortedByDateTransactions }
      })

    this:: applyAddressBookNamesToTransactions(combineQueryPromise)
      .subscribe(
        result => {
          log.debug(`Wallet transactions: ${result}`)
          getStore().dispatch(OverviewActions.gotTransactionDataFromWallet(result.transactions))
        },
        error => {
          log.debug(`Error fetching wallet transactions: ${error}`)
          // TODO: move the prefix to toastr error title in the epic #114
          const errorPrefix = t(`Unable to get transactions from the wallet`)
          getStore().dispatch(OverviewActions.getTransactionDataFromWalletFailure(`${errorPrefix}: ${error}`))
        }
      )
  }

  /**
   * Request blockchain information.
   *
   * @memberof RpcService
   */
  requestBlockchainInfo() {
    const client = getClientInstance()
    const blockchainInfo: BlockchainInfo = {
      version: 'N/A',
      protocolVersion: 0,
      walletVersion: 0,
      openSslVersion: 'N/A',
      clientName: 'N/A',
      clientBuiltDate: 'N/A',
      clientStartupTime: null,
      balance: Decimal('0'),
      unconfirmedBalance: Decimal('0'),
      immatureBalance: Decimal('0'),
      cloakingEarnings: Decimal('0'),
      newMint: Decimal('0'),
      stake: Decimal('0'),
      blocks: 0,
      highstBlock: 0,
      lastBlockTime: null,
      moneySupply: Decimal('0'),
      connections: 0,
      proxy: '',
      ip: '',
      difficulty: Decimal('0'),
      testnet: false,
      keypoolOldest: 0,
      keypoolSize: 0,
      payTxFee: Decimal('0'),
      errors: '',
      enigma: false,
      anons: 0,
      cloakings: 0,
      weight: 0,
      networkWeight: 0,
      unlockedUntil: null,
      unlockedMintOnly: false,
      blockchainSynchronizedPercentage: 0,
      lastBlockTime: null,
      mintEstimation: 0
    }

    this:: getBlockchainInfo(client)
      .then(result => {
        blockchainInfo.version = result.version
        blockchainInfo.protocolVersion = result.protocolversion
        blockchainInfo.walletVersion = result.walletversion
        blockchainInfo.openSslVersion = result.opensslversion
        blockchainInfo.clientName = result.clientname,
          blockchainInfo.clientBuiltDate = result.clientbuiltdate,
          blockchainInfo.clientStartupTime = new Date(result.clientstartuptime * 1000),
          blockchainInfo.balance = Decimal(result.balance)
        blockchainInfo.unconfirmedBalance = Decimal(result.unconfirmed)
        blockchainInfo.immatureBalance = Decimal(result.immature)
        blockchainInfo.cloakingEarnings = Decimal(result.cloakingearnings)
        blockchainInfo.newMint = Decimal(result.newmint)
        blockchainInfo.stake = Decimal(result.stake)
        blockchainInfo.blocks = result.blocks
        blockchainInfo.highestBlock = result.highestblock
        blockchainInfo.lastBlockTime = new Date(result.lastblocktime * 1000)
        blockchainInfo.moneySupply = Decimal(result.moneysupply)
        blockchainInfo.connections = result.connections
        blockchainInfo.proxy = result.proxy
        blockchainInfo.ip = result.ip
        blockchainInfo.difficulty = Decimal(result.difficulty)
        blockchainInfo.testnet = result.testnet === 1 ? true : false
        blockchainInfo.keypoolOldest = result.keypoololdest
        blockchainInfo.keypoolSize = result.keypoolsize
        blockchainInfo.payTxFee = Decimal(result.paytxfee)
        blockchainInfo.errors = result.errors
        blockchainInfo.enigma = result.enigma === 1 ? true : false
        blockchainInfo.anons = result.anons
        blockchainInfo.cloakings = result.cloakings
        blockchainInfo.weight = result.weight || 0
        blockchainInfo.networkWeight = result.networkweight || 0
        blockchainInfo.unlockedUntil = result.unlocked_until === undefined ? null : new Date(result.unlocked_until * 1000)
        blockchainInfo.unlockedMintOnly = result.unlocked_mint_only === 1 ? true : false
        blockchainInfo.mintEstimation = blockchainInfo.weight > 0 ? (60 * blockchainInfo.networkWeight / blockchainInfo.weight) : 0
        blockchainInfo.blockchainSynchronizedPercentage = blockchainInfo.highestBlock > 0 ? blockchainInfo.blocks * 100 / blockchainInfo.highestBlock : 0
        if (blockchainInfo.blockchainSynchronizedPercentage >= 100) {
          blockchainInfo.blockchainSynchronizedPercentage = this.getBlockchainSynchronizedPercentage(blockchainInfo.lastBlockTime)
        }
        getStore().dispatch(SystemInfoActions.gotBlockchainInfo(blockchainInfo))
        return Promise.resolve()
      })
      .catch(err => {
        log.debug(`Error fetching the blockchain: ${err}`)
        // TODO: move the prefix to toastr error title in the epic #114
        const errorPrefix = t(`Unable to get blockchain info`)
        getStore().dispatch(SystemInfoActions.getBlockchainInfoFailure(`${errorPrefix}: ${err}`, err.code))
      })
  }

  /**
   * @param {*} tempDate
   * @memberof RpcService
   */
  getBlockchainSynchronizedPercentage(tempDate: Date) {
    const startDate = new Date('3 June 2014 20:30:08 GMT')
    const nowDate = new Date()

    const fullTime = nowDate.getTime() - startDate.getTime()
    const remainingTime = nowDate.getTime() - tempDate.getTime()

    // Before 20 min we report 100% anyway
    if (remainingTime > 20 * 60 * 1000) {
      let dPercentage = 100 - remainingTime / fullTime * 100
      if (dPercentage < 0) {
        dPercentage = 0
      } else if (dPercentage > 100) {
        dPercentage = 100
      }

      // Also set a member that may be queried
      return parseFloat(dPercentage.toFixed(2))
    }

    return 100
  }

  /**
   * @param {boolean} [isStealth]
   * @memberof RpcService
   */
  createNewAddress(isStealth?: boolean, label?: string) {
    const client = getClientInstance()

    client.command(isStealth ? 'getnewstealthaddress' : 'getnewaddress')
      .then(result => {
        const action = AddressBookActions.newAddressModal.addOrUpdateAddressWithData({
          address: result,
          name: label,
          isEnigma: isStealth
        },
        true)
        getStore().dispatch(action)
        return true
      })
      .catch(error => {
        log.debug(`An error occurred when creating the wallet address: ${error}`)
        getStore().dispatch(OwnAddressesActions.createOwnAddressFailure(error.toString()))
      })
  }

  /**
   * @interface IReceptions
   * @property {string} toAddress
   * @property {Decimal} amountToSend
   */
  /**
   * @param receiptions Array<IReceptions>
   * @param {boolean} isEnigmaSend
   * @returns {Observable<any>}
   * @memberof RpcService
   */
  sendCash(receiptions, isEnigmaSend: boolean, enigmaSendCloakers: number, enigmaSendTimeout: number, passphrase: string) {
    const client = getClientInstance()

    const toPairs = {}
    receiptions.forEach(x => {
      toPairs[x.toAddress] = parseFloat(x.amountToSend.toFixed(8))
    })


    if (!isEnigmaSend) {
      const commandParameters = [
        '*',
        toPairs
      ]

      if (passphrase) {
        commandParameters.push(1) // minconf
        commandParameters.push(passphrase)
      }

      const command = client.command([{ method: `sendcloakmany`, parameters: commandParameters }])

      command.then(([result]) => {
        if (typeof (result) === 'string') {
          getStore().dispatch(SendCashActions.sendCashStarted(result))
        } else {
          getStore().dispatch(SendCashActions.sendCashFailure(result.message))
        }
        return Promise.resolve()
      })
      .catch(err => {
        log.debug(`An error occurred when sending cash: ${JSON.stringify(err)}`)
        getStore().dispatch(SendCashActions.sendCashFailure(err.toString()))
      })
    } else {
      const commandParameters = [
        toPairs,
        enigmaSendCloakers,
        1, // splits should be 1
        enigmaSendTimeout
      ]

      if (passphrase) {
        commandParameters.push(passphrase)
      }

      const command = client.command([{ method: `sendenigma`, parameters: commandParameters }])

      command.then(([result]) => {
        if (result === null) {
          getStore().dispatch(SendCashActions.sendCashStarted('ENIGMA request sent'))
        } else {
          getStore().dispatch(SendCashActions.sendCashFailure(result.message))
        }
        return Promise.resolve()
      })
      .catch(err => {
        log.debug(`An error occurred when sending enigma cash: ${JSON.stringify(err)}`)
        getStore().dispatch(SendCashActions.sendCashFailure(err.toString()))
      })
    }
  }

  /**
   * Request own addresses with balances.
   *
   * @memberof RpcService
   */
  requestOwnAddresses() {
    const client = getClientInstance()

    const promiseArr = [
      this:: getWalletPublicAddresses(client),
      this:: getWalletStealthAddresses(client),
    ]

    Promise.all(promiseArr)
      .then(result => {
        const PublicAddressesResult = result[0][0]
        const StealthAddressesResult = result[1]

        const addressResultSet = new Set()

        if (Array.isArray(PublicAddressesResult)) {
          for (let index = 0; index < PublicAddressesResult.length; index += 1) {
            const address = PublicAddressesResult[index]
            let foundDup = false
            for (let item of addressResultSet.values()) {
              if (item.address === address) {
                foundDup = true
                break
              }
            }
            if (foundDup) {
              log.debug(`Duplicates found when fetching the wallet public addresses: ${address}`)
              continue
            }
            addressResultSet.add({
              address,
              cloaking: false
            })
          }
        }

        if (Array.isArray(StealthAddressesResult)) {
          for (let index = 0; index < StealthAddressesResult.length; index += 1) {
            let address = StealthAddressesResult[index]
            const cloaking = address.indexOf(' - Cloaking') > 0
            const addressEnd = address.indexOf(' -')
            if (addressEnd > 0) {
              address = address.substr(0, addressEnd)
            }
            let foundDup = false
            for (let item of addressResultSet.values()) {
              if (item.address === address) {
                foundDup = true
                break
              }
            }
            if (foundDup) {
              log.debug(`Duplicates found when fetching the wallet stealth addresses: ${address}`)
              continue
            }
            addressResultSet.add({
              address,
              cloaking
            })
          }
        }

        const combinedAddresses = [...Array.from(addressResultSet)]
          .map(addr => (addr))

        getStore().dispatch(OwnAddressesActions.gotOwnAddresses(combinedAddresses))
        return true
      })
      .catch(error => {
        log.debug(`An error occurred when fetching the wallet addresses: ${JSON.stringify(error)}`)
        getStore().dispatch(OwnAddressesActions.getOwnAddressesFailure(error.toString()))
      })
  }

  /**
   * Request cloaking info.
   *
   * @memberof RpcService
   */
  requestCloakingInfo() {
    const client = getClientInstance()

    client.command('getcloakinginfo')
      .then(result => {
        if (result && typeof (result) === 'object') {
          const cloakingInfo = {
            accepted: result.accepted,
            signed: result.signed,
            refused: result.refused,
            expired: result.expired,
            completed: result.completed,
            earning: Decimal(result.earning)
          }

          getStore().dispatch(EnigmaStatsActions.gotCloakingInfo(cloakingInfo))
          return true
        }

        if (result.message) {
          throw new Error(result.message)
        }

        return false
      })
      .catch(error => {
        log.debug(`An error occurred when fetching the cloaking info: ${JSON.stringify(error)}`)
        getStore().dispatch(EnigmaStatsActions.getCloakingInfoFailure(error.toString()))
      })
  }

  /**
   * Request cloaking requests.
   *
   * @memberof RpcService
   */
  requestCloakingRequests() {
    const client = getClientInstance()

    client.command('listcloakingrequests')
      .then(result => {
        if (Array.isArray(result)) {
          const cloakingRequests = result.map(req => ({
            version: req.version,
            initiator: req.initiator,
            timeInitiated: req.timeinitiated,
            amount: Decimal(req.amount),
            participantsRequired: req.participantsrequired,
            txid: (req.txid && req.txid !== '0') ? req.txid : '',
            mine: req.mine,
            timeBroadcasted: req.timebroadcasted,
            expiresInMs: req.expiresinms,
            aborted: req.aborted,
            autoRetry: req.autoretry,
            retryCount: req.retrycount,
            participants: req.participants || [],
            signers: req.signers || []
          }))

          getStore().dispatch(EnigmaStatsActions.gotCloakingRequests(cloakingRequests))
          return true
        }

        if (result.message) {
          throw new Error(result.message)
        }

        return false
      })
      .catch(error => {
        log.debug(`An error occurred when fetching the cloaking requests: ${JSON.stringify(error)}`)
        getStore().dispatch(EnigmaStatsActions.getCloakingRequestsFailure(error.toString()))
      })
  }

  /**
   * @param {boolean} [enable]
   * @returns {Promise<any>}
   * @memberof RpcService
   */
  enableMining(enable?: boolean): Promise<any> {
    const client = getClientInstance()
    return client.command('setgenerate', enable)
  }

  /**
   * @returns {Promise<any>}
   * @memberof RpcService
   */
  getMiningInfo(): Promise<any> {
    const client = getClientInstance()
    return client.command('getmininginfo')
  }

  /**
   * Backup wallet to a file.
   *
   * @memberof RpcService
   * @returns {Observable}
   */
  backupWallet(filePath) {
    return this:: exportFileWithMethod('backupwallet', filePath)
  }


	/**
	 * Stops the Cloak daemon
   *
	 * @memberof RpcService
	 */
  stop() {
    const client = getClientInstance()
    const detachDatabaseAtShutdown = config.get('newOptions.detachDatabaseAtShutdown', false)
    if (detachDatabaseAtShutdown) {
      return client.command('stop', 1)
    }
    return client.command('stop')
  }

  /**
   * Run a RPC command.
   *
   * @memberof RpcService
   */
  runCommand(command) {
    const client = getClientInstance()

    client.command('rpccommand', command)
      .then((result) => {
        if (typeof result !== 'string') {
          result = JSON.stringify(result)
        }
        getStore().dispatch(DebugActions.gotCommandResponse(result))
        return true
      })
      .catch(error => {
        const strErr = `An error occurred when running command: ${JSON.stringify(error)}`
        getStore().dispatch(DebugActions.gotCommandResponse(strErr))
      })
  }

  /**
   * Avoid circular dependency in types.js
   *
	 * @returns {SettingsActions}
	 * @memberof ChildProcessService
	 */
  getSettingsActions() {
    const settingsReducerModule = require('~/reducers/settings/settings.reducer')
    return settingsReducerModule.SettingsActions
  }

  getRpcEnigmaObservable({ onSuccess, onFailure, action$ }) {
    const actions = this.getSettingsActions()

    const observable = race(
      action$.pipe(
        ofType(actions.enableEnigmaCompleted),
        take(1),
        mergeMap(() => onSuccess)
      ),
      action$.pipe(
        ofType(actions.enableEnigmaFailed),
        take(1),
        switchMap(() => onFailure)
      )
    )

    return observable
  }

  enableEnigma(isEnigmaEnable: boolean,
    enigmaReserveBalance?: number,
    isEnigmaAutoRetry?: boolean,
    isCloakShieldEnigmaTransactions?: boolean,
    isCloakShieldNonEnigmaTransactions?: boolean,
    cloakShieldRoutes?: number,
    cloakShieldNodes?: number,
    cloakShieldHops?: number) {
      
    const client = getClientInstance()

    const parameters = [
      isEnigmaEnable
    ]
    if (enigmaReserveBalance !== undefined && enigmaReserveBalance !== null) {
      parameters.push(enigmaReserveBalance)
      if (isEnigmaAutoRetry !== undefined && isEnigmaAutoRetry !== null) {
        parameters.push(isEnigmaAutoRetry)
        if (isCloakShieldEnigmaTransactions !== undefined && isCloakShieldEnigmaTransactions !== null) {
          parameters.push(isCloakShieldEnigmaTransactions)
          if (isCloakShieldNonEnigmaTransactions !== undefined && isCloakShieldNonEnigmaTransactions !== null) {
            parameters.push(isCloakShieldNonEnigmaTransactions)
            if (cloakShieldRoutes !== undefined && cloakShieldRoutes !== null) {
              parameters.push(cloakShieldRoutes)
              if (cloakShieldNodes !== undefined && cloakShieldNodes !== null) {
                parameters.push(cloakShieldNodes)
                if (cloakShieldHops !== undefined && cloakShieldHops !== null) {
                  parameters.push(cloakShieldHops)
                }
              }
            }
          }
        }
      }
    }
    const command = client.command([{ method: `enableenigma`, parameters }])

    command.then(([result]) => {
      if (result) {
        getStore().dispatch(SettingsActions.enableEnigmaFailed(JSON.stringify(result)))
      } else {
        getStore().dispatch(SettingsActions.enableEnigmaCompleted(isEnigmaEnable))
      }
      return true
    })
    .catch(err => {
      log.debug(`An error occurred when changing enigma: ${JSON.stringify(err)}`)
      getStore().dispatch(SettingsActions.enableEnigmaFailed(err.toString()))
    })
  }

}

/**
 * @returns {Promise<any>}
 * @memberof RpcService
 */
function getBlockchainInfo(client: Client): Promise<any> {
  return client.command('getinfo')
}

/**
 * @param {Client} client
 * @returns {Promise<any>}
 * @memberof RpcService
 */
// eslint-disable-next-line no-unused-vars
function getWalletPublicAddresses(client: Client): Promise<any> {
  return client.command([{ method: 'getaddressesbyaccount', parameters: [''] }])
}

/**
 * @param {Client} client
 * @returns {Promise<any>}
 * @memberof RpcService
 */
// eslint-disable-next-line no-unused-vars
function getWalletStealthAddresses(client: Client): Promise<any> {
  return client.command('liststealthaddresses')
}

/**
 * @param {Client} client
 * @returns {Promise<any>}
 * @memberof RpcService
 */
function getWalletAllPublicAddresses(client: Client): Promise<any> {
  return client.command([{ method: 'listreceivedbyaddress', parameters: [0, true] }])
}

/**
 * Private method. Returns public transactions array.
 *
 * @param {Client} client
 * @returns {Promise<any>}
 * @memberof RpcService
 */
async function getPublicTransactionsPromise(client: Client) {
  const command = [
    { method: 'listtransactions', parameters: ['*', 200] }
  ]

  const noAddressMessage = t(`No address`)
  const publicAddressMessage = t(`C (Public)`)

  return client.command(command)
    .then(result => result[0])
    .then(result => {
      if (Array.isArray(result)) {
        return result.map(
          originalTransaction => {
            let address = originalTransaction.account ? originalTransaction.account : originalTransaction.address
            if (address === undefined || address === null) {
              address = ''
            }
            return {
              type: `${publicAddressMessage}`,
              category: originalTransaction.category,
              confirmations: originalTransaction.confirmations,
              amount: Decimal(originalTransaction.amount),
              timestamp: originalTransaction.time,
              destinationAddress: address || `[ ${noAddressMessage} ]`,
              isStealthAddress: ValidateAddressService.isStealthAddress(address),
              transactionId: originalTransaction.txid
            }
          }
        )
      }

      if (result.message) {
        throw new Error(result.message)
      }

      return []
    })

}

/**
 * Private method. Adds address book names to transactions.
 *
 * @param {Promise[any]} transactionsPromise Promise returning { transactions: [] } object.
 * @returns {Observable}
 * @memberof RpcService
 */
function applyAddressBookNamesToTransactions(transactionsPromise) {
  const observable = from(transactionsPromise)
    .pipe(
      switchMap(result => {
        if (!result.transactions || !result.transactions.length) {
          return [result]
        }

        return addressBookService.loadAddressBook().pipe(
          map((addressBookRecords: AddressBookRecord[]) => {
            if (!addressBookRecords.length) {
              return result
            }

            const modified = { ...result }

            modified.transactions = result.transactions.map((transaction: Transaction) => {
              const matchedRecord = (
                addressBookRecords
                  .find(record => record.address === transaction.destinationAddress)
              )
              return matchedRecord ? ({ ...transaction, destinationAddress: matchedRecord.name }) : transaction
            })

            return modified
          })
        )
      }),
      take(1)
    )

  return observable
}

/**
 * Private method. Used to export private keys or backup the wallet to a file.
 *
 * @memberof RpcService
 */
function exportFileWithMethod(method, filePath) {
  const client = getClientInstance()

  return from(
    client.command(method, filePath.concat('.dat'))
      .then((result) => {
        if (result && typeof (result) === 'object' && result.name === 'RpcError') {
          throw new Error(result.message)
        }
        return true;
      })
  )
}