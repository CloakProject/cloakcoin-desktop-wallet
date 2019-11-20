// @flow
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { ConnectedRouter } from 'react-router-redux'
import ReduxToastr from 'react-redux-toastr'

import { i18n } from '~/i18next.config'
import App from './App'


type Props = {
	store: object,
	history: object
}

export default class Root extends Component<Props> {
	render() {
    const state = this.props.store.getState()
    const language = state.options.language === 'default' ? 'en' : state.options.language
    i18n.changeLanguage(language)

		return (
      <Provider store={this.props.store}>
        <I18nextProvider i18n={ i18n }>
          <div style={{ height: '100%' }}>
            <ConnectedRouter history={this.props.history}>
              <App />
            </ConnectedRouter>

            <ReduxToastr
              timeOut={4000}
              position="bottom-right"
              transitionIn="fadeIn"
              transitionOut="fadeOut"
            />
          </div>
        </I18nextProvider>
      </Provider>
		)
	}
}
