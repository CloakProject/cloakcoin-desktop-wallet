// @flow
import config from 'electron-settings'
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'

export type OptionsState = {
  isOptionsOpen: boolean,
  isApplyingOptions: boolean,
  startupAtSystemLogin: boolean,
  detachDatabaseAtShutdown: boolean,
  mapPortUsingUpnp: boolean,
  connectThroughSocksProxy: boolean,
  proxyIp: string,
  proxyPort: number,
  socksVersion: string,
  minimizeToTray: boolean,
  closeToTray: boolean,
  language: string,
  amountUnit: string,
  enigmaReserveBalance: number,
  enigmaAutoRetry: boolean,
  cloakShieldEnigmaTransactions: boolean,
  cloakShieldNonEnigmaTransactions: boolean,
  cloakShieldRoutes: number,
  cloakShieldNodes: number,
  cloakShieldHops: number
}

export const OptionsActions = createActions(
  {
    EMPTY: undefined,

    OPEN_OPTIONS: undefined,
    CLOSE_OPTIONS: undefined,

    APPLY_CHANGES: (isCloseOnSuccess: boolean = false) => ({ isCloseOnSuccess }),
    APPLY_CHANGES_SUCCEEDED: (newChanges: object, successMessage: string = '') => ({ newChanges, successMessage }),
    APPLY_CHANGES_FAILED: (newChanges: object, errorMessage: string = '') => ({ newChanges, errorMessage })
  },
  {
    prefix: 'APP/OPTIONS'
  }
)

const onApplyChanges = (action: Action, state) => {
  const newOptions = action.payload.newChanges

  Object.keys(newOptions).forEach(key => {
    config.set(`options.${key}`, newOptions[key])
  })

  config.set('newOptions', {...state, ...newOptions})

  return {
    ...state, ...newOptions, isApplyingOptions: false
  }
}

export const OptionsReducer = handleActions(
  {
    [OptionsActions.openOptions]: state => ({
      ...state, isOptionsOpen: true
    }),
    [OptionsActions.closeOptions]: state => ({
      ...state, isOptionsOpen: false, isApplyingOptions: false
    }),

    [OptionsActions.applyChanges]: state => ({
      ...state, isApplyingOptions: true
    }),

    [OptionsActions.applyChangesSucceeded]: (state, action) => onApplyChanges(action, state),

    [OptionsActions.applyChangesFailed]: (state, action) => onApplyChanges(action, state),
  }, preloadedState)
