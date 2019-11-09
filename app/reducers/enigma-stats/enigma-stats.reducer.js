// @flow
import { createActions, handleActions } from 'redux-actions'
import { Decimal } from 'decimal.js'
import { preloadedState } from '../preloaded.state'

export type CloakingInfo = {
	accepted: number,
  signed: number,
  refused: number,
  expired: number,
  completed: number,
  earning: Decimal
}

export type CloakingRequest = {
	version: number,
  initiator: string,
  timeInitiated: number,
  amount: Decimal,
  participantsRequired: number,
  txid: string,
  mine: boolean,
  timeBroadcasted: number,
  expiresInMs: nubmer,
  aborted: boolean,
  autoRetry: boolean,
  retryCount: number,
  participants: Array<string>,
  signers: Array<string>
}

export type EnigmaStatsState = {
  cloakingInfo?: CloakingInfo,
  cloakingRequests?: Array<CloakingRequest>,
  sortedHeader: string,
  isDescending: boolean
}

export const EnigmaStatsActions = createActions(
  {
    EMPTY: undefined,

    GET_CLOAKING_INFO: undefined,
    GOT_CLOAKING_INFO: (cloakingInfo: CloakingInfo) => ({ cloakingInfo }),
    GET_CLOAKING_INFO_FAILURE:  (errorMessage: string) => ({ errorMessage }),

    GET_CLOAKING_REQUESTS: undefined,
    GOT_CLOAKING_REQUESTS: (cloakingRequests: Array<CloakingRequest>) => ({ cloakingRequests }),
    GET_CLOAKING_REQUESTS_FAILURE:  (errorMessage: string) => ({ errorMessage }),

    SORT_CLOAKING_REQUESTS: (header: string, isDescending: boolean) => ({ header, isDescending }),
  },
  {
    prefix: 'APP/ENIGMA_STATS'
  }
)

export const EnigmaStatsReducer = handleActions(
  {
    [EnigmaStatsActions.gotCloakingInfo]: (state, action) => ({
      ...state, cloakingInfo: action.payload.cloakingInfo
    }),
    [EnigmaStatsActions.getCloakingInfoFailure]: state => ({
      ...state, cloakingInfo: {accepted: 0, signed: 0, refused: 0, expired: 0, completed: 0, earning: Decimal(0)}
    }),

    [EnigmaStatsActions.gotCloakingRequests]: (state, action) => ({
      ...state, cloakingRequests: action.payload.cloakingRequests
    }),
    [EnigmaStatsActions.getCloakingRequestsFailure]: state => ({
      ...state, cloakingRequests: []
    }),

    [EnigmaStatsActions.sortCloakingRequests]: (state, action) => ({
      ...state,
      sortedHeader: action.payload.header,
      isDescending: action.payload.isDescending
    })
  }, preloadedState)
