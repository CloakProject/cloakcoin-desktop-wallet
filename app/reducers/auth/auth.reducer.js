// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type AuthState = {
  reason: string | null,
  enter: boolean,
  isLoginRequired: boolean
}

export const AuthActions = createActions(
  {
    EMPTY: undefined,

    ENSURE_LOGIN: (reason: string | null, enter: boolean = false) => ({ reason, enter }),
    SUBMIT_PASSWORD: undefined,

    LOGIN_SUCCEEDED: undefined,
    LOGIN_FAILED: (errorMessage: string) => ({ errorMessage })
  },
  {
    prefix: 'AUTH'
  }
)

export const AuthReducer = handleActions(
  {
    [AuthActions.ensureLogin]: (state, action) => ({
      ...state,
      reason: action.payload.reason,
      enter: action.payload.enter,
      isLoginRequired: true
    }),
    [AuthActions.loginSucceeded]: state => ({
      ...state,
      reason: null,
      isLoginRequired: false
    })
  }, preloadedState)
