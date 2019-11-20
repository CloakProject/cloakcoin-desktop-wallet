// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type PopupMenuState = { [string]: any }

export const PopupMenuActions = createActions(
	{
    SHOW: (id, data, top = null, left = null) => ({ id, top, left, data }),
    HIDE: id => ({ id })
  },
	{
		prefix: 'APP/POPUP_MENU'
	}
)

export const PopupMenuReducer = handleActions({
  [PopupMenuActions.show]: (state, action) => ({
    ...state, [action.payload.id]: { ...action.payload, isVisible: true, data: action.payload.data }
  }),
  [PopupMenuActions.hide]: (state, action) => ({
    ...state, [action.payload.id]: { ...state[action.payload.id], isVisible: false }
  })
}, preloadedState)
