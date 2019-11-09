import { clipboard } from 'electron'
import { toastr } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import BorderlessButton, { BorderlessButtonProps } from './BorderlessButton'

export type CopyButtonProps = {
  ...BorderlessButtonProps,
  valueToCopy: string
}

const t = translate('other')

export default class CopyButton extends BorderlessButton {
  props: CopyButtonProps

  onClickHandler(event) {
    const result = super.onClickHandler(event)
    clipboard.writeText(this.props.valueToCopy)
    toastr.success(t(`Copied to clipboard`))
    return result
  }

}
