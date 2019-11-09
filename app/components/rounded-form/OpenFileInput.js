import { remote } from 'electron'
import cn from 'classnames'
import React from 'react'
import RoundedInput, { RoundedInputProps } from './RoundedInput'

import parentStyles from './RoundedInput.scss'
import styles from './OpenFileInput.scss'


export type OpenFileInputProps = {
  ...RoundedInputProps,
	name: string,
  defaultValue?: string,
  options?: {
    title?: string,
    defaultPath?: string,
    message?: string,
    filters?: string[]
  }

}

export default class OpenFileInput extends RoundedInput {
  props: OpenFileInputProps

  onOpenFileClick(event) {
    event.stopPropagation()

    const options = this.props.options || {}

    const callback = filePaths => {
      if (filePaths && filePaths.length) {
        const value = filePaths.pop()
        this.changeValue(value)
      }
    }

    remote.dialog.showOpenDialog({
      title: options.title,
      defaultPath: options.defaultPath || remote.app.getPath('documents'),
      message: options.message || options.title,
      filters: options.filters
    }, callback)

    return false
  }

  renderInput() {
    return (
      <input
        className={parentStyles.input}
        name={this.props.name}
        type="text"
        value={this.state.value}
        disabled={this.props.disabled}
        onChange={event => this.onChangeHandler(event)}
        readOnly
      />
    )
  }

  renderAddon() {
    return (
      <div
        onClick={e => this.onOpenFileClick(e)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        className={cn('icon', styles.icon)}
      />
    )
  }
}
