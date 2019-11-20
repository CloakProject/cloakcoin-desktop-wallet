import * as Joi from 'joi'
import { take, mergeMap } from 'rxjs/operators'
import { of, concat } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'

import { translate } from '~/i18next.config'
import { AUTH } from '~/constants/auth'
import { AuthActions } from '~/reducers/auth/auth.reducer'


const t = translate('auth')

function getEnsureLoginObservable(reason: string | null, next: Observable, action$: ActionsObservable<Action>) {
  const loginSucceeded: Observable = action$.pipe(
    ofType(AuthActions.loginSucceeded),
    take(1),
    mergeMap(() => next)
  )

  return concat(of(AuthActions.ensureLogin(reason)), loginSucceeded)
}

function getPasswordValidationSchema(label?: string) {
  const schema = (
    Joi.string().required()
    .min(3)
    .max(128)
    .regex(new RegExp(`^[${AUTH.unicodeLetters}\\d !@#$%^&*;,:'"]{3,128}$`, 'u'))
    .error(() => t(`should contain letters, numbers and special characters, passphrases are supported too`))
    .label(label || t(`Password`))
  )

  return schema
}

export {
  getEnsureLoginObservable,
  getPasswordValidationSchema,
}
