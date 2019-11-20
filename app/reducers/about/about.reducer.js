// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'
import { i18n, translate } from '~/i18next.config'

export type AboutState = {
  isAboutOpen: boolean
}

export const AboutActions = createActions(
  {
    EMPTY: undefined,

    OPEN_ABOUT: undefined,
    CLOSE_ABOUT: undefined
  },
  {
    prefix: 'APP/ABOUT'
  }
)

export const AboutReducer = handleActions(
  {
    [AboutActions.openAbout]: state => ({
      ...state, isAboutOpen: true
    }),
    [AboutActions.closeAbout]: state => ({
      ...state, isAboutOpen: false
    }),
  }, preloadedState)
