import React from 'react'
import { clipboard } from 'electron'
import cn from 'classnames'

import { translate } from '~/i18next.config'
import RoundedInput from './NewRoundedInput'
import styles from './BorderlessButton.scss'


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
        <div className={cn('icon', styles.icon)} />
        <div>{t(`Paste`)}</div>
      </div>
    )
  }
}
