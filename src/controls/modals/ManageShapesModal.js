import React, { Component } from 'react'
import ReactModal from 'react-modal'
import shapesHandler from '../../shapesHandler'
import config from '../../config/configHandler'
import notif from '../../notifications'
import colorThemes from '../../config/colorThemes'
import IconPlay from '../../media/icon-play.svg'
import IconCross from '../../media/icon-cross.svg'
import IconLink from '../../media/icon-link.svg'

export default class ManageShapesModal extends Component {
  constructor(props) {
    super(props)
    this.state = { displayLinkToCopy: false }
    this.handleShowModal = this.handleShowModal.bind(this)
    this.deleteShape = this.deleteShape.bind(this)
    this.loadShape = this.loadShape.bind(this)
    this.copyShapeExportString = this.copyShapeExportString.bind(this)
    this.modalStyle = config.get().modalStyle
  }

  handleShowModal() {
    this.props.handleShowModal()
  }

  deleteShape(shapeName, event) {
    event.preventDefault()
    this.props.deleteShape(shapeName)
  }

  loadShape(shapeName, event) {
    event.preventDefault()
    notif.shapeSuccessfullyLoaded()
    this.props.loadShape('custom', shapeName)
  }

  copyShapeExportString(exportString, event) {
    event.preventDefault()
    this.setState({ displayLinkToCopy: exportString },
      () => {
        this.inputLink.select()
        try {
          document.execCommand('copy')
          notif.shapeLinkCopied()
        } catch(error) {notif.shapeLinkNotCopied(error)}
        this.setState({ displayLinkToCopy: false })
      }
    )
  }

  render() {
    const customShapes = shapesHandler.getCustomShapes()
    const shapesNames = Object.keys(customShapes)
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
          <h2>Manage your custom shapes</h2>
          <ul className="shapes-list">
            {shapesNames.map((shapeName, i) => {
              return (
                <li key={i}>
                  <h6 className="shape-name">
                    {shapeName}
                    <span className="shape-size">
                      {`[${customShapes[shapeName].shapeSize[0]}, ${customShapes[shapeName].shapeSize[1]}]`}
                    </span>
                  </h6>
                  <div className="actions-wrapper">
                    <a href="#delete-shape"
                       className="action-icon"
                       alt="Cross icon"
                       title="Delete the shape."
                       onClick={this.deleteShape.bind(this, shapeName)}>
                      <IconCross fill={colorThemes[this.props.colorTheme].footerText} />
                    </a>

                    <a href="#load-shape"
                       className="action-icon"
                       alt="Load icon"
                       title="Load the shape."
                       onClick={this.loadShape.bind(this, shapeName)}>
                      <IconPlay fill={colorThemes[this.props.colorTheme].footerText} />
                    </a>

                    <a href="#copy-link"
                       className="action-icon"
                       alt="Link icon"
                       title="Copy the URL of the shape in your clipboard to share it."
                       onClick={this.copyShapeExportString.bind(this, customShapes[shapeName].exportString)}>
                      <IconLink fill={colorThemes[this.props.colorTheme].footerText} />
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>

          { // Temporary input to select shape link and copy it programmatically
            this.state.displayLinkToCopy ?
              <input type="text" readOnly="true" value={this.state.displayLinkToCopy}
                ref={(inputLink) => {this.inputLink = inputLink}} />
              : ''
          }

          <button className="input-style small-cta" onClick={this.handleShowModal}>Close</button>
        </ReactModal>
      </div>
    )
  }
}
