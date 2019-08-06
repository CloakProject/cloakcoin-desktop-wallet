// @flow
import { remote } from 'electron'
import { map, tap } from 'rxjs/operators'
import { merge } from 'rxjs'
import log from 'electron-log'

import { ActionsObservable, ofType } from 'redux-observable'
import { Action } from '../types'
import { NaviActions } from './navi.reducer'

const epicInstanceName = 'NaviEpics'


const naviPathChangedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
    ofType('@@router/LOCATION_CHANGE'),
    tap((action: Action) => log.debug(`${epicInstanceName}: naviPathChangedEpic, pathname: ${action.payload.pathname}`)),
    map((action) => NaviActions.naviToPathSuccess(action.payload.pathname))
)

const mainWindowCloseEpic = (action$: ActionsObservable<Action>) => action$.pipe(
    ofType(NaviActions.MAIN_WINDOW_CLOSE),
    tap(() => setTimeout(() => {
        remote.getCurrentWindow().close()
    }, 100)),
    map(() => NaviActions.empty())
)

const mainWindowMinimizeEpic = (action$: ActionsObservable<Action>) => action$.pipe(
    ofType(NaviActions.MAIN_WINDOW_MINIMIZE),
    tap(() => setTimeout(() => {
        remote.getCurrentWindow().minimize()
    }, 100)),
    map(() => NaviActions.empty())
)

const mainWindowMaximizeEpic = (action$: ActionsObservable<Action>) => action$.pipe(
    ofType(NaviActions.MAIN_WINDOW_MAXIMIZE),
    tap(() => setTimeout(() => {
        const win = remote.getCurrentWindow()

        if (process.platform === 'darwin') {
            win.setFullScreen(!win.isFullScreen())
        } else {
            win.isMaximized() ? win.unmaximize() : win.maximize()
        }
    }, 100)),
    map(() => NaviActions.empty())
)


export const NaviEpics = (action$, state$) => merge(
    naviPathChangedEpic(action$, state$),
    mainWindowCloseEpic(action$, state$),
    mainWindowMinimizeEpic(action$, state$),
    mainWindowMaximizeEpic(action$, state$)
)
