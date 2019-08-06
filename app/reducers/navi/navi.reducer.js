// @flow
import { Action } from '../types'

export type NaviState = {
	currentNaviPath: string
}

const NaviActionTypePrefix = 'NAVI_ACTION'

export const NaviActions = {
	EMPTY: `${NaviActionTypePrefix}: EMPTY`,

	NAVI_TO_PATH_SUCCESS: `${NaviActionTypePrefix}: NAVI_TO_PATH_SUCCESS`,

	MAIN_WINDOW_CLOSE: `${NaviActionTypePrefix}: MAIN_WINDOW_CLOSE`,
	MAIN_WINDOW_MINIMIZE: `${NaviActionTypePrefix}: MAIN_WINDOW_MINIMIZE`,
	MAIN_WINDOW_MAXIMIZE: `${NaviActionTypePrefix}: MAIN_WINDOW_MAXIMIZE`,

	naviToPathSuccess: (naviPath: string): Action => ({ type: NaviActions.NAVI_TO_PATH_SUCCESS, payload: naviPath }),

	mainWindowClose: (): Action => ({ type: NaviActions.MAIN_WINDOW_CLOSE }),
	mainWindowMinimize: (): Action => ({ type: NaviActions.MAIN_WINDOW_MINIMIZE }),
	mainWindowMaximize: (): Action => ({ type: NaviActions.MAIN_WINDOW_MAXIMIZE }),

	empty: (): Action => ({ type: NaviActions.EMPTY })
}

const initState: NaviState = {
	currentNaviPath: '/overview'
}

export const NaviReducer = (state: NaviState = initState, action: Action) => {

	switch (action.type) {
		case NaviActions.NAVI_TO_PATH_SUCCESS:
			return { ...state, currentNaviPath: action.payload }

		default:
			return state
	}
}
