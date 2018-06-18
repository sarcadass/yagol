import React, { Component } from 'react'
import utils from '../utils'

export default class Counter extends Component {
  render() {
    let count = utils.formatDigits(this.props.iterationCount)
    let label = this.props.iterationCount > 1 ? ' iterations' : ' iteration'
    return (<div className="info counter">{count + label}</div>)
  }
}
