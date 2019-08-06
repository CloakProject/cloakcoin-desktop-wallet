// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'
import { ChildProcessName, ChildProcessStatus } from '~/service/child-process-service'

export type SettingsState = {
  isStatusModalOpen: boolean,
  childProcessesStatus: { [ChildProcessName]: ChildProcessStatus },
  language: string
}

export const SettingsActions = createActions(
  {
    EMPTY: undefined,

    UPDATE_LANGUAGE: (code: string) => ({ code }),

    OPEN_STATUS_MODAL: undefined,
    CLOSE_STATUS_MODAL: undefined,

    TOGGLE_LOCAL_NODE: undefined,
    START_LOCAL_NODE: undefined,
    RESTART_LOCAL_NODE: undefined,
    STOP_LOCAL_NODE: undefined,

    INITIATE_WALLET_BACKUP: undefined,
    BACKUP_WALLET: filePath => ({filePath}),
    INITIATE_WALLET_RESTORE: undefined,
    RESTORE_WALLET: filePath => ({filePath}),
    RESTORING_WALLET_FAILED: (errorMessage: string = '') => ({ errorMessage }),
    RESTORING_WALLET_SUCCEEDED: undefined,

    KICK_OFF_CHILD_PROCESSES: undefined,

    CHILD_PROCESS_STARTED: processName => ({ processName }),
    CHILD_PROCESS_FAILED: (processName, errorMessage) => ({ processName, errorMessage }),
    CHILD_PROCESS_RESTART_FAILED: (processName, errorMessage) => ({ processName, errorMessage }),
    CHILD_PROCESS_MURDERED: processName => ({ processName }),
    CHILD_PROCESS_MURDER_FAILED: (processName, errorMessage) => ({ processName, errorMessage })
  },
  {
    prefix: 'APP/SETTINGS'
  }
)

const getChildProcessUpdateFinishedState = (state, action, processStatus: ChildProcessStatus) => {
  const newState = {...state}
  newState.childProcessesStatus[action.payload.processName] = processStatus
  return newState
}

const getChildProcessUpdateFailedState = (state, action, processStatus: ChildProcessStatus, isEnabled) => {
  const newState = getChildProcessUpdateFinishedState(state, action, processStatus)

  return newState
}

export const SettingsReducer = handleActions(
  {
    // Language
    [SettingsActions.updateLanguage]: (state, action) => ({
      ...state, language: action.payload.code
    }),

    // Status Modal
    [SettingsActions.openStatusModal]: state => ({
      ...state, isStatusModalOpen: true
    }),
    [SettingsActions.closeStatusModal]: state => ({
      ...state, isStatusModalOpen: false
    }),

    // Local Node
    [SettingsActions.startLocalNode]: state => ({
      ...state,
      childProcessesStatus: { ...state.childProcessesStatus, NODE: 'STARTING' }
    }),
    [SettingsActions.restartLocalNode]: state => ({
      ...state,
      childProcessesStatus: { ...state.childProcessesStatus, NODE: 'RESTARTING' }
    }),
    [SettingsActions.stopLocalNode]: state => ({
      ...state,
      childProcessesStatus: { ...state.childProcessesStatus, NODE: 'STOPPING' }
    }),

    // Child process updates
    [SettingsActions.childProcessStarted]: (state, action) => (
      getChildProcessUpdateFinishedState(state, action, 'RUNNING')
    ),
    [SettingsActions.childProcessFailed]: (state, action) => (
      getChildProcessUpdateFailedState(state, action, 'FAILED', false)
    ),
    [SettingsActions.childProcessMurdered]: (state, action) => (
      getChildProcessUpdateFinishedState(state, action, 'NOT RUNNING')
    ),
    [SettingsActions.childProcessMurderFailed]: (state, action) => (
      getChildProcessUpdateFailedState(state, action, 'MURDER FAILED', true)
    )

  }, preloadedState)
