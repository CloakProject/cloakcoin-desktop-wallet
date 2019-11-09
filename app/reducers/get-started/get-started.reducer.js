// @flow
import { ipcRenderer } from 'electron'
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'


export type GetStartedState = {
  isInProgress: boolean
}

export const GetStartedActions = createActions(
  {
    EMPTY: undefined,

    WELCOME: {
      USE_CLOAK: undefined
    }
  },
  {
    prefix: 'APP/GET_STARTED'
  }
)

const useCloak = (state) => {
  ipcRenderer.send('use-app')
  return { ...state, isInProgress: false }
}

export const GetStartedReducer = handleActions(
  {
    [GetStartedActions.welcome.useCloak]: state => useCloak(state),
  }, preloadedState)
