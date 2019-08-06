// @flow
import path from 'path'
import * as fs from 'fs'
import { promisify } from 'util'
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
import { DECIMAL } from '~/constants/decimal'
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

	/**
	 * Request the wallet information.
	 *
	 * @memberof RpcService
	 */
  requestWalletInfo() {
    const client = getClientInstance()

    const commandList = [
      { method: 'z_gettotalbalance' },
      { method: 'z_gettotalbalance', parameters: [0] }
    ]

    from(client.command(commandList))
    .pipe(
         map(result => ({
           transparentBalance: Decimal(result[0].transparent),
           enigmaBalance: Decimal(result[0].enigma),
           totalBalance: Decimal(result[0].total),
           transparentUnconfirmedBalance: Decimal(result[1].transparent),
           enigmaUnconfirmedBalance: Decimal(result[1].enigma),
           totalUnconfirmedBalance: Decimal(result[1].total)
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
      this::getEnigmaTransactionsPromise(client)
    ]

    const combineQueryPromise = Promise.all(queryPromiseArr)
      .then(result => {
        const combinedTransactionsList = [...result[0], ...result[1]]
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
      connectionCount: 0,
      blockchainSynchronizedPercentage: 0,
      lastBlockDate: null
    }

    client.getConnectionCount()
      .then(result => {
        blockchainInfo.connectionCount = result
        return client.getBlockCount()
      })
      .then(result => client.getBlockHash(result))
      .then(result => client.getBlock(result))
      .then(result => {
        log.debug(`Blockchain info: ${result}`)
        blockchainInfo.lastBlockDate = new Date(result.time * 1000)
        blockchainInfo.blockchainSynchronizedPercentage = this.getBlockchainSynchronizedPercentage(blockchainInfo.lastBlockDate)
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
    // TODO: Get the start date right after ZCash release - from first block!!!
    const startDate = new Date('28 Oct 2016 02:00:00 GMT')
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
	 * @param {boolean} [isEnigma]
	 * @returns {Observable<any>}
	 * @memberof RpcService
	 */
	createNewAddress(isEnigma?: boolean): Observable<any> {
		const client = getClientInstance()
		const createNewAddressPromise = client.command([{ method: isEnigma ? `z_getnewaddress` : `getnewaddress` }])

		return from(createNewAddressPromise).pipe(
			map(result => result[0]),
			catchError(error => {
				log.debug(`There was an error creating a new address: ${error}`)
				return of('')
			})
		)
	}

	/**
	 * @param {string} fromAddress
	 * @param {string} toAddress
	 * @param {Decimal} amountToSend
	 * @returns {Observable<any>}
	 * @memberof RpcService
	 */
	sendCash(fromAddress: string, toAddress: string, amountToSend: Decimal) {
		const client = getClientInstance()

    const commandParameters= [
      fromAddress,
      [{ address: toAddress, amount: amountToSend.sub(DECIMAL.transactionFee) }]
    ]

    // Confirmations number, important!
    if (fromAddress.toLowerCase().startsWith('r') && toAddress.toLowerCase().startsWith('r')) {
      commandParameters.push(0)
    }

    const command = client.command([{ method: `z_sendmany`, parameters: commandParameters }])

    command.then(([result])=> {
      if (typeof(result) === 'string') {
        getStore().dispatch(SendCashActions.sendCashOperationStarted(result))
      } else {
        getStore().dispatch(SendCashActions.sendCashFailure(result.message))
      }
      return Promise.resolve()
    })
    .catch(err => (
      getStore().dispatch(SendCashActions.sendCashFailure(err.toString()))
    ))
	}

	/**
	 * @param {boolean} sortByGroupBalance
	 * @param {boolean} disableTheEnigmaAddress
	 * @returns {Observable<any>}
	 * @memberof RpcService
	 */
	getWalletAddressAndBalance(sortByGroupBalance?: boolean, disableTheEnigmaAddress?: boolean): Observable<any> {
		const client = getClientInstance()

		const promiseArr = [
			this::getWalletAllPublicAddresses(client),
			this::getWalletPublicAddressesWithUnspentOutputs(client),
			this::getWalletEnigmaAddresses(client)
		]

		const queryPromise = Promise.all(promiseArr)
			.then(result => {
        let plainPublicUnspentAddresses: string[] = []

				const PublicAddressesResult = result[0][0]
				const PublicAddressesUnspendResult = result[1][0]
				const enigmaAddressesResult = result[2][0]

				const publicAddressResultSet = new Set()
				const enigmaAddressResultSet = new Set()

				if (Array.isArray(PublicAddressesResult)) {
					const publicAddresses = PublicAddressesResult.map(tempValue => tempValue.address)
					for (let index = 0; index < publicAddresses.length; index += 1) {
						publicAddressResultSet.add(publicAddresses[index])
					}
				}

				if (Array.isArray(PublicAddressesUnspendResult)) {
					plainPublicUnspentAddresses = PublicAddressesUnspendResult.map(tempValue => tempValue.address)
					for (let index = 0; index < plainPublicUnspentAddresses.length; index += 1) {
						publicAddressResultSet.add(plainPublicUnspentAddresses[index])
					}
				}

				if (Array.isArray(enigmaAddressesResult)) {
					for (let index = 0; index < enigmaAddressesResult.length; index += 1) {
						enigmaAddressResultSet.add(enigmaAddressesResult[index])
					}
				}

				const combinedAddresses = [...Array.from(publicAddressResultSet), ...Array.from(enigmaAddressesResult)]
					.map(addr => ({
						balance: Decimal('0'),
						confirmed: false,
						address: addr,
            isUnspent: plainPublicUnspentAddresses.includes(addr),
						disabled: false
					}))
          .filter(item => !(item.address.startsWith('rr') || item.address.startsWith('rs')))

				log.debug(`Fetching the balances for the combined addresses: ${combinedAddresses}`)
				return this::getAddressesBalance(client, combinedAddresses)
			})
			.then(addresses => {
				let addressList = null

				// Sort for each groups
				if (sortByGroupBalance) {
					const publicAddresses = []
					const enigmaAddresses= []

					for (let index = 0; index < addresses.length; index += 1) {
						const tempAddressItem = addresses[index];
						if (tempAddressItem.address.startsWith('z')) {
							enigmaAddresses.push(tempAddressItem)
						} else {
							publicAddresses.push(tempAddressItem)
						}
					}

					publicAddresses.sort((item1, item2) => item2.balance.sub(item1.balance))
					enigmaAddresses.sort((item1, item2) => item2.balance.sub(item1.balance))

					addressList = [...publicAddresses, ...enigmaAddresses]
				} else {
					addressList = addresses
				}

				// Show the error to user
				const errorAddressItems = addressList.filter(tempAddressItem => tempAddressItem.balance === null && tempAddressItem.errorMessage)

				if (errorAddressItems && errorAddressItems.length > 0) {
          const errorMessages = errorAddressItems.map(tempAddressItem => `"${tempAddressItem.errorMessage}"`)
					const uniqueErrorMessages = Array.from(new Set(errorMessages)).join(', ')
          const errorKey = `Error fetching balances for {{errorCount}} out of {{addressCount}} addresses. Error messages included: {{errorMessages}}.`
          toastr.error(t(`Address balance error`), t(errorKey, errorAddressItems.length, addressList.length, uniqueErrorMessages.toString()))
				}

				if (disableTheEnigmaAddress) {
					const isEnigmaAddress = (tempAddress: string) => tempAddress.startsWith('z')
					const processedAddressList = addressList.map(tempAddressItem => isEnigmaAddress(tempAddressItem.address) ? { ...tempAddressItem, disabled: true } : tempAddressItem)
					log.debug(`The processed address list: ${processedAddressList}`)
					return processedAddressList
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
    this.getWalletAddressAndBalance(false).subscribe(result => {
      getStore().dispatch(OwnAddressesActions.gotOwnAddresses(result))
    }, err => {
      getStore().dispatch(OwnAddressesActions.getOwnAddressesFailure(err.toString()))
    })
  }

	/**
   * Request known local node operations.
   *
	 * @memberof RpcService
	 */
  requestOperations() {
		const client = getClientInstance()

    client.command('z_listoperationids').then(operationIds => (
      client.command('z_getoperationstatus', operationIds)
    )).then(operations => {
      getStore().dispatch(SystemInfoActions.gotOperations(operations))
      return Promise.resolve()
    }).catch(err => {
      // TODO: move the prefix to toastr error title in the epic #114
      const errorPrefix = t(`Unable to get operations`)
      return getStore().dispatch(SystemInfoActions.getOperationsFailure(`${errorPrefix}: ${err}`, err.code))
    })
  }

	/**
   * Request merge all mined coins operation.
   *
	 * @memberof RpcService
	 */
  mergeAllMinedCoins(zAddress: string) {
    const command = getClientInstance().command('z_shieldcoinbase', '*', zAddress)
    this::performMergeCoinsCommand(command)
  }

	/**
   * Request merge all C-address coins operation.
   *
	 * @memberof RpcService
	 */
  mergeAllRAddressCoins(zAddress: string) {
    const command = getClientInstance().command('z_mergetoaddress', ['ANY_TADDR'], zAddress)
    this::performMergeCoinsCommand(command)
  }

	/**
   * Request merge all E-address coins operation.
   *
	 * @memberof RpcService
	 */
  mergeAllZAddressCoins(zAddress: string) {
    const command = getClientInstance().command('z_mergetoaddress', ['ANY_ZADDR'], zAddress)
    this::performMergeCoinsCommand(command)
  }

	/**
   * Request merge all coins operation.
   *
	 * @memberof RpcService
	 */
  mergeAllCoins(zAddress: string) {
    const command = getClientInstance().command('z_mergetoaddress', ['*'], zAddress)
    this::performMergeCoinsCommand(command)
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

				log.debug(`Transaction details: ${detailResult}`)

				return detailResult
			}),
			catchError(error => {
				log.debug(`An error occurred while fetching transcation details: ${error}`)
				return of(error.message)
			})
		)
	}

	/**
   * Export private keys to a file.
   *
	 * @memberof RpcService
	 */
  exportPrivateKeys(filePath) {
    return this::exportFileWithMethod('z_exportwallet', filePath)
  }

	/**
   * Import private keys from a file.
   *
	 * @memberof RpcService
   * @returns {Observable}
	 */
  importPrivateKeys(filePath) {
    const client = getClientInstance()

    const importFileName = uuid().replace(/-/g, '')
    const importFilePath = path.join(getExportDir(), importFileName)

    const observable = from(
      promisify(fs.copyFile)(filePath, importFilePath)
        .then(() => (
          client.command('z_importwallet', importFilePath)
            .finally(() => promisify(fs.unlink)(importFilePath))
        ))
    )

    return observable
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

}

/* RPC Service private methods */

/**
 * @param {Client} client
 * @returns {Promise<any>}
 * @memberof RpcService
 */
function getWalletEnigmaAddresses(client: Client): Promise<any> {
  return client.command([{ method: 'z_listaddresses' }])
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

  const noAddressMessage = t(`Z address is not listed in the wallet`)
  const publicAddressMessage = t(`R (Public)`)

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
 * Private method. Returns enigma transactions array.
 *
 * @param {Client} client
 * @returns {Promise<any>}
 * @memberof RpcService
 */
async function getEnigmaTransactionsPromise(client: Client) {
  const getWalletZAddressesCmd = () => [{ method: 'z_listaddresses' }]
  const getWalletZReceivedTransactionsCmd = (zAddress) => [{ method: 'z_listreceivedbyaddress', parameters: [zAddress, 0] }]
  const getWalletTransactionCmd = (transactionId) => [{ method: 'gettransaction', parameters: [transactionId] }]

  // First, we get all the enigma addresses, and then for each one, we get all their transactions
  const enigmaAddresses = await client.command(getWalletZAddressesCmd()).then(tempResult => tempResult[0])

  if (Array.isArray(enigmaAddresses) && enigmaAddresses.length > 0) {
    let queryResultWithAddressArr = []
    for (let index = 0; index < enigmaAddresses.length; index += 1) {
      const tempAddress = enigmaAddresses[index];

      /* eslint-disable-next-line no-await-in-loop */
      const addressTransactions = await client.command(getWalletZReceivedTransactionsCmd(tempAddress)).then(tempResult => tempResult[0])

      if (Array.isArray(addressTransactions) && addressTransactions.length > 0) {
        const addressTransactionsWithEnigmaAddress = addressTransactions.map(tran => Object.assign({}, tran, { address: tempAddress }))
        queryResultWithAddressArr = [...queryResultWithAddressArr, ...addressTransactionsWithEnigmaAddress]
      }
    }

    const tempTransactionsList = queryResultWithAddressArr.map(result => ({
      type: t(`T (Enigma)`),
      category: 'receive',
      confirmations: 0,
      amount: Decimal(result.amount),
      timestamp: 0,
      destinationAddress: result.address,
      transactionId: result.txid
    }))

    // At this moment, we got all transactions for each enigma address, but each one of them is missing the `confirmations` and `time`,
    // we need to get that info by viewing the detail of the transaction, and then put it back !
    for (let index = 0; index < tempTransactionsList.length; index += 1) {
      const tempTransaction = tempTransactionsList[index];
      /* eslint-disable-next-line no-await-in-loop */
      const transactionDetails = await client.command(getWalletTransactionCmd(tempTransaction.transactionId)).then(tempResult => tempResult[0])
      tempTransaction.confirmations = transactionDetails.confirmations
      tempTransaction.timestamp = transactionDetails.time
    }

    return tempTransactionsList
  }

  return []
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
 * Private method. Handles merge coins commands by dispatching success and failure messages.
 *
 * @param {Promise<any>} commandPromise Result of client.command
 * @memberof RpcService
 */
function performMergeCoinsCommand(commandPromise: Promise<any>) {
    commandPromise.then((result) => (
      getStore().dispatch(OwnAddressesActions.mergeCoinsOperationStarted(result.opid))
    )).catch(err => (
      getStore().dispatch(OwnAddressesActions.mergeCoinsFailure(err.toString()))
    ))
}


/**
 * Private method. Used to export private keys or backup the wallet to a file.
 *
 * @memberof RpcService
 */
function exportFileWithMethod(method, filePath) {
  const client = getClientInstance()

  const exportFileName = uuid().replace(/-/g, '')
  const exportFilePath = path.join(getExportDir(), exportFileName)

  return from(
    client.command(method, exportFileName)
      .then((result) => {
        if (typeof(result) === 'object' && result.name === 'RpcError') {
          throw new Error(result.message)
        }
        return moveFile(exportFilePath, filePath)
      })
  )
}
