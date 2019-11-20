// @flow
import React from 'react'
import { ipcRenderer } from 'electron'
import { Observable, merge } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { getStore } from '~/store/configureStore'
import { SettingsActions } from '~/reducers/settings/settings.reducer'
import { FetchLdbService } from '~/service/fetch-ldb-service'
import { FetchLdbActions } from './fetch-ldb.reducer'
import syncImg from '~/assets/images/about/sync.png';


const t = translate('other')
const fetchLdb = new FetchLdbService()


const fetchEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(FetchLdbActions.fetch),
  map(() => {
    fetchLdb.bindRendererHandlersAndFetch(getStore().dispatch, FetchLdbActions)
    return FetchLdbActions.empty()
  })
)

const fetchPromptEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(FetchLdbActions.fetchPrompt),
  switchMap(() => {
    const message = t(`Can't find the blockchain files. Would you like to download them?`)

    const confirmObservable = Observable.create(observer => {
      const confirmOptions = {
        component: () => (
          <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
            <img src={syncImg} alt="sync" style={{padding: '10px', height: '100px', opacity: '0.3'}} />
            <div style={{padding: '8px'}}>{message}</div>
          </div>
        ),
        okText: t(`Yes`),
        cancelText: t(`No`),
        onOk: () => {
          observer.next(FetchLdbActions.fetch())
          observer.complete()
        },
        onCancel: () => {
          observer.next(FetchLdbActions.downloadComplete())
          observer.complete()
        }
      }

      toastr.confirm(``, confirmOptions)
    })

    return confirmObservable
  })
)

const downloadCompleteEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(FetchLdbActions.downloadComplete),
  map(() => (
    state$.value.getStarted.isInProgress ? FetchLdbActions.empty() : SettingsActions.kickOffChildProcesses()
  ))
)

const downloadFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(FetchLdbActions.downloadFailed),
  switchMap(() => {
    const title = t(`Ldb download failed`)
    const message = t(`Check your network connection and hit Retry`)

    const confirmObservable = Observable.create(observer => {
      const confirmOptions = {
        okText: t(`Retry`),
        cancelText: t(`Quit app`),
        onOk: () => {
          observer.next(FetchLdbActions.fetch())
          observer.complete()
        },
        onCancel: () => {
          ipcRenderer.send('force-quit')
          observer.next(FetchLdbActions.empty())
          observer.complete()
        }
      }

      toastr.confirm(`${title}. ${message}`, confirmOptions)
    })

    return confirmObservable
  })
)

const extractFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(FetchLdbActions.extractFailed),
  switchMap(() => {
    const title = t(`Ldb extract failed`)
    const message = t(`Check disk free space and hit Retry`)

    const confirmObservable = Observable.create(observer => {
      const confirmOptions = {
        okText: t(`Retry`),
        cancelText: t(`Quit app`),
        onOk: () => {
          observer.next(FetchLdbActions.fetch())
          observer.complete()
        },
        onCancel: () => {
          ipcRenderer.send('force-quit')
          observer.next(FetchLdbActions.empty())
          observer.complete()
        }
      }

      toastr.confirm(`${title}. ${message}`, confirmOptions)
    })

    return confirmObservable
  })
)

export const FetchLdbEpic = (action$, state$) => merge(
  fetchEpic(action$, state$),
  fetchPromptEpic(action$, state$),
  downloadCompleteEpic(action$, state$),
  downloadFailedEpic(action$, state$),
  extractFailedEpic(action$, state$),
)
