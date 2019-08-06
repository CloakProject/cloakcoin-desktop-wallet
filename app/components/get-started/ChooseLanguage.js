// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import Flag from 'react-world-flags'
import Iso6391 from 'iso-639-1'

import { availableLanguages } from '~/i18next.config'

import eoFlag from '~/assets/images/eo.svg'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './ChooseLanguage.scss'

type Props = {
  actions: object
}

const getCountryFromLanguage = code => ({
  en: 'usa',
  ko: 'kor',
})[code] || code


/**
 * @class ChooseLanguage
 * @extends {Component<Props>}
 */
export class ChooseLanguage extends Component<Props> {
	props: Props

	/**
	 * @returns {Array}
   * @memberof ChooseLanguage
	 */
  getLanguageTiles() {
    const languages = Iso6391.getLanguages(availableLanguages)
    return languages.map((language, index) => (
      <div
        role="button"
        tabIndex={index}
        key={language.code}
        className={cn(styles.tile)}
        onClick={() => this.props.actions.chooseLanguage(language.code)}
        onKeyDown={() => this.props.actions.chooseLanguage(language.code)}
      >
        <div className={cn(styles.flag, styles[language.code])}>
          <Flag code={getCountryFromLanguage(language.code)} fallback={ <img src={eoFlag} alt="eo" />} />
        </div>

        {language.nativeName}
      </div>
    ))
  }

	/**
	 * @returns
   * @memberof ChooseLanguage
	 */
	render() {
		return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={cn(styles.innerContainer, styles.languageTiles)}>
        {this.getLanguageTiles()}
        </div>
      </div>
    )
  }
}
