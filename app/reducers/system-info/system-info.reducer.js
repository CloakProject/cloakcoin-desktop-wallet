// @flow
import { createActions, handleActions } from 'redux-actions'
import Decimal from 'decimal.js'
import { preloadedState } from '../preloaded.state'
import { SettingsActions } from '~/reducers/settings/settings.reducer'

export type BlockchainInfo = {
  version: string,
  protocolVersion: number,
  walletVersion: number,
  openSslVersion: string,
  clientName: string,
  clientBuiltDate: string,
  clientStartupTime: Date | null,
  balance: Decimal,
  unconfirmedBalance: Decimal,
  immatureBalance: Decimal,
  cloakingEarnings: Decimal,
  newMint: Decimal,
  stake: Decimal,
  blocks: number,
  highstBlock: number,
  lastBlockTime: Date | null,
  moneySupply: Decimal,
  connections: number,
  proxy: string,
  ip: string,
  difficulty: Decimal,
  testnet: boolean,
  keypoolOldest: number,
  keypoolSize: number,
  payTxFee: Decimal,
  errors: string,
  enigma: boolean,
  anons: number,
  cloakings: number,
  weight: number,
  networkWeight: number,
  unlockedUntil: Date | null,
  unlockedMintOnly: boolean,
  lockedUnlockedByUser: boolean | undefined,
	blockchainSynchronizedPercentage: number,
  lastBlockTime: Date | null,
  mintEstimation: number
}

export type SystemInfoState = {
  blockchainInfo?: BlockchainInfo
}

export const SystemInfoActions = createActions(
  {
    EMPTY: undefined,

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
    [SystemInfoActions.gotBlockchainInfo]: (state, action) => {
      const newState = {
        ...state, blockchainInfo: action.payload.blockchainInfo
      }
      if (state.blockchainInfo.unlockedUntilByUser) {
        newState.blockchainInfo.unlockedUntilByUser = false
        newState.blockchainInfo.unlockedUntil = state.blockchainInfo.unlockedUntil
      }
      return newState
    },

    [SettingsActions.lockWalletCompleted]: state => ({
      ...state, blockchainInfo: {...state.blockchainInfo, unlockedUntilByUser: true, unlockedUntil: new Date(Date.now() - 60 * 1000)}
    }),
    [SettingsActions.unlockWalletCompleted]: (state, action) => ({
      ...state, blockchainInfo: {...state.blockchainInfo, unlockedUntilByUser: true, unlockedMintOnly: action.payload.isMintOnly, unlockedUntil: new Date(Date.now() + 60 * 1000)}
    }),
    [SettingsActions.encryptWalletCompleted]: state => ({
      ...state, blockchainInfo: {...state.blockchainInfo, unlockedUntilByUser: true, unlockedUntil: new Date(Date.now() - 60 * 1000)}
    }),
    [SettingsActions.enableEnigmaCompleted]: (state, action) => ({
      ...state, blockchainInfo: {...state.blockchainInfo, enigma: action.payload.isEnabled}
    }),

  }, preloadedState)
