// @flow
import { createActions, handleActions } from 'redux-actions'
import Decimal from 'decimal.js'
import { preloadedState } from '../preloaded.state'

export type DaemonInfo = { [string]: any }

export type Operation = { [string]: any }

export type BlockchainInfo = {
  version: string,
  protocolVersion: number,
  walletVersion: number,
  balance: Decimal,
  unconfirmedBalance: Decimal,
  immatureBalance: Decimal,
  cloakingEarnings: Decimal,
  newMint: Decimal,
  stake: Decimal,
  blocks: number,
  moneySupply: Decimal,
  connections: number,
  proxy: string,
  ip: string,
  difficulty: Decimal,
  keypoolOldest: number,
  keypoolSize: number,
  payTxFee: Decimal,
  errors: string,
  anons: number,
  cloakings: number,
  weight: number,
  networkWeight: number,
  unlockedUntil: Date | null,
	blockchainSynchronizedPercentage: number,
  lastBlockDate: Date | null
}

export type SystemInfoState = {
	daemonInfo?: DaemonInfo,
  blockchainInfo?: BlockchainInfo
}

export const SystemInfoActions = createActions(
  {
    EMPTY: undefined,

    GET_DAEMON_INFO: undefined,
    GOT_DAEMON_INFO: (daemonInfo: DaemonInfo) => ({ daemonInfo }),
    GET_DAEMON_INFO_FAILURE:  (errorMessage: string, code) => ({ errorMessage, code }),

    GET_BLOCKCHAIN_INFO: undefined,
    GOT_BLOCKCHAIN_INFO: (blockchainInfo: BlockchainInfo) => ({ blockchainInfo }),
    GET_BLOCKCHAIN_INFO_FAILURE:  (errorMessage: string, code) => ({ errorMessage, code }),

    OPEN_WALLET_IN_FILE_MANAGER: undefined,
    OPEN_INSTALLATION_FOLDER: undefined
  },
  {
    prefix: 'APP/SYSTEM_INFO'
  }
)

export const SystemInfoReducer = handleActions(
  {
    [SystemInfoActions.gotDaemonInfo]: (state, action) => ({
      ...state, daemonInfo: action.payload.daemonInfo
    }),
    [SystemInfoActions.gotBlockchainInfo]: (state, action) => ({
      ...state, blockchainInfo: action.payload.blockchainInfo
    })
  }, preloadedState)
