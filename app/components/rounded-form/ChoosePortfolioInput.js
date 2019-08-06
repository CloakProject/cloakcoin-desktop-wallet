// @flow
import { v4 as uuid } from 'uuid'
import cn from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { translate } from '~/i18next.config'
import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import GenericInput, { GenericInputProps } from './GenericInput'

import styles from './ChoosePortfolioInput.scss'


export type ChoosePortfolioInputProps = {
  ...GenericInputProps,
  onCreatePortfolioClick: () => void,
  portfolios: string[],
  popupMenu: object
}

class ChoosePortfolioInput extends GenericInput {
  props: ChoosePortfolioInputProps
  symbols: string[]
  popupMenuId: string

	constructor(props) {
		super(props)
    this.popupMenuId = `popup-menu-${uuid()}`
	}

  renderInput() {
    const selectedPortfolio = this.props.portfolios.find(portfolio => portfolio.id === this.state.value)

    return (
      <div className={styles.portfolioContainer}>
        <div className={styles.portfolio}>
          {selectedPortfolio && selectedPortfolio.name}
          <button
            type="button"
            className={cn('icon', styles.dropdownButton)}
            onClick={() => this.props.popupMenu.show(this.popupMenuId) && false }
          />
        </div>

        <PopupMenu id={this.popupMenuId} className={styles.menu} relative>
          { this.props.portfolios.map(portfolio => (
            <PopupMenuItem key={portfolio.id} onClick={() => this.changeValue(portfolio.id)}>
              {portfolio.name}
            </PopupMenuItem>
          ))}
        </PopupMenu>
      </div>
    )
  }

  renderAddon() {
    return (
      <div className={styles.createButtonContainer}>
        <button
          type="button"
          className={cn('icon', styles.createButton)}
          onClick={this.props.onCreatePortfolioClick}
          onKeyDown={() => false}
        />
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  popupMenu: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(null, mapDispatchToProps)(ChoosePortfolioInput)
