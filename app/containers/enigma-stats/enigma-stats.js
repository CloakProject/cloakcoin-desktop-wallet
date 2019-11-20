/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import EnigmaActivityList from '~/components/enigma-stats/EnigmaActivityList'
import { CloakingInfo, EnigmaStatsActions } from '~/reducers/enigma-stats/enigma-stats.reducer'
import RpcPolling from '~/components/rpc-polling/rpc-polling'
import styles from './enigma-stats.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import enigmaImg from '~/assets/images/main/enigmastats/enigma.png';


const cloakingInfoPollingInterval = 30.0

type Props = {
  t: any,
  cloakingInfo?: CloakingInfo
}

/**
 * @class EnigmaStats
 * @extends {Component<Props>}
 */
class EnigmaStats extends Component<Props> {
	props: Props
	/**
	 * @memberof EnigmaState
	 */

	render() {
    const { t, cloakingInfo } = this.props
    
		const stats = [
			{ label: t('Requests accepted'), value: cloakingInfo.accepted },
			{ label: t('Requests refused'), value: cloakingInfo.refused },
			{ label: t('Requests completed'), value: cloakingInfo.completed },
			{ label: t('Requests signed'), value: cloakingInfo.signed },
			{ label: t('Requests expired'), value: cloakingInfo.expired },
			{ label: t('Fees received (CLOAK)'), value: cloakingInfo.earning.toString() },
    ]
    
		return (
			<div className={[styles.enigmaStatsContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

        <RpcPolling
          interval={cloakingInfoPollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: EnigmaStatsActions.getCloakingInfo,
            success: EnigmaStatsActions.gotCloakingInfo,
            failure: EnigmaStatsActions.getCloakingInfoFailure
          }}
        />

				<div className={styles.enigmaStatsWrapper}>
					<div className={styles.leftSide}>
						<img className={styles.statusImg} src={enigmaImg} alt="img" />
						<p>{t('ENIGMA STATS')}</p>
						<p>{t('ENIGMA Cloaking andreceive activitythis session')}</p>
					</div>
					<div className={styles.rightSide}>
						<div className={styles.enigmaInfo}>
							{
								stats.map((item, index) => (
                  <div className={index !== 5 ? styles.borderLine : ''} key={item.label}>
                    <p>{item.label}</p>
                    <p>{item.value}</p>
                  </div>
                ))
							}
						</div>
					</div>
				</div>
				<div className={styles.enigmaActivityListWrapper}>
					<p>{t('Enigma send activity. Failed sends will be cleared when the wallet is closed')}</p>
          <EnigmaActivityList />
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
  cloakingInfo: state.enigmaStats.cloakingInfo
})

export default connect(mapStateToProps, null)(translate('enigma-stats')(EnigmaStats))
