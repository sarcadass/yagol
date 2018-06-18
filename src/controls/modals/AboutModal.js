import React, { Component } from 'react'
import ReactModal from 'react-modal'

export default class AboutModal extends Component {
  constructor(props) {
    super(props)
    this.handleShowModal = this.handleShowModal.bind(this)
  }

  handleShowModal() {
    this.props.handleShowModal()
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
            base: 'modal modal-about',
            afterOpen: 'modal-opened',
            beforeClose: 'modal-closed'
          }}
        >
          <h2>About this project</h2>
          <p>This project is a <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life" target="_blank" rel="noopener">Conway's Game of Life</a> sandbox game, it is coded with <a href="https://github.com/facebook/create-react-app" target="_blank" rel="noopener">create-react-app</a>.</p>
          <p>I created this project to learn <a href="https://github.com/facebook/react" target="_blank">react</a>, created by <a href="https://twitter.com/Sarcadass" target="_blank" rel="noopener">Benjamin Blonde</a>, MIT License.</p>
          <p>You can find the <a href="https://github.com/sarcadass/yagol" target="_blank" rel="noopener">Github repo here</a>.</p>
          <button className="input-style small-cta" onClick={this.handleShowModal}>Close</button>
        </ReactModal>
      </div>
    )
  }
}
