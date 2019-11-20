// @flow
/* eslint-disable react/no-unused-state */
import log from 'electron-log'
import React, { Component } from 'react'
import { shell } from 'electron'
import cn from 'classnames'

import { RoundedButton } from '~/components/rounded-form'

import animatedSpinner from '~/assets/images/animated-spinner.svg'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './Simplex.scss'

const paymentsUrl = 'https://payments.cloak.io/wallet.html'

type Props = {
  t: any
}

type State = {
  isInBrowserMode: boolean,
  didFailLoad: boolean
}

/**
 * @class Simplex
 * @extends {Component<Props>}
 */
export class Simplex extends Component<Props> {
	props: Props
  state: State
  webviewElement: any

  constructor(props) {
    super(props)
    this.state = {
      isInBrowserMode: false,
      didFailLoad: false,
    }
  }

  initWebviewRef(element) {
    if (!element) {
      return
    }

    if (this.webviewElement === element) {
      return
    }

    this.webviewElement = element

    this.webviewElement.addEventListener('new-window', event => {
      event.stopPropagation()
      shell.openExternal(event.url)
      return false
    })

    const navigateHandler = event => {
      const isInBrowserMode = event.url !== paymentsUrl
      this.setState({ isInBrowserMode })
    }

    this.webviewElement.addEventListener('will-navigate', navigateHandler)
    this.webviewElement.addEventListener('did-navigate', navigateHandler)

    this.webviewElement.addEventListener('did-fail-load', event => {
      if (event.validatedURL === paymentsUrl) {
        this.setState({ didFailLoad: true })
      }
    })
  }

  getLocationTitle(): string | null {
    if (!this.webviewElement) {
      return null
    }

    const title = this.webviewElement.getTitle()

    if (title.startsWith('http')) {
      return null
    }

    return title
  }

  getIsLoading(): boolean {
    if (!(this.webviewElement && this.webviewElement.getWebContents())) {
      return false
    }

    try {
      return this.webviewElement.isLoading()
    } catch(err) {
      log.error(`Suppressing webview isLoading() call error,`, err)
    }

    return false
  }

	/**
	 * @returns
   * @memberof Simplex
	 */
	render() {
    const { t } = this.props

    const isLoading = this.getIsLoading()

    return (
      <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
        {this.state.isInBrowserMode &&
          <div className={styles.browser}>
            <div className={styles.toolbar}>
              <button
                type="button"
                className={cn('icon', styles.back)}
                onClick={() => this.webviewElement.goBack()}
                disabled={!this.webviewElement.canGoBack()}
              />
              <button
                type="button"
                className={cn('icon', styles.forward)}
                onClick={() => this.webviewElement.goForward()}
                disabled={!this.webviewElement.canGoForward()}
              />
              <button
                type="button"
                className={cn('icon', {[styles.stop]: isLoading, [styles.refresh]: !isLoading})}
                onClick={() => isLoading ? this.webviewElement.stop() : this.webviewElement.reload()}
              />
            </div>

            <div className={styles.addressBar}>
              <div className={cn('icon', styles.lockIcon)} />
              {this.webviewElement.getURL()}
              {isLoading &&
                <img className={styles.spinner} src={animatedSpinner} alt={t(`Loading...`)}/>
              }
            </div>

            <div className={styles.title}>
              {this.getLocationTitle()}
            </div>
          </div>
        }
        {this.state.didFailLoad ? (
          <div className={styles.failLoad}>
            <div className={styles.title}>
              {t(`Loading failed, please check your network connection`)}
            </div>

            <RoundedButton
              className={styles.tryAgainButton}
              onClick={() => this.setState({ didFailLoad: false })}
              important
            >
              {t(`Try again`)}
            </RoundedButton>

          </div>
        ) : (
          <webview
            title={t(`Buy Bitcoin with credit card`)}
            ref={el => this.initWebviewRef(el)}
            className={cn(styles.webview, {[styles.withBrowser]: this.state.isInBrowserMode})}
            src={paymentsUrl}
          />
        )}

      </div>
    )
  }
}

