import React from 'react'
import cn from 'classnames'

import { translate } from '~/i18next.config'
import GenericButton, { GenericButtonProps } from './GenericButton'

import animatedSpinner from '~/assets/images/animated-spinner.svg'
import styles from './RoundedButton.scss'

const t = translate('other')

export type RoundedButtonProps = {
  ...GenericButtonProps,
  type?: string,
  important?: boolean,
  spinner?: boolean,
  spinnerTooltip?: string,
  glyph?: string
}

export default class RoundedButton extends GenericButton {
  props: RoundedButtonProps

  renderAddon() {
    return null
  }

  renderControl() {
    return (
      // eslint-disable-next-line react/button-has-type
      <button
        type={this.props.type || 'button'}
        className={cn(styles.button, this.props.className, {
          [styles.important]: this.props.important,
          [styles.large]: this.props.large
        })}
        onClick={e => this.onClickHandler(e)}
        onKeyDown={e => [13, 32].includes(e.keyCode) ? this.onClickHandler(e) : false}
        disabled={this.props.disabled}
      >
        {this.props.glyph &&
          <div className={cn('icon', styles.glyph, styles[this.props.glyph])} />
        }

        {this.props.spinner &&
          <img
            className={styles.spinner}
            src={animatedSpinner}
            alt={t(`Loading`)}
            title={this.props.spinnerTooltip}
          />
        }

        {this.props.children && this.props.children}

        {this.renderAddon()}
      </button>
    )
  }
}
