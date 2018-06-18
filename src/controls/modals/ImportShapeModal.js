import React, { Component } from 'react'
import ReactModal from 'react-modal'

export default class SaveShapeModal extends Component {
  constructor(props) {
    super(props)
    this.handleShowModal = this.handleShowModal.bind(this)
    this.importShape = this.importShape.bind(this)
  }

  handleShowModal() {
    this.props.handleShowModal()
  }

  importShape(event) {
    event.preventDefault()
    this.props.importShape(this.shapeImportInput.value)
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
            base: 'modal import-shape-modal',
            afterOpen: 'modal-opened',
            beforeClose: 'modal-closed'
        }}>
          <h2>Import a custom shape</h2>
          <form onSubmit={this.importShape}>
            <p>Paste the shape export string below.</p>
            <input className="input-style"
              type="text"
              placeholder="Paste shape export string here"
              ref={input => this.shapeImportInput = input} />
            <input type="submit" className="input-style small-cta" value="Import shape" />
          </form>
          <button className="input-style small-cta" onClick={this.handleShowModal}>Close</button>
        </ReactModal>
      </div>
    )
  }
}
