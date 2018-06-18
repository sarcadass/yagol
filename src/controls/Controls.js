import React, { Component } from 'react'
import ReactModal from 'react-modal'
import ControlButton from './ControlButton'
import Counter from './Counter'
import { Select, Checkbox } from './inputs/index'
import config from '../config/configHandler'
import colorThemes from '../config/colorThemes'
import shapesHandler from '../shapesHandler'
import SaveShapeModal from './modals/SaveShapeModal'
import ImportShapeModal from './modals/ImportShapeModal'
import ManageShapesModal from './modals/ManageShapesModal'
import notif from '../notifications'
import IconRightArrow from '../media/icon-right-arrow.svg'
import utils from '../utils'
import '../css/controls/Controls.css'
import '../css/controls/Modal.css'
const configData = config.get()
const themesList = utils.getSelectList(Object.keys(colorThemes))
const cellSizeList = utils.getSelectList(configData.cellSizesList)
const borderSizeList = utils.getSelectList(configData.borderSizesList)

export default class Controls extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isControlsOpen: configData.isControlsOpen,
      isOptionsOpen: configData.isOptionsOpen,
      defaultShapes: null,
      importShapeModalOpen: false,
      saveShapeModalOpen: false,
      manageShapesModalOpen: false,
      headerHeight: 0
    }
    ReactModal.setAppElement('#app')
    this.resizeTimer = null
    this.toggleControls = this.toggleControls.bind(this)
    this.toggleOptions = this.toggleOptions.bind(this)
    this.switchIterationMode = this.switchIterationMode.bind(this)
    this.switchShowNeighborsCount = this.switchShowNeighborsCount.bind(this)
    this.switchRandomSeed = this.switchRandomSeed.bind(this)
    this.changeTimeCompression = this.changeTimeCompression.bind(this)
    this.changeColorTheme = this.changeColorTheme.bind(this)
    this.changeCellAndBorderSize = this.changeCellAndBorderSize.bind(this)
    this.resetCells = this.resetCells.bind(this)
    this.saveShape = this.saveShape.bind(this)
    this.importShape = this.importShape.bind(this)
    this.handleShapeChange = this.handleShapeChange.bind(this)
    this.handleSaveShapeModal = this.handleSaveShapeModal.bind(this)
    this.handleImportShapeModal = this.handleImportShapeModal.bind(this)
    this.handleManageShapesModal = this.handleManageShapesModal.bind(this)
    this.deleteShape = this.deleteShape.bind(this)
    this.getMenuMaxHeight = this.getMenuMaxHeight.bind(this)
    this.onResize = this.onResize.bind(this)
  }

  toggleControls() {
    let value
    this.setState(prevState => {
      return value = { isControlsOpen: !prevState.isControlsOpen }
    }, () => {config.save(value)})
  }

  toggleOptions() {
    let value
    this.setState(prevState => {
      return value = { isOptionsOpen: !prevState.isOptionsOpen }
    }, () => {config.save(value)})
  }

  switchIterationMode() {
    this.props.switchIterationMode(this.props.isIterating)
  }

  switchShowNeighborsCount() {
    this.props.switchShowNeighborsCount()
  }

  switchRandomSeed(event) {
    this.props.switchRandomSeed(event.target.checked)
  }

  changeTimeCompression(event) {
    this.props.changeTimeCompression(event.target.value)
  }

  changeColorTheme(event) {
    this.props.changeColorTheme(event.target.value)
  }

  changeCellAndBorderSize(event, type) {
    const newSize = event.target.value !== '' ? parseInt(event.target.value, 10) : 0
    let newValue = {}
    if (type === 'cell') {
      newValue.cellSize = newSize
    } else {
      newValue.borderSize = newSize
    }
    this.props.changeCellAndBorderSize(newValue)
  }

  resetCells() {
    this.props.resetCells()
  }

  saveShape(name) {
    this.props.saveShape(name)
  }

  importShape(shapeExportString) {
    this.props.importShape(shapeExportString)
  }

  handleShapeChange(type, event) {
    const shapeName = event.target.value
    if (shapeName === 'Load a shape') return this.props.resetCells()
    this.props.loadShapeFromDb(type, shapeName)
  }

  handleSaveShapeModal() {
    if (this.props.randomSeedGenerated) {
      return notif.cantSaveShape("Can't save shape with random seed activated. Disable random seed and reset the game.")
    } else if (!this.props.allIndexChanged.length) {
      return notif.cantSaveShape('Create a shape first.')
    } else if (this.props.shapesLibraryNames.indexOf(this.props.activeShape.name) !== -1) {
      return notif.cantSaveShape('This shape is already a default shape.')
    }
    this.setState(prevState => {
      return { saveShapeModalOpen : !prevState.saveShapeModalOpen }
    })
  }

  handleImportShapeModal() {
    this.setState(prevState => {
      return { importShapeModalOpen : !prevState.importShapeModalOpen }
    })
  }

  handleManageShapesModal() {
    this.setState(prevState => {
      return { manageShapesModalOpen: !prevState.manageShapesModalOpen }
    })
  }

  deleteShape(name) {
    if (!confirm('Do you really want to delete this shape ?')) {return}
    const state = shapesHandler.deleteCustomShape(name)
    const isNoShapeLeft = state === 'noShapeLeft'
    const isActiveStateShape = name === this.props.activeShape.name
    if (isNoShapeLeft || isActiveStateShape) {
      if (isNoShapeLeft) this.handleManageShapesModal()
      if (isActiveStateShape) this.resetCells()
    } else {
      // refresh the shape list
      this.setState(this.state)
    }
  }

  getMenuMaxHeight() {
    const headerGeometry = this.header.getBoundingClientRect()
    this.setState(() => {
      return { headerHeight: headerGeometry.bottom - headerGeometry.top }
    })
  }

  onResize() {
    // Debounce resize
    if (this.resizeTimer) clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(this.getMenuMaxHeight, 200)
  }

  componentDidMount() {
    this.getMenuMaxHeight()
    window.addEventListener('resize', this.onResize, { passive: true })
  }

  render() {
    const isOptionsMenuOpenClass = this.state.isOptionsOpen ? 'open' : ''
    const isShowNeighborsCountDisabled = this.props.cellSize < 10
    const showNeighboursCountTitle = isShowNeighborsCountDisabled ?
      'This option is disabled when the cell size is under 10 pixels.' :
      'Show the number of alive neighbours for each cell.'
    const randomSeedTitle = 'If this option is checked, the canvas will be populated ' +
      'by a random seed when reset. If not, the canvas will be filled with dead cells.'
    const translateX = -(100 - ((this.props.cellsAlive / this.props.cellsCount) * 100).toFixed(1))
    const alivePercent = { transform: `translate3d(${translateX}%, 0, 0)`, backgroundColor: colorThemes[this.props.colorTheme].aliveCell }
    const customShapesNames = shapesHandler.getCustomShapesNames()
    const customShapeSelectLabel = this.props.activeShape.type === 'custom' ?
     this.props.activeShape.name : 'Load a shape'
    const defaultShapeSelectLabel = this.props.activeShape.type === 'default' ?
      this.props.activeShape.name : 'Load a shape'
    // Save shape CTA data
    let saveShapeCtaClass =
      (this.props.randomSeedGenerated || !this.props.allIndexChanged.length) ||
      (this.props.shapesLibraryNames.indexOf(this.props.activeShape.name) !== -1) ?
      'disabled' : ''
    let saveShapeCtaTitle = 'Save and share your shape.'
    saveShapeCtaTitle = !this.props.allIndexChanged.length ?
      'Create a shape first.' : saveShapeCtaTitle
    saveShapeCtaTitle = this.props.randomSeedGenerated ?
      "Can't save shape with random seed activated. Disable random seed and reset the game." :
      saveShapeCtaTitle
    return (
      <section className={`controls ${this.state.isControlsOpen ? 'open' : ''}`}
               style={{
                 backgroundColor: colorThemes[this.props.colorTheme].controlsBackground,
                 color: colorThemes[this.props.colorTheme].controlsText,
                 borderColor: colorThemes[this.props.colorTheme].controlsBorder
               }}>
        <style scoped>
          {`button:hover, input[type=submit]:hover {background-color: ${colorThemes[this.props.colorTheme].buttonHoverBackground}}
            @media screen and (max-width: 560px) {.options-wrapper {max-height: ${window.innerHeight - this.state.headerHeight}px}}`}
        </style>
        <header ref={header => this.header = header}>
          <button className="open-controls-cta" onClick={this.toggleControls}
            alt="Right Arrow" title="Open / close controls">
            <IconRightArrow width={24} height={24} className="icon" fill={colorThemes[this.props.colorTheme].controlsText} />
          </button>
          <div className="controls-bar-wrapper">
            <div className="info-bar">
              <Counter iterationCount={this.props.iterationCount} />
              <div className="info grid-size">{this.props.gridSize[0] + 'x' + this.props.gridSize[1]}</div>
              <div className="info cells-graph">
                <div className="background" style={{ backgroundColor: colorThemes[this.props.colorTheme].deadCell }}>
                  <span className="background-alive" style={alivePercent}> </span>
                  <span className="value" style={{ color: colorThemes[this.props.colorTheme].cellGraphText }}>
                    {`${utils.formatDigits(this.props.cellsAlive)} / ${utils.formatDigits(this.props.cellsCount)}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="controls-bar">
              <ControlButton className="play-cta big-cta"
                             title="Play / Pause the animation"
                             alt="Play / pause button"
                             color={colorThemes[this.props.colorTheme].controlsText}
                             handleChange={this.switchIterationMode}
                             type={this.props.isIterating ? 'pause' : 'play'}
                             buttonLabel={this.props.isIterating ? 'pause' : 'play'} />
              <ControlButton className="reset-cta big-cta"
                             title="Reset the game"
                             alt="Reset button"
                             color={colorThemes[this.props.colorTheme].controlsText}
                             handleChange={this.resetCells}
                             type="reset"
                             buttonLabel="Reset" />
              <ControlButton className={`options-cta big-cta ${isOptionsMenuOpenClass}`}
                             title="Open / Close the options"
                             alt="Down arrow button"
                             color={colorThemes[this.props.colorTheme].controlsText}
                             handleChange={this.toggleOptions}
                             type="options"
                             buttonLabel="Options" />
            </div>
          </div>
        </header>
        <div className={`options-wrapper ${isOptionsMenuOpenClass}`}>
          <style scoped>
            {`.checkbox-wrapper label .checkbox-icon {border-color: ${colorThemes[this.props.colorTheme].controlsText}}
              .checkbox-wrapper input[type=checkbox]:checked + label .checkbox-icon {background-color: ${colorThemes[this.props.colorTheme].controlsText}}`}
          </style>
          <ul className={`options-list`}>
            <li>
              <Checkbox id="show-neighbors-count"
                        label="Show neighbors count"
                        isDisabled={isShowNeighborsCountDisabled}
                        isChecked={this.props.showNeighborsCount}
                        title={showNeighboursCountTitle}
                        handleChange={this.switchShowNeighborsCount} />
            </li>
            <li>
              <Checkbox id="random-seed"
                        label="Random seed"
                        isChecked={this.props.randomSeed}
                        title={randomSeedTitle}
                        handleChange={this.switchRandomSeed} />
            </li>
            <li>
              <Select label="Color theme"
                      defaultValue={this.props.colorTheme}
                      options={themesList}
                      handleChange={this.changeColorTheme} />
            </li>
            <li>
              <Select label="Time compression"
                      defaultValue={this.props.timeCompression}
                      options={configData.timeCompressionList}
                      handleChange={this.changeTimeCompression} />
            </li>

            <li>
              <Select label="Cell size (in px)"
                      type="cell"
                      defaultValue={this.props.cellSize}
                      options={cellSizeList}
                      handleChange={this.changeCellAndBorderSize} />
            </li>

            <li>
              <Select label="Border Size (in px)"
                      type="border"
                      defaultValue={this.props.borderSize}
                      options={borderSizeList}
                      handleChange={this.changeCellAndBorderSize} />
            </li>

            {Array.isArray(this.props.shapesLibraryNames) ?
              <li>
                <div className="input-block select-wrapper">
                  <label className="input-label">
                    <span>Default shapes</span>
                    <select className="input-style"
                            value={defaultShapeSelectLabel}
                            onChange={this.handleShapeChange.bind(this, 'default')}>
                      {this.props.shapesLibraryNames.map((el, index) => 
                        <option key={index} value={el}>{el}</option>
                      )}
                    </select>
                  </label>
                </div>
              </li>
              : ''
            }

            {customShapesNames ?
              <li>
                <div className="input-block select-wrapper">
                  <label className="input-label">
                    <span>Custom shapes</span>
                    <select className="input-style"
                            value={customShapeSelectLabel}
                            onChange={this.handleShapeChange.bind(this, 'custom')}>
                      {customShapesNames.map((el, index) => {
                        return <option key={index} value={el}>{el}</option>
                      })}
                    </select>
                  </label>
                </div>
              </li>
              : ''
            }

            <li>
              <div className="input-block">
              <button id="save-shape-cta"
                      className={`input-style small-cta ${saveShapeCtaClass}`}
                      title={saveShapeCtaTitle}
                      onClick={this.handleSaveShapeModal}>
                  Save & share
                </button>
                <SaveShapeModal
                  showModal={this.state.saveShapeModalOpen}
                  handleShowModal={this.handleSaveShapeModal}
                  saveShape={this.saveShape}
                  activeShape={this.props.activeShape}
                  colorTheme={this.props.colorTheme}
                  modalStyle={this.props.modalStyle} />
              </div>
            </li>

            <li>
              <div className="input-block">
                <button id="import-shape-cta"
                        className="input-style small-cta"
                        title="Import a shape"
                        onClick={this.handleImportShapeModal}>
                  Import a shape
                </button>
                <ImportShapeModal
                  showModal={this.state.importShapeModalOpen}
                  handleShowModal={this.handleImportShapeModal}
                  importShape={this.importShape}
                  colorTheme={this.props.colorTheme}
                  modalStyle={this.props.modalStyle} />
              </div>
            </li>

            {customShapesNames ?
              <li>
                <div className="input-block">
                  <button id="manage-shape-cta"
                          className="input-style small-cta"
                          title={saveShapeCtaTitle}
                          onClick={this.handleManageShapesModal}>
                    Manage shapes
                  </button>
                  <ManageShapesModal
                    showModal={this.state.manageShapesModalOpen}
                    handleShowModal={this.handleManageShapesModal}
                    loadShape={this.props.loadShapeFromDb}
                    activeShape={this.props.activeShape}
                    resetCells={this.props.resetCells}
                    deleteShape={this.deleteShape}
                    colorTheme={this.props.colorTheme}
                    modalStyle={this.props.modalStyle} />
                </div>
              </li>
              : ''
            }
          </ul>
        </div>
      </section>
    )
  }
}
