import React, { Component } from 'react'

export default class Checkbox extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    this.props.handleChange(event)
  }

  render() {
    return (
      <div className="checkbox-wrapper">
        <input type="checkbox"
               id={this.props.id}
               onChange={this.handleChange}
               disabled={this.props.isDisabled}
               checked={this.props.isChecked} />
        <label htmlFor={this.props.id} title={this.props.title ? this.props.title : ''}>
          <span className="checkbox-icon"></span>
          <span className="label-text">{this.props.label}</span>
        </label>
      </div>
    )
  }
}
