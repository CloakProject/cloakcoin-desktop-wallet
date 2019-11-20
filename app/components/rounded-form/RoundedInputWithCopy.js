import React from 'react'
import CopyButton from './CopyButton'
import RoundedInput from './RoundedInput'
import { translate } from '~/i18next.config'
import copyImg from '~/assets/images/main/paste.png'

const t = translate('other')

export default class RoundedInputWithCopy extends RoundedInput {
  renderAddon() {
    return (
      <CopyButton valueToCopy={this.state.value}>
        <img src={copyImg} alt={t(`Copy`)}/>
      </CopyButton>
    )
  }
}
