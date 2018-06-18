import React, { Component } from 'react'
import ReactModal from 'react-modal'

export default class SaveShapeModal extends Component {
  constructor(props) {
    super(props)
    this.handleShowModal = this.handleShowModal.bind(this)
    this.saveShape = this.saveShape.bind(this)
    this.selectLink = this.selectLink.bind(this)
  }

  handleShowModal() {
    this.props.handleShowModal()
  }

  saveShape(event) {
    event.preventDefault()
    this.props.saveShape(this.shapeNameInput.value)
  }

  selectLink(event) {
    this.shapeNameLink.setSelectionRange(0, this.shapeNameLink.value.length)
  }

  render() {
    return (
      <div>
        <ReactModal 
          isOpen={this.props.showModal}
          contentLabel="onRequestClose Example"
          onRequestClose={this.handleShowModal}
          style={this.props.modalStyle}
          className={{
            base: 'modal',
            afterOpen: 'modal-opened',
            beforeClose: 'modal-closed'
        }}>
          <h2>Save & share your shape</h2>
          { // Display save shape form if not saved yet
          !this.props.activeShape.name ?
            <form onSubmit={this.saveShape}>
              <p>To save your shape,<br/>you need to give it a name.</p>
              <input className="input-style"
                type="text"
                placeholder="Shape name"
                maxLength={30}
                ref={input => this.shapeNameInput = input}
                />
              <input type="submit" className="input-style small-cta" value="Save shape" />
            </form>
          : // Display saved notif and shape export string in a read-only input
            <div>
              <p className="green-notification">✓ Custom shape saved</p>
              <p>Share this shape by sending the shape export string below:</p>
              <input className="input-style share-link-input"
                type="text"
                readOnly="true"
                ref={input => this.shapeNameLink = input}
                onClick={this.selectLink}
                value={this.props.activeShape.exportString} />
            </div>
          }
          <button className="input-style small-cta" onClick={this.handleShowModal}>Close</button>
        </ReactModal>
      </div>
    )
  }
}
