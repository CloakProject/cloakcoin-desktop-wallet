// @flow
import { tap, mapTo } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'

import { EnigmaStatsActions } from './enigma-stats.reducer'
import { Action } from '../types'
import { RpcService } from '~/service/rpc-service'

const rpc = new RpcService()

const getCloakingInfoEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(EnigmaStatsActions.getCloakingInfo),
  tap(() => { rpc.requestCloakingInfo() }),
  mapTo(EnigmaStatsActions.empty())
)

const getCloakingRequestsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(EnigmaStatsActions.getCloakingRequests),
  tap(() => { rpc.requestCloakingRequests() }),
  mapTo(EnigmaStatsActions.empty())
)

export const EnigmaStatsEpics = (action$, state$) => merge(
  getCloakingInfoEpic(action$, state$),
  getCloakingRequestsEpic(action$, state$)
)
