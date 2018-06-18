import React, { Component } from 'react'
import '../css/controls/ControlButton.css'
import IconPlay from '../media/icon-play.svg'
import IconPause from '../media/icon-pause.svg'
import IconReset from '../media/icon-reset.svg'
import IconRightArrow from '../media/icon-right-arrow.svg'

export default class ControlButton extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange() {this.props.handleChange()}

  render() {
    return (
      <button className={this.props.className}
              alt={this.props.alt}
              title={this.props.title}
              onClick={this.handleChange}>

        {this.props.type === 'play' ?
          <IconPlay className="icon" width={9} height={9} fill={this.props.color} />
        : ''}

        {this.props.type === 'pause' ?
          <IconPause className="icon" width={9} height={9} fill={this.props.color} />
        : ''}

        {this.props.type === 'reset' ?
          <IconReset className="icon" width={11} height={11} fill={this.props.color} />
        : ''}

        {this.props.type === 'options' ?
          <IconRightArrow className="icon" width={9} height={9} fill={this.props.color} />
        : ''}

        {this.props.buttonLabel}
      </button>
    )
  }
}
