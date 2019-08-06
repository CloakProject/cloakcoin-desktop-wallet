// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type ValidationErrors = {
  [string]: string
}

export type RoundedFormRoot = {
  fields: { [string]: any },
  errors: ValidationErrors,
  isValid: boolean
}

export type RoundedFormState = { [string]: RoundedFormRoot }

export const RoundedFormActions = createActions(
	{
    CLEAR: (formId: string) => ({ formId }),
    UPDATE_FIELDS: (formId: string, fields: object, isValid: boolean = true) => ({ formId, fields, isValid }),
    UPDATE_FIELD: (formId: string, field: string, value: any) => ({ formId, field, value }),
    UPDATE_ERRORS: (formId: string, errors: ValidationErrors, isValid: boolean) => ({ formId, errors, isValid })
  },
	{
		prefix: 'APP/ROUNDED_FORM'
	}
)

export const RoundedFormReducer = handleActions({
  [RoundedFormActions.clear]: (state, action) => {
    const newState = {...state}
    const { formId } = action.payload
    if (formId in newState) {
      delete newState[formId]
    }
    return newState
  },
  [RoundedFormActions.updateFields]: (state, action) => ({
    ...state,
    [action.payload.formId]: {
      fields: action.payload.fields,
      errors: {},
      isValid: action.payload.isValid
    }
  }),
  [RoundedFormActions.updateField]: (state, action) => ({
    ...state,
    [action.payload.formId]: {
      ...state[action.payload.formId],
      fields: {
        ...state[action.payload.formId].fields,
        [action.payload.field]: action.payload.value
      }
    }
  }),
  [RoundedFormActions.updateErrors]: (state, action) => ({
    ...state,
    [action.payload.formId]: {
      ...state[action.payload.formId],
      errors: action.payload.errors,
      isValid: action.payload.isValid
    }
  })
}, preloadedState)
