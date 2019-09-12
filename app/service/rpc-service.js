// @flow
import path from 'path'
import log from 'electron-log'
import { Decimal } from 'decimal.js'
import { v4 as uuid } from 'uuid'
import { remote } from 'electron'
import Client from 'bitcoin-core'
import { from, of, Observable } from 'rxjs'
import { map, take, catchError, switchMap } from 'rxjs/operators'
import { toastr } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { getExportDir, moveFile } from '~/utils/os'
import { getStore } from '~/store/configureStore'
import { AddressBookService } from './address-book-service'
import { BlockchainInfo, DaemonInfo, SystemInfoActions } from '../reducers/system-info/system-info.reducer'
import { Balances, OverviewActions, Transaction } from '../reducers/overview/overview.reducer'
import { OwnAddressesActions, AddressRow } from '../reducers/own-addresses/own-addresses.reducer'
import { SendCashActions } from '~/reducers/send-cash/send-cash.reducer'
import { AddressBookRecord } from '~/reducers/address-book/address-book.reducer'


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
      timeout: 10000
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
   * Encrypts the wallet with a passphrase.
   *
   * @memberof RpcService
   */
  sendWalletPassword(password: string, timeoutSec: number) {
    const client = getClientInstance()
    return client.command('walletpassphrase', password, timeoutSec)
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
   * Requests Cloak node running status and memory usage.
   *
   * @memberof RpcService
   */
  requestDaemonInfo() {
    const client = getClientInstance()

    client.getInfo()
      .then((info: DaemonInfo) => {
        getStore().dispatch(SystemInfoActions.gotDaemonInfo(info))
        return Promise.resolve()
      })
      .catch(err => {
        // TODO: move the prefix to toastr error title in the epic #114
        const errorPrefix = t(`Unable to get Cloak local node info`)
        getStore().dispatch(SystemInfoActions.getDaemonInfoFailure(`${errorPrefix}: ${err}`, err.code))
      })
  }

  getInfo() {
    const client = getClientInstance()

    client.getInfo()
      .then((info: DaemonInfo) => {
        getStore().dispatch(SystemInfoActions.gotDaemonInfo(info))
        return Promise.resolve()
      })
      .catch(err => {
        // TODO: move the prefix to toastr error title in the epic #114
        const errorPrefix = t(`Unable to get Cloak local node info`)
        getStore().dispatch(SystemInfoActions.getDaemonInfoFailure(`${errorPrefix}: ${err}`, err.code))
      })
  }

  /**
   * Request the wallet information.
   *
   * @memberof RpcService
   */
  requestWalletInfo() {
    const client = getClientInstance()

    const commandList = [
      { method: 'getbalance' }
    ]

    from(client.command(commandList))
    .pipe(
         map(result => ({
           unconfirmedBalance: Decimal(result[0])
         }))
    )
    .subscribe(
      (result: Balances) => {
        getStore().dispatch(OverviewActions.gotWalletInfo(result))
      },
      error => {
        log.debug(`Error fetching the wallet balances: ${error}`)
        // TODO: move the prefix to toastr error title in the epic #114
        const errorPrefix = t(`Unable to get Cloak local node info`)
        getStore().dispatch(OverviewActions.getWalletInfoFailure(`${errorPrefix}: ${error}`))
      }
    )
  }

  /**
   * Request wallet transactions.
   *
   * @memberof RpcService
   */
  requestTransactionsDataFromWallet() {
    const client = getClientInstance()

    const queryPromiseArr = [
      this::getPublicTransactionsPromise(client),
    ]

    const combineQueryPromise = Promise.all(queryPromiseArr)
      .then(result => {
        const combinedTransactionsList = [...result[0]]
        const sortedByDateTransactions = combinedTransactionsList.sort((trans1, trans2) => (
          new Date(trans2.timestamp) - new Date(trans1.timestamp)
        ))
        return { transactions: sortedByDateTransactions }
      })

    this::applyAddressBookNamesToTransactions(combineQueryPromise)
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
      version: '',
      protocolVersion: 0,
      walletVersion: 0,
      balance: Decimal('0'),
      unconfirmedBalance: Decimal('0'),
      immatureBalance: Decimal('0'),
      cloakingEarnings: Decimal('0'),
      newMint: Decimal('0'),
      stake: Decimal('0'),
      blocks: 0,
      moneySupply: Decimal('0'),
      connections: 0,
      proxy: '',
      ip: '',
      difficulty: Decimal('0'),
      keypoolOldest: 0,
      keypoolSize: 0,
      payTxFee: Decimal('0'),
      errors: '',
      anons: 0,
      cloakings: 0,
      weight: 0,
      networkWeight: 0,
      blockchainSynchronizedPercentage: 0,
      lastBlockDate: null,
      unlockedUntil: null
    }

    this::getBlockchainInfo(client)
      .then(result => {
        blockchainInfo.version = result.version
        blockchainInfo.protocolVersion = result.protocolversion
        blockchainInfo.walletVersion = result.walletversion
        blockchainInfo.balance = Decimal(result.balance)
        blockchainInfo.unconfirmedBalance = Decimal(result.unconfirmed)
        blockchainInfo.immatureBalance = Decimal(result.immature)
        blockchainInfo.cloakingEarnings = Decimal(result.cloakingearnings)
        blockchainInfo.newMint = Decimal(result.newmint)
        blockchainInfo.stake = Decimal(result.stake)
        blockchainInfo.blocks = result.blocks
        blockchainInfo.moneySupply = Decimal(result.moneysupply)
        blockchainInfo.connections = result.connections
        blockchainInfo.proxy = result.proxy
        blockchainInfo.ip = result.ip
        blockchainInfo.difficulty = Decimal(result.difficulty)
        blockchainInfo.keypoolOldest = result.keypoololdest
        blockchainInfo.keypoolSize = result.keypoolsize
        blockchainInfo.payTxFee = Decimal(result.paytxfee)
        blockchainInfo.errors = result.errors
        blockchainInfo.anons = result.anons
        blockchainInfo.cloakings = result.cloakings
        blockchainInfo.weight = result.weight || 0
        blockchainInfo.networkWeight = result.networkweight || 0
        blockchainInfo.unlockedUntil = result.unlocked_until === undefined ? null : new Date(result.unlocked_until * 1000)
        return client.getBlockHash(result.blocks)
      })
      .then(result => client.getBlock(result))
      .then(result => {
        log.debug(`Blockchain info: ${result}`)
        blockchainInfo.lastBlockDate = new Date(result.time * 1000)
        blockchainInfo.blockchainSynchronizedPercentage = blockchainInfo.blocks <= 0 ? 0 : this.getBlockchainSynchronizedPercentage(blockchainInfo.lastBlockDate)
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
    // TODO: Get the start date right after CloakCoin release - from first block!!!
    const startDate = new Date('31 May 2014 11:52:35 GMT')
    const nowDate = new Date()

    const fullTime = nowDate.getTime() - startDate.getTime()
    const remainingTime = nowDate.getTime() - tempDate.getTime()

    // After 20 min we report 100% anyway
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
  createNewAddress(isStealth?: boolean) {
    const client = getClientInstance()

    client.command(isStealth ? 'getnewstealthaddress' : 'getnewaddress')
      .then(result => {
        const action = OwnAddressesActions.createdOwnAddress({
          address: result,
          cloaking: false
        });
        getStore().dispatch(action)
        return true
      })
      .catch(error => {
        log.debug(`An error occurred when fetching the wallet addresses: ${error}`)
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
   * @param {boolean} isEnigma
   * @returns {Observable<any>}
   * @memberof RpcService
   */
  sendCash(receiptions, isEnigma?: boolean) {
    const client = getClientInstance()

    let fromAccount = ""
    if (isEnigma) {
      fromAccount += "|enigma"
    }

    const toPairs = {}
    receiptions.forEach(x => {
      toPairs[x.toAddress] = parseFloat(x.amountToSend.toFixed(8))
    })

    const commandParameters= [
      fromAccount,
      toPairs
    ]
    
    const command = client.command([{ method: `sendmany`, parameters: commandParameters }])

    command.then(([result])=> {
      if (typeof(result) === 'string') {
        getStore().dispatch(SendCashActions.sendCashOperationStarted(result))
      } else {
        getStore().dispatch(SendCashActions.sendCashFailure(result.message))
      }
      return Promise.resolve()
    })
    .catch(err => {
      console.log('rpc-err', err);
      getStore().dispatch(SendCashActions.sendCashFailure(err.toString()))
    })
  }

  /**
   * @param {boolean} sortByGroupBalance
   * @returns {Observable<any>}
   * @memberof RpcService
   */
  getWalletAddressAndBalance(sortByGroupBalance?: boolean): Observable<any> {
    const client = getClientInstance()

    const promiseArr = [
      this::getWalletAllPublicAddresses(client),
      this::getWalletPublicAddressesWithUnspentOutputs(client),
    ]

    const queryPromise = Promise.all(promiseArr)
      .then(result => {
        let plainPublicUnspentAddresses: string[] = []

        const PublicAddressesResult = result[0][0]
        const PublicAddressesUnspendResult = result[1][0]

        const publicAddressResultSet = new Set()

        if (Array.isArray(PublicAddressesResult)) {
          const publicAddresses = [] // PublicAddressesResult.map(tempValue => tempValue.address)
          for (let index = 0; index < PublicAddressesResult.length; index += 1) {
            publicAddressResultSet.add(PublicAddressesResult[index].address)
            publicAddresses.push(PublicAddressesResult[index].address)
          }
        }

        if (Array.isArray(PublicAddressesUnspendResult)) {
          plainPublicUnspentAddresses = [] // PublicAddressesUnspendResult.map(tempValue => tempValue.address)
          for (let index = 0; index < PublicAddressesUnspendResult.length; index += 1) {
            if(('spendable' in PublicAddressesUnspendResult[index] && PublicAddressesUnspendResult[index].spendable)){
              publicAddressResultSet.add(PublicAddressesUnspendResult[index].address)
            } else {
              const addressToRemove = PublicAddressesUnspendResult[index].address
              publicAddressResultSet.delete(addressToRemove) // Remove any addresses that aren't spendable
            }
          }
        }

        const combinedAddresses = [...Array.from(publicAddressResultSet)]
          .map(addr => ({
            balance: Decimal('0'),
            confirmed: false,
            address: addr,
            isUnspent: plainPublicUnspentAddresses.includes(addr),
            disabled: false
          }))

        log.debug(`Fetching the balances for the combined addresses: ${combinedAddresses}`)
        return this::getAddressesBalance(client, combinedAddresses)
      })
      .then(addresses => {
        const addressList = addresses

        // Show the error to user
        const errorAddressItems = addressList.filter(tempAddressItem => tempAddressItem.balance === null && tempAddressItem.errorMessage)

        if (errorAddressItems && errorAddressItems.length > 0) {
          const errorMessages = errorAddressItems.map(tempAddressItem => `"${tempAddressItem.errorMessage}"`)
          const uniqueErrorMessages = Array.from(new Set(errorMessages)).join(', ')
          const errorKey = `Error fetching balances for {{errorCount}} out of {{addressCount}} addresses. Error messages included: {{errorMessages}}.`
          toastr.error(t(`Address balance error`), t(errorKey, errorAddressItems.length, addressList.length, uniqueErrorMessages.toString()))
        }

        return addressList
      })
      .catch(error => {
        log.debug(`An error occurred when fetching the wallet addresses and balances: ${error}`)
        return []
      })

    return from(queryPromise).pipe(take(1))
  }


  /**
   * Request own addresses with balances.
   *
   * @memberof RpcService
   */
  requestOwnAddresses() {
    const client = getClientInstance()

    const promiseArr = [
      this::getWalletPublicAddresses(client),
      this::getWalletStealthAddresses(client),
    ]

    Promise.all(promiseArr)
      .then(result => {
        const PublicAddressesResult = result[0][0]
        const StealthAddressesResult = result[1][0]

        const addressResultSet = new Set()

        if (Array.isArray(PublicAddressesResult)) {
          for (let index = 0; index < PublicAddressesResult.length; index += 1) {
            addressResultSet.add({
              address: PublicAddressesResult[index],
              cloaking: false
            })
          }
        }

        if (Array.isArray(StealthAddressesResult)) {
          for (let index = 0; index < StealthAddressesResult.length; index += 1) {
            addressResultSet.add({
              address: StealthAddressesResult[index]['address'],
              cloaking: StealthAddressesResult[index]['label'] === 'Cloaking'
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
   * @param {string} transactionId
   * @memberof RpcService
   */
  getTransactionDetails(transactionId: string) {
    const client = getClientInstance()
    const queryPromise = client.command([{ method: 'gettransaction', parameters: [transactionId] }])

    return from(queryPromise).pipe(
      map(results => results[0]),
      map(result => {
        if (result.name === 'RpcError') {
          return result.message
        }

        const tempObj = {}
        Object.keys(result.details[0]).reduce((accumulator, key) => {
          const modified = { ...accumulator }

          if (key === 'amount') {
            modified[`details[0].${key}`] = Decimal(result.details[0][`${key}`])
          } else {
            modified[`details[0].${key}`] = result.details[0][`${key}`]
          }

          return modified
        }, tempObj)

        const detailResult = { ...result, amount: Decimal(result.amount), ...tempObj }
        delete detailResult.details
        delete detailResult.vjoinsplit
        delete detailResult.walletconflicts

        return detailResult
      }),
      catchError(error => {
        log.debug(`An error occurred while fetching transcation details: ${error}`)
        return of(error.message)
      })
    )
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
    return this::exportFileWithMethod('backupwallet', filePath)
  }


	/**
	 * Stops the Cloak daemon
   *
	 * @memberof RpcService
	 */
  stop() {
    const client = getClientInstance()
    return client.command('stop')
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
  return client.command([{ method: 'liststealthaddresses', parameters: ['1'] }])
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
 * @param {Client} client
 * @returns {Promise<any>}
 * @memberof RpcService
 */
function getWalletPublicAddressesWithUnspentOutputs(client: Client): Promise<any> {
  return client.command([{ method: 'listunspent', parameters: [0] }])
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
    { method: 'listtransactions', parameters: ['', 200] }
  ]

  const noAddressMessage = t(`E address is not listed in the wallet`)
  const publicAddressMessage = t(`C (Public)`)

  return client.command(command)
    .then(result => result[0])
    .then(result => {
      if (Array.isArray(result)) {
        return result.map(
          originalTransaction => ({
            type: `${publicAddressMessage}`,
            category: originalTransaction.category,
            confirmations: originalTransaction.confirmations,
            amount: Decimal(originalTransaction.amount),
            timestamp: originalTransaction.time,
            destinationAddress: originalTransaction.address ? originalTransaction.address : `[ ${noAddressMessage} ]`,
            transactionId: originalTransaction.txid
          })
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
 * Private method. Gets addresses balances in a batch request.
 *
 * @param {Client} client
 * @param {AddressRow[]} addressRows
 * @returns {Promise<any>}
 * @memberof RpcService
 */
function getAddressesBalance(client: Client, addressRows: AddressRow[]): Promise<any> {
  const commands: Object[] = []
  
  addressRows.forEach(address => {
    const confirmedCmd = { method: 'z_getbalance', parameters: [address.address] }
    const unconfirmedCmd = { method: 'z_getbalance', parameters: [address.address, 0] }
    commands.push(confirmedCmd, unconfirmedCmd)
  })

  const promise = client.command(commands)
    .then(balances => {

      const addresses = addressRows.map((address, index) => {

        const confirmedBalance = balances[index * 2]
        const unconfirmedBalance = balances[index * 2 + 1]

        if (typeof(confirmedBalance) === 'object' || typeof(unconfirmedBalance) === 'object') {
          return {
            ...address,
            balance: null,
            confirmed: false,
            errorMessage: confirmedBalance.message || unconfirmedBalance.message
          }
        }

        const isConfirmed = confirmedBalance === unconfirmedBalance
        const displayBalance = isConfirmed ? confirmedBalance : unconfirmedBalance

        return {
          ...address,
          balance: Decimal(displayBalance),
          confirmed: isConfirmed
        }
      })

      return addresses
    })
    .catch(err => {
      log.debug(`An error occurred while fetching an address balances: ${err}`)

      const addresses = addressRows.map(address => ({
        ...address,
        balance: null,
        confirmed: false,
        errorMessage: err.toString()
      }))

      return addresses
    })

  return promise
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
        if (result && typeof(result) === 'object' && result.name === 'RpcError') {
          throw new Error(result.message)
        }
        return true;
      })
  )
}