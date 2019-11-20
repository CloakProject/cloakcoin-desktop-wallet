import React from 'react'
import { clipboard } from 'electron'
import cn from 'classnames'

import { translate } from '~/i18next.config'
import RoundedInput from './RoundedInput'
import styles from './BorderlessButton.scss'
import pasteImg from '~/assets/images/main/paste.png'


const t = translate('other')

export default class RoundedInputWithPaste extends RoundedInput {
  renderAddon() {
    return (
      <div
        className={styles.button}
        onClick={() => this.changeValue(clipboard.readText())}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
      >
        <img src={pasteImg} alt={t(`Paste`)}/>
      </div>
    )
  }
}
