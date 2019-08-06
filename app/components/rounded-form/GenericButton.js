import GenericControl, { GenericProps } from './GenericControl'


export type GenericButtonProps = {
  ...GenericProps,
  onClick?: () => boolean
}

export default class GenericButton extends GenericControl {
  props: GenericButtonProps

  onClickHandler(event) {
    event.stopPropagation()
    if (this.props.onClick) {
      this.props.onClick(event)
    }
    return false
  }

}

