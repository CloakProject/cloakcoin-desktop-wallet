// @flow
import { ipcRenderer } from 'electron'
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'
import { ChildProcessName, ChildProcessStatus } from '~/service/child-process-service'

export type SettingsState = {
  childProcessesStatus: { [ChildProcessName]: ChildProcessStatus }
}

export const SettingsActions = createActions(
  {
    EMPTY: undefined,

    ENCRYPT_WALLET: undefined,
    ENCRYPT_WALLET_COMPLETED: undefined,
    ENCRYPT_WALLET_FAILED: undefined,

    LOCK_WALLET: undefined,
    LOCK_WALLET_COMPLETED: undefined,
    LOCK_WALLET_FAILED: undefined,

    UNLOCK_WALLET: (isMintOnly: boolean) => ({ isMintOnly }),
    UNLOCK_WALLET_COMPLETED: (isMintOnly: boolean) => ({ isMintOnly }),
    UNLOCK_WALLET_FAILED: undefined,

    CHANGE_PASSPHRASE: undefined,
    CHANGE_PASSPHRASE_COMPLETED: undefined,
    CHANGE_PASSPHRASE_FAILED: undefined,

    ENABLE_ENIGMA: (isEnable: boolean) => ({ isEnable }),
    ENABLE_ENIGMA_COMPLETED: (isEnabled: boolean) => ({ isEnabled }),
    ENABLE_ENIGMA_FAILED: (errorMessage: string = '') => ({ errorMessage }),

    INITIATE_WALLET_BACKUP: undefined,
    BACKUP_WALLET: filePath => ({filePath}),
    BACKINGUP_WALLET_COMPLETED: undefined,
    BACKINGUP_WALLET_FAILED: undefined,
    BACKINGUP_WALLET_CANCELLED: undefined,

    INITIATE_WALLET_RESTORE: undefined,
    RESTORE_WALLET: filePath => ({filePath}),
    RESTORING_WALLET_FAILED: (errorMessage: string = '') => ({ errorMessage }),
    RESTORING_WALLET_SUCCEEDED: undefined,

    TOGGLE_LOCAL_NODE: undefined,
    START_LOCAL_NODE: undefined,
    RESTART_LOCAL_NODE: undefined,
    STOP_LOCAL_NODE: undefined,

    KICK_OFF_CHILD_PROCESSES: undefined,

    CHILD_PROCESS_STARTING: processName => ({ processName }),
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
  ipcRenderer.send('able-to-quit')
  const newState = getChildProcessUpdateFinishedState(state, action, processStatus)
  return newState
}

export const SettingsReducer = handleActions(
  {
    // Encrypt Wallet
    [SettingsActions.encryptWallet]: state => ({
      ...state,
      isWalletEncrypting: true
    }),

    [SettingsActions.encryptWalletCompleted]: state => ({
      ...state,
      isWalletEncrypting: false
    }),

    [SettingsActions.encryptWalletFailed]: state => ({
      ...state,
      isWalletEncrypting: false
    }),

    // Lock Wallet
    [SettingsActions.lockWallet]: state => ({
      ...state,
      isWalletLocking: true
    }),

    [SettingsActions.lockWalletCompleted]: state => ({
      ...state,
      isWalletLocking: false
    }),

    [SettingsActions.lockWalletFailed]: state => ({
      ...state,
      isWalletLocking: false
    }),

    // Unlock Wallet
    [SettingsActions.unlockWallet]: state => ({
      ...state,
      isWalletUnlocking: true
    }),

    [SettingsActions.unlockWalletCompleted]: state => ({
      ...state,
      isWalletUnlocking: false
    }),

    [SettingsActions.unlockWalletFailed]: state => ({
      ...state,
      isWalletUnlocking: false
    }),

    // Change Passphrase
    [SettingsActions.changePassphrase]: state => ({
      ...state,
      isPassphraseChanging: true,
      isPassphraseChanged: false
    }),

    [SettingsActions.changePassphraseCompleted]: state => ({
      ...state,
      isPassphraseChanging: false,
      isPassphraseChanged: true
    }),

    [SettingsActions.changePassphraseFailed]: state => ({
      ...state,
      isPassphraseChanging: false,
      isPassphraseChanged: false
    }),

    // Enable Enigma
    [SettingsActions.enableEnigma]: state => ({
      ...state,
      isEnigmaChanging: true,
      isEnigmaChanged: false
    }),

    [SettingsActions.enableEnigmaCompleted]: state => ({
      ...state,
      isEnigmaChanging: false,
      isEnigmaChanged: true
    }),

    [SettingsActions.enableEnigmaFailed]: state => ({
      ...state,
      isEnigmaChanging: false,
      isEnigmaChanged: false
    }),

    // Backup Wallet
    [SettingsActions.initiateWalletBackup]: state => ({
      ...state,
      isWalletBackingup: true
    }),

    [SettingsActions.backupWallet]: state => ({
      ...state,
      isWalletBackingup: true
    }),

    [SettingsActions.backingupWalletCompleted]: state => ({
      ...state,
      isWalletBackingup: false
    }),

    [SettingsActions.backingupWalletFailed]: state => ({
      ...state,
      isWalletBackingup: false
    }),

    [SettingsActions.backingupWalletCancelled]: state => ({
      ...state,
      isWalletBackingup: false
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
    [SettingsActions.childProcessStarting]: (state, action) => (
      getChildProcessUpdateFinishedState(state, action, 'STARTING')
    ),
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
