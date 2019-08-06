// @flow
import { createActions, handleActions } from 'redux-actions'
import { i18n } from '~/i18next.config'

import { preloadedState } from '../preloaded.state'
import Wallet from '~/service/bip39-service'


const t = i18n.getFixedT(null, 'get-started')


export type GetStartedState = {
  createNewWallet: {
    wallet: Wallet | null
  },
  welcome: {
    hint: string | null,
    status: 'info' | 'success' | 'error' | null,
    isBootstrapping: boolean,
    isReadyToUse: boolean
  },
  isCreatingNewWallet: boolean,
  isInProgress: boolean
}

export const GetStartedActions = createActions(
  {
    EMPTY: undefined,

    SET_CREATING_NEW_WALLET: (isCreatingNewWallet: boolean) => isCreatingNewWallet,

    CHOOSE_LANGUAGE: (code: string) => ({ code }),

    CREATE_NEW_WALLET: {
      GENERATE_WALLET: undefined,
      GOT_GENERATED_WALLET: (wallet: Wallet) => wallet,
    },

    WELCOME: {
      ENCRYPT_WALLET: undefined,
      RESTORE_WALLET: undefined,
      AUTHENTICATE: undefined,
      CHANGE_PASSWORD: undefined,

      DISPLAY_HINT: (message: string) => ({ message }),
      WALLET_BOOTSTRAPPING_SUCCEEDED: undefined,
      WALLET_BOOTSTRAPPING_FAILED: (errorMessage: string) => ({ errorMessage }),

      APPLY_CONFIGURATION: undefined,
      USE_CLOAK: undefined
    }
  },
  {
    prefix: 'APP/GET_STARTED'
  }
)

export const GetStartedReducer = handleActions(
  {
    [GetStartedActions.setCreatingNewWallet]: (state, action) => ({
      ...state,
      isCreatingNewWallet: action.payload
    }),
    [GetStartedActions.createNewWallet.gotGeneratedWallet]: (state, action) => ({
      ...state,
      createNewWallet: { ...state.createNewWallet, wallet: action.payload }
    }),
    [GetStartedActions.welcome.applyConfiguration]: state => ({
      ...state,
      welcome: {
        ...state.welcome,
        isBootstrapping: true
      }
    }),
    [GetStartedActions.welcome.useCloak]: state => ({ ...state, isInProgress: false }),
    [GetStartedActions.welcome.displayHint]: (state, action) => ({
      ...state,
      welcome: {
        ...state.welcome,
        hint: action.payload.message,
        status: 'info'
      }
    }),
    [GetStartedActions.welcome.walletBootstrappingFailed]: (state, action) => ({
      ...state,
      welcome: {
        ...state.welcome,
        hint: `${t('Wallet bootstrapping has failed:')} ${action.payload.errorMessage}`,
        status: 'error',
        isBootstrapping: false,
        isReadyToUse: false
      }
    }),
    [GetStartedActions.welcome.walletBootstrappingSucceeded]: state => ({
      ...state,
      welcome: {
        ...state.welcome,
        hint: t(`Success! Your wallet has been created`),
        status: 'success',
        isBootstrapping: false,
        isReadyToUse: true
      }
    }),
  }, preloadedState)
