/* eslint-disable no-unused-vars */
// @flow
import { remote, shell } from 'electron'
import { tap, mapTo } from 'rxjs/operators'
import { of, merge } from 'rxjs'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { i18n, translate } from '~/i18next.config'
import path from 'path'
import { getAppDataPath } from '../../utils/os'
import { Action } from '../types'
import { DebugActions } from './debug.reducer'
import { RpcService } from '~/service/rpc-service'

const t = translate('debug')
const rpc = new RpcService()

const openDebugEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(DebugActions.openDebug),
  tap(() => {
		const mainWindow = remote.getCurrentWindow()
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show()
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
	}),
  mapTo(DebugActions.empty())
)

const openNodeLogFileEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(DebugActions.openNodeLogFile),
  tap(() => {
    const appDataPath = getAppDataPath()
    const logPath = path.join(appDataPath, 'node.log')
    shell.openItem(logPath)
  }),
  mapTo(DebugActions.empty())
)

const requestCommandEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(DebugActions.requestCommand),
  tap((action) => rpc.runCommand(action.payload.command)),
  mapTo(DebugActions.empty())
)

export const DebugEpics = (action$, state$) => merge(
  openDebugEpic(action$, state$),
  openNodeLogFileEpic(action$, state$),
  requestCommandEpic(action$, state$)
)
