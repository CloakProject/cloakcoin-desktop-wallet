import React from 'react'
import CopyButton from './CopyButton'
import RoundedInput from './NewRoundedInput'


export default class RoundedInputWithCopy extends RoundedInput {
  renderAddon() {
    return (
      <CopyButton valueToCopy={this.state.value} />
    )
  }
}
