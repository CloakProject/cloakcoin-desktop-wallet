// @flow
import { remote } from 'electron'
import { Observable, merge } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { getStore } from '~/store/configureStore'
import { SettingsActions } from '~/reducers/settings/settings.reducer'
import { FetchLdbService } from '~/service/fetch-ldb-service'
import { FetchLdbActions } from './fetch-ldb.reducer'


const t = translate('other')
const fetchLdb = new FetchLdbService()


const fetchEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(FetchLdbActions.fetch),
  map(() => {
    fetchLdb.bindRendererHandlersAndFetch(getStore().dispatch, FetchLdbActions)
    return FetchLdbActions.empty()
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
          remote.getCurrentWindow().close()
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
  downloadCompleteEpic(action$, state$),
  downloadFailedEpic(action$, state$),
)
