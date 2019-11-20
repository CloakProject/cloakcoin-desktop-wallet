// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'
import { i18n, translate } from '~/i18next.config'

const t = translate('debug')

export type DebugCommand = {
  time: Date,
  command: boolean,
  response: string
}

export type DebugState = {
  isDebugOpen: boolean,
  commandHistory: DebugCommand[],
  historyPos: number | null,
}

export const DebugActions = createActions(
  {
    EMPTY: undefined,

    OPEN_DEBUG: undefined,
    CLOSE_DEBUG: undefined,
    
    OPEN_NODE_LOG_FILE: undefined,

    REQUEST_COMMAND: (command: string) => ({ command }),
    GOT_COMMAND_RESPONSE: (response: string) => ({ response }),
    CLEAR_COMMAND_HISTORY: undefined,

    UPDATE_HISTORY_POS: (pos: number | null) => ({ pos }),
  },
  {
    prefix: 'APP/DEBUG'
  }
)

export const DebugReducer = handleActions(
  {
    [DebugActions.openDebug]: state => ({
      ...state, isDebugOpen: true
    }),
    [DebugActions.closeDebug]: state => ({
      ...state, isDebugOpen: false
    }),
    [DebugActions.requestCommand]: (state, action) => ({
      ...state, commandHistory: [...state.commandHistory, { time: new Date(), command: true, response: action.payload.command }]
    }),
    [DebugActions.gotCommandResponse]: (state, action) => ({
      ...state, historyPos: null, commandHistory: [...state.commandHistory, { time: new Date(), command: false, response: action.payload.response }]
    }),
    [DebugActions.clearCommandHistory]: (state, action) => ({
      ...state, historyPos: null,  commandHistory: [{ time: new Date(), command: false, response: t(`Welcome to the CloakCoin RPC console.\nUse up and down arrows to navigate history, and Ctrl-L to clear screen.\nType help for an overview of available commands.`) }]
    }),
    [DebugActions.updateHistoryPos]: (state, action) => ({
      ...state, historyPos: action.payload.pos
    }),
  }, preloadedState)
