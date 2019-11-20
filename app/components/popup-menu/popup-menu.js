// @flow
import { remote } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import cn from 'classnames'

import { PopupMenuState, PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'

import styles from './popup-menu.scss'

type Props = {
  id: string,
  className?: string,
  relative?: boolean,
  popupMenu: PopupMenuState,
  actions: object
}

class PopupMenu extends Component<Props> {
	props: Props

  static propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
  }

	/**
	 * @memberof PopupMenu
	 */
	componentDidMount() {
    document.addEventListener('mousedown', e => this.handleOutsideClick(e))
  }

	/**
	 * @memberof PopupMenu
	 */
	componentWillUnmount() {
    document.removeEventListener('mousedown', e => this.handleOutsideClick(e))
	}

  handleOutsideClick(event) {
    if (!this.element) {
      return
    }

    const props = this.props.popupMenu[this.props.id]

    // TODO: figure out why Node.contains() doesn't work as expected
    if (props && props.isVisible && !this.element.innerHTML.includes(event.target.outerHTML)) {
      this.props.actions.hide(this.props.id)
    }
  }

	/**
	 * @memberof PopupMenu
	 */
  elementRef(element) {
    this.element = element
  }

	/**
	 * @memberof PopupMenu
	 */
  renderChildren() {
    const props = this.props.popupMenu[this.props.id]

    return React.Children.map(this.props.children, child => child && React.cloneElement(child, {
      id: this.props.id,
      data: props.data
    }))
  }

  getCoords(props) {
    const approximateWidthInPixels = 192
    const { top, left } = props
    let transform = {}

    const bounds = (
      remote
      .getCurrentWindow()
      .webContents
      .getOwnerBrowserWindow()
      .getBounds()
    )

    if (left + approximateWidthInPixels > bounds.width) {
      transform = { transform: 'translateX(-100%)' }
    }

    return { ...transform, left, top }
  }

	/**
	 * @memberof PopupMenu
	 */
	render() {
    const props = this.props.popupMenu[this.props.id]

    if (!props) {
      return null
    }

		const containerStyles = {
			display: props.isVisible ? 'block' : 'none'
		}

    if (this.props.relative) {
      Object.assign(containerStyles, {
        left: '100%',
        transform: 'translateX(-100%)',
      })
    } else {
      Object.assign(containerStyles, {
        position: 'fixed',
        transform: 'none'
      }, this.getCoords(props))
    }

		return (
			<div
				className={cn(styles.container, this.props.className)}
				style={containerStyles}
        ref={el => this.elementRef(el)}
			>
        <div className={styles.menu}>
          {this.renderChildren()}
        </div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	popupMenu: state.popupMenu,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(PopupMenu)
