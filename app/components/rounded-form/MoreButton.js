import React from 'react'
import cn from 'classnames'

import GenericButton from './GenericButton'

import styles from './MoreButton.scss'


export default class MoreButton extends GenericButton {
  renderControl() {
    return (
      <div className={cn(styles.more, this.props.className)}>
        <span
          role="none"
          className={styles.button}
          onClick={e => this.onClickHandler(e)}
          onKeyDown={e => [13, 32].includes(e.keyCode) ? this.onClickHandler(e) : false}
          onContextMenu={e => this.onClickHandler(e)}
        />

      </div>
    )
  }
}
