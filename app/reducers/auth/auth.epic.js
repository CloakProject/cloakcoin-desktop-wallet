// @flow
import log from 'electron-log'
import { of, concat, from, merge } from 'rxjs'
import { catchError, delay, map, switchMap } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { i18n } from '~/i18next.config'
import { AUTH } from '~/constants/auth'
import { RPC } from '~/constants/rpc'
import { RpcService } from '~/service/rpc-service'
import { AuthActions } from './auth.reducer'
import { RoundedFormActions } from '../rounded-form/rounded-form.reducer'

const t = i18n.getFixedT(null, 'other')
const rpc = new RpcService()

const submitPasswordEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(AuthActions.submitPassword),
  switchMap(() => {
    const loginForm = state$.value.roundedForm.authLogin

    const observable = from(rpc.sendWalletPassword(loginForm.fields.password, AUTH.sessionTimeoutSeconds)).pipe(
      switchMap(() => {
        const loginAfterTimeout = of(AuthActions.ensureLogin(t(`The session has expired`), true)).pipe(
          delay((AUTH.sessionTimeoutSeconds - 2) * 1000)
        )

        return concat(
          of(AuthActions.loginSucceeded()),
          of(RoundedFormActions.clear('authLogin')),
          loginAfterTimeout,
        )
      }),
      catchError(err => {
        let errorMessage

        if (err.code === RPC.WALLET_PASSPHRASE_INCORRECT) {
          errorMessage = t(`The wallet password entered was incorrect.`)
        } else {
          log.error(`Authentication error`, err)
          errorMessage = t(`An error has occurred when authenticating, please check the application log for details`)
        }
        return of(AuthActions.loginFailed(errorMessage))
      })
    )
    return observable
  })
)

const loginFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(AuthActions.loginFailed),
  map(action => {
    toastr.error(t(`Login failed`), action.payload.errorMessage)
    return AuthActions.empty()
  })
)

export const AuthEpic = (action$, state$) => merge(
  submitPasswordEpic(action$, state$),
  loginFailedEpic(action$, state$)
)
