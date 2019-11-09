/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable import/no-unresolved */
import moment from 'moment'
import React, { Component } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { translate } from 'react-i18next'
import cn from 'classnames'
import { truncateAmount } from '~/utils/decimal'
import styles from './PriceChart.scss'

// const data = [
//   {
//     name: 'Feb', uv: 4000
//   },
//   {
//     name: 'Mar', uv: 3000
//   },
//   {
//     name: 'Apr', uv: 2000
//   },
//   {
//     name: 'May', uv: 2780
//   },
//   {
//     name: 'Jun', uv: 1890
//   },
//   {
//     name: 'Jul', uv: 2390
//   }
// ];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload[0]) {
    return (
      <div className={cn(styles.customTooltip)}>
        <p className="label">{`$${payload[0].value.toFixed(2)}`}</p>
      </div>
    )
  }

  return null;
};

class CustomizedAxisTick extends React.PureComponent {
  render() {
    const {
      x, y, stroke, payload,
    } = this.props;
    if (!payload || !payload.value) {
      return null;
    }
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666">{payload.value}</text>
      </g>
    )
  }
}

class PriceChart extends Component<Props> {
  props: Props

  constructor(props) {
    super(props);
    this.state = {
      width: 460,
      height: 200
    }
  }

  componentWillMount() {
    window.addEventListener("resize", this.updateDimensions)
    this.updateDimensions()
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions)
  }

  updateDimensions = e => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.setState({ width: (w - 120) / 2, height: (h - 550) })

    if (e) {
      this.setState({ width: (e.target.innerWidth - 120) / 2, height: (e.target.innerHeight - 550) })
    }
  }

  getLatestPriceInBtc() {
    return (typeof this.props.price === 'number') ?
              this.props.price :
              `~`
  }

  getLatestPriceInUsd() {
    return (Array.isArray(this.props.prices) && this.props.prices.length > 0) ?
              truncateAmount(this.props.prices[this.props.prices.length - 1].price) :
              `~`
  }

  getPriceChartData() {
    const prices = []
    const months = []
    if (Array.isArray(this.props.prices)) {
      for (let i = 0; i < this.props.prices.length; i+=1 ) {
        const month = moment(this.props.prices[i].time).format('MMM')
        let price
        if (!months.includes(month)) {
          months.push(month);
          price = { name: month, price: this.props.prices[i].price || 0 };
        } 
        else {
          price = { name: null, price: this.props.prices[i].price || 0 };
        }
        prices.push(price)
      }
    }
    return prices;
  }
  
	render() {
    const { t } = this.props

		return (
      <div className={cn(styles.chartContainer)}>
        <div className={cn(styles.chartTitle)} >
          <div>{t(`Exchange`)}</div>
          <div className={cn(styles.currecyValue)}>
            <span className={cn(styles.btc)}>{this.getLatestPriceInBtc()} BTC</span>
            <span className={cn(styles.usd)}>${this.getLatestPriceInUsd()}</span>
          </div>
        </div>
        <div className={cn(styles.priceChart)}>
          <AreaChart
            className={cn(styles.chartWrapper)}
            width={this.state.width}
            height={this.state.height}
            data={this.getPriceChartData()}
            margin={{
              top: 0, right: 0, left: 0, bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="1">
                <stop offset="5%" stopColor="#1e2f3e" stopOpacity={1}/>
                <stop offset="95%" stopColor="#385234" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} tick={<CustomizedAxisTick />} />
            <YAxis orientation="right" axisLine={false} />
            <Tooltip content={<CustomTooltip />} isAnimationActive={false} position={{y: -35}} />
            <Area type="monotone" dataKey="price" stroke="false" fillOpacity={0.8} fill="url(#colorUv)" />
          </AreaChart>
        </div>
      </div>
		)
	}
}

export default translate('overview')(PriceChart)
