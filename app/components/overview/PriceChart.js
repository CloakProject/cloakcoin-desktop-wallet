/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable import/no-unresolved */
import React, { Component } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { translate } from 'react-i18next'
import cn from 'classnames'
import styles from './PriceChart.scss'

const data = [
  {
    name: 'Feb', uv: 4000
  },
  {
    name: 'Mar', uv: 3000
  },
  {
    name: 'Apr', uv: 2000
  },
  {
    name: 'May', uv: 2780
  },
  {
    name: 'Jun', uv: 1890
  },
  {
    name: 'Jul', uv: 2390
  }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active) {
    return (
      <div className={cn(styles.customTooltip)}>
        <p className="label">{`$${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

class PriceChart extends Component<Props> {
  props: Props
  constructor(props) {
    super(props);
    this.state = {
      width: 460,
      height: 200,
    }
  }

  componentWillMount() {
      this.updateDimensions();
  }

  componentDidMount() {
      window.addEventListener("resize", e => this.updateDimensions(e));
  }

  updateDimensions = e => {
    if (e) {
      this.setState({ width: (e.target.innerWidth - 120) / 2, height: (e.target.innerHeight - 550) })
    }
  }
  
	render() {
    // const { t } = this.props
		return (
      <div className={cn(styles.priceChart)}>
        <AreaChart
          className={cn(styles.chartWrapper)}
          width={this.state.width}
          height={this.state.height}
          data={data}
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
          <XAxis dataKey="name" axisLine={false} />
          <YAxis orientation="right" tickCount={4} axisLine={false} />
          <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          <Area type="monotone" dataKey="uv" stroke="false" fillOpacity={0.8} fill="url(#colorUv)" />
        </AreaChart>
      </div>
		)
	}
}

export default translate('overview')(PriceChart)
