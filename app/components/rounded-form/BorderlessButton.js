import React from 'react'
import cn from 'classnames'

import GenericButton, { GenericButtonProps } from './GenericButton'

import styles from './BorderlessButton.scss'


export type BorderlessButtonProps = {
  ...GenericButtonProps,
  glyphClassName?: string
}

export default class BorderlessButton extends GenericButton {
  props: BorderlessButtonProps
  customGlyphClassName = null

  renderCaption() {
    return null
  }

  renderControl() {
    return (
      <div
        className={cn(styles.button, this.props.className)}
        onClick={e => this.onClickHandler(e)}
        onKeyDown={e => [13, 32].includes(e.keyCode) ? this.onClickHandler(e) : false}
        role="button"
        tabIndex={0}
      >
        {(this.props.glyphClassName || this.customGlyphClassName) &&
          <div className={cn(
            'icon',
            this.customGlyphClassName,
            this.props.glyphClassName
          )} />

        }
        <div>
          {this.props.children && this.props.children}
          {this.renderCaption()}
        </div>
      </div>
    )
  }
}

