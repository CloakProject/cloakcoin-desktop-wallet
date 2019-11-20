// @flow
import { merge } from 'rxjs'
import { map } from 'rxjs/operators'
import { ipcRenderer } from 'electron'
import { ofType } from 'redux-observable'
import { push } from 'react-router-redux'

import { Action } from '../types'
import { GetStartedActions } from './get-started.reducer'


const WelcomeActions = GetStartedActions.welcome

const useCloakEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(WelcomeActions.useCloak),
  map(() => {
    ipcRenderer.send('resize')
    return push('/overview')
  })
)

export const GetStartedEpic = (action$, state$) => merge(
  useCloakEpic(action$, state$)
)
