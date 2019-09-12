// @flow
import { tap, mapTo } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'

import { OwnAddressesActions } from './own-addresses.reducer'
import { Action } from '../types'
import { RpcService } from '~/service/rpc-service'

const rpc = new RpcService()

const getOwnAddressesEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.getOwnAddresses),
  tap(() => { rpc.requestOwnAddresses() }),
  mapTo(OwnAddressesActions.empty())
)

const createAddressEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.createAddress),
  tap((action) => { rpc.createNewAddress(action.payload.isStealth) }),
  mapTo(OwnAddressesActions.empty())
)


export const OwnAddressesEpics = (action$, state$) => merge(
  getOwnAddressesEpic(action$, state$),
  createAddressEpic(action$, state$)
)
