import React, { Component } from 'react'

export default class Select extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    this.props.handleChange(event, this.props.type)
  }

  render() {
    return (
      <div className="input-block select-wrapper">
        <label className="input-label">
          <span>{this.props.label}</span>
          <select className="input-style"
                  value={this.props.defaultValue}
                  onChange={this.handleChange}>
            {this.props.options.map((el, index) => {
              return <option key={index}
                             value={el[0]}>{el[1]}</option>
            })}
          </select>
        </label>
      </div>
    )
  }
}
