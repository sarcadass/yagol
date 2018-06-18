import React, { Component } from 'react'
import config from './config/configHandler'
import colorThemes from './config/colorThemes'
import utils from './utils'
import Controls from './controls/Controls'
import Footer from './Footer'
import NotificationSystem from 'react-notification-system'
import shapesHandler from './shapesHandler'
import notif from './notifications'
import './css/App.css'
const configData = config.get()
let shapesLibrary = null

export default class App extends Component {
  constructor(props) {
    super(props)
    utils.initGridData(configData.cellSize, configData.borderSize)
    const lifeMap = utils.generateSeed(configData.randomSeed)
    this.state = {
      iterationCount: 0,
      cellSize: configData.cellSize,
      borderSize: configData.borderSize,
      randomSeed: configData.randomSeed,
      showNeighborsCount: configData.cellSize < 10 ?
        false : configData.showNeighborsCount,
      timeCompression: configData.timeCompression,
      colSize: utils.getColSize(),
      gridSize: utils.getGridSize(),
      totalCells: utils.getTotalCells(),
      lifeMap: lifeMap,
      neighbourLifeMap: utils.getNeighbourMap(lifeMap),
      cellsAlive: utils.getCellsAliveCount(lifeMap),
      wrapperWidth: { width: `${utils.getWrapperWidth()}px` },
      isIterating: false,
      allIndexChanged: [],
      shapesLibraryNames: null,
      activeShape: { type: null, name: null, exportString: null },
      randomSeedGenerated: configData.randomSeed,
      colorTheme: configData.colorTheme,
      modalStyle: config.getModalStyle(configData.colorTheme)
    }
    this.resizeTimer = null
    this.interval = null
    this.pixelRatio = window.devicePixelRatio
    this.currentIndexChanged = {}
    this.changeLifeMode = null
    this.fireFrame = this.fireFrame.bind(this)
    this.generateCells = this.generateCells.bind(this)
    this.renderCell = this.renderCell.bind(this)
    this.stopClickDrag = this.stopClickDrag.bind(this)
    this.handleCellChangeState = this.handleCellChangeState.bind(this)
    this.switchShowNeighborsCount = this.switchShowNeighborsCount.bind(this)
    this.switchRandomSeed = this.switchRandomSeed.bind(this)
    this.changeTimeCompression = this.changeTimeCompression.bind(this)
    this.changeColorTheme = this.changeColorTheme.bind(this)
    this.switchIterationMode = this.switchIterationMode.bind(this)
    this.changeCellAndBorderSize = this.changeCellAndBorderSize.bind(this)
    this.resetCells = this.resetCells.bind(this)
    this.refreshCanvas = this.refreshCanvas.bind(this)
    this.setCanvasProperties = this.setCanvasProperties.bind(this)
    this.importShape = this.importShape.bind(this)
    this.saveShape = this.saveShape.bind(this)
    this.loadShape = this.loadShape.bind(this)
    this.loadShapeFromDb = this.loadShapeFromDb.bind(this)
    this.displayResizeGridPrompt = this.displayResizeGridPrompt.bind(this)
    this.onResize = this.onResize.bind(this)
  }

  fireFrame() {
    let newLifeMap = utils.getLifeMap(this.state.lifeMap, this.state.neighbourLifeMap)
    this.lifeMapDiff = utils.getLifeMapDiff(this.state.lifeMap, newLifeMap)
    if (this.state.showNeighborsCount) {
      this.lifeMapDiff = utils.getLifeMapDiffWithNeighbors(
        this.lifeMapDiff, this.state.neighbourLifeMap, utils.getNeighbourMap(newLifeMap)
      )
    }
    this.setState({
      isIterating: true,
      iterationCount: this.state.iterationCount + 1,
      lifeMap: newLifeMap,
      neighbourLifeMap: utils.getNeighbourMap(newLifeMap),
      cellsAlive: utils.getCellsAliveCount(newLifeMap)
    }, this.generateCells.bind(this, true))
    clearInterval(this.interval)
    if (this.state.timeCompression) {
      this.interval = setInterval(() => {
        this.animation = requestAnimationFrame(this.fireFrame)
      }, this.state.timeCompression)
    } else {
      this.animation = requestAnimationFrame(this.fireFrame)
    }
  }

  generateCells(useLifeMapDiff) {
    // If lifeMapDiff is provided, generate only the cells which changed
    // else generate all the cells.
    const totalCellToGenerate = useLifeMapDiff ? this.lifeMapDiff.length : utils.getTotalCells()
    const borderSize = this.state.borderSize
    const cellSize = this.state.cellSize
    for (let i = 0; i < totalCellToGenerate; i++) {
      let activeIndex = useLifeMapDiff ? this.lifeMapDiff[i] : i
      let xPos = activeIndex % this.state.colSize
      xPos = xPos * cellSize + (borderSize * xPos) * 2 + borderSize
      let yPos = Math.floor(activeIndex / this.state.colSize)
      yPos = yPos * cellSize + (borderSize * yPos) * 2 + borderSize
      this.renderCell(activeIndex, xPos, yPos)
    }
  }

  renderCell(cellIndex, xPos, yPos) {
    this.ctx.fillStyle = this.state.lifeMap[cellIndex] ?
      colorThemes[this.state.colorTheme].aliveCell : colorThemes[this.state.colorTheme].deadCell
    this.ctx.fillRect(xPos, yPos, this.state.cellSize, this.state.cellSize)
    if (this.state.showNeighborsCount) {
      this.ctx.fillStyle = colorThemes[this.state.colorTheme].cellText
      const halfCellSize = this.state.cellSize / 2
      this.ctx.fillText(
        this.state.neighbourLifeMap[cellIndex],
        xPos + halfCellSize,
        yPos + halfCellSize
      )
    }
  }

  handleCellChangeState(event) {
    // Prevent mouse events (mousedown & mousemove) to trigger immediatly after a 'touchstart'
    // but allow mixed devices (mouse and touch) to use both type of inputs separately
    if (event.type === 'touchstart') {
      this.lastTouchedTime = new Date()
    } else if (event.type === 'mousedown' || event.type === 'mousemove') {
      if (this.lastTouchedTime) {
        if (new Date() - this.lastTouchedTime < 750) {
          return event.preventDefault()
        }
      }
    }
    const pointerType = utils.getPointerType(event.type)
    const startEvent = pointerType === 'touch' ? 'touchstart' : 'mousedown'
    const moveEvent = pointerType === 'touch' ? 'touchmove' : 'mousemove'
    const isTouchEvent = event.type === 'touchstart' || event.type === 'touchmove'
    const canvasWidth = Math.floor(this.canvas.width / this.pixelRatio)
    const canvasHeight = Math.floor(this.canvas.height / this.pixelRatio)
    // [SAFARI BUG] event.buttons not recognized
    // https://github.com/facebook/react/issues/7122
    const buttonPressedCode = event.buttons !== undefined ? event.buttons : event.nativeEvent.which
    // if mouse over the canvas but not clicking
    if (event.type === 'mousemove' && buttonPressedCode !== 1) {return}
    let x, y
    if (event.type === 'mousedown' || event.type === 'mousemove') {
      x = event.pageX - this.canvas.offsetLeft
      y = event.pageY - this.canvas.offsetTop
    } else if (isTouchEvent) {
      x = event.touches[0].clientX - this.canvas.offsetLeft
      y = event.touches[0].clientY - this.canvas.offsetTop
    }
    // Prevent dragging overflowing out of the canvas
    if (x < 0 || x > canvasWidth || y < 0 || y > canvasHeight) {return}
    let cellSize = this.state.cellSize + this.state.borderSize * 2
    let col = Math.floor(x / cellSize)
    let row = Math.floor(y / cellSize)
    let cellIndex = row * utils.getColSize() + col

    if (event.type === moveEvent) {
      // Don't switch a cell multiple times or cell with the
      // same state as the new one changed
      if (this.currentIndexChanged.hasOwnProperty(cellIndex) ||
        this.state.lifeMap[cellIndex] === this.changeLifeMode
      ) {return}
      
      this.currentIndexChanged[cellIndex] = true
    } else if (event.type === startEvent) {
      // Set the switch mode (life / death) if click and moving the mouse
      this.changeLifeMode = this.state.lifeMap[cellIndex] ? 0 : 1
    }
    let newValues = utils.switchCellState({
      index: cellIndex,
      lifeMap: this.state.lifeMap.slice(0),
      neighbourLifeMap: this.state.neighbourLifeMap.slice(0),
      cellsAlive: this.state.cellsAlive
    })
    let indexInAllCellChanged = this.state.allIndexChanged.indexOf(cellIndex)
    let newAllIndexChanged = this.state.allIndexChanged
    if (indexInAllCellChanged !== -1) {
      newAllIndexChanged.splice(indexInAllCellChanged, 1)
    } else {
      newAllIndexChanged.push(cellIndex)
    }
    // Generate an array of the cell's index changed to only repaint them
    this.lifeMapDiff = utils.getLifeMapDiff(this.state.lifeMap, newValues.lifeMap)
    if (this.state.showNeighborsCount) {
      this.lifeMapDiff = utils.getLifeMapDiffWithNeighbors(this.lifeMapDiff,
        this.state.neighbourLifeMap, newValues.neighbourLifeMap)
    }
    this.setState(prevState => ({
      lifeMap: newValues.lifeMap,
      neighbourLifeMap: newValues.neighbourLifeMap,
      cellsAlive: newValues.cellsAlive,
      allIndexChanged: newAllIndexChanged,
      activeShape: { type: null, name: null, exportString: null },
    }), this.generateCells.bind(this, true))
  }

  stopClickDrag() { this.currentIndexChanged = {} }

  switchShowNeighborsCount() {
    let value
    this.setState(
      prevState => {
        value = { showNeighborsCount: !prevState.showNeighborsCount }
        return value
      }, () => {
        this.refreshCanvas()
        this.generateCells()
        config.save(value)
      }
    )
  }

  switchRandomSeed() {
    let newRandomSeed
    this.setState(
      prevState => newRandomSeed = { randomSeed: !prevState.randomSeed },
      () => {config.save(newRandomSeed)}
    )
  }

  changeTimeCompression(value) {
    let newTimeCompression = { timeCompression: parseInt(value, 10) }
    this.setState(
      newTimeCompression,
      () => {config.save(newTimeCompression)}
    )
  }

  changeColorTheme(value) {
    let newColorTheme = { colorTheme: value }
    this.setState(
      {
        ...newColorTheme,
        modalStyle: config.getModalStyle(value)
      },
      () => {
        this.generateCells()
        config.save(newColorTheme)
      }
    )
  }  

  switchIterationMode() {
    const activeShape = { type: null, name: null, exportString: null }
    clearInterval(this.interval)
    if (this.state.isIterating) {
      cancelAnimationFrame(this.animation)
      this.setState({ isIterating: false, activeShape})
    } else {
      this.setState({ isIterating: true, activeShape},
        () => {this.animation = requestAnimationFrame(this.fireFrame)})
    }
  }

  changeCellAndBorderSize(newValues) {
    let newCellSize = newValues.cellSize !== undefined ? newValues.cellSize : this.state.cellSize
    const newBorderSize = newValues.borderSize !== undefined ? newValues.borderSize : this.state.borderSize
    if (newCellSize < 2) newCellSize = 2
    let configToSave = { cellSize: newCellSize, borderSize: newBorderSize }
    // If cell or border size is too big and there is no cell
    // that can fit the grid
    if (!utils.gridHasCells(newCellSize, newBorderSize)) {
      notif.clearAll()
      return notif.cellOrBorderSizeTooBig()
    }
    utils.initGridData(newCellSize, newBorderSize)
    let newState = {
      cellSize: newCellSize,
      borderSize: newBorderSize,
      totalCells: utils.getTotalCells(),
      gridSize: utils.getGridSize()
    }
    // Disable show neigbors count if new cell size < 10
    if (newCellSize < 10 && this.state.showNeighborsCount) {
      newState.showNeighborsCount = false
      configToSave.showNeighborsCount = false
      notif.showNeighborsCountDisabled()
    }
    this.setState(newState, () => {
      this.setCanvasProperties()
      this.refreshCanvas()
      config.save(configToSave)
      this.state.activeShape.name ?
        this.loadShapeFromDb(this.state.activeShape.type, this.state.activeShape.name) :
        this.resetCells()
    })
  }

  refreshCanvas() {
    this.ctx.clearRect(0, 0, utils.getWrapperWidth(), utils.getWrapperHeight())
  }

  resetCells() {
    let lifeMap = utils.generateSeed(this.state.randomSeed)
    if (this.state.isIterating) this.switchIterationMode()
    this.setState({
      iterationCount: 0,
      lifeMap: lifeMap,
      neighbourLifeMap: utils.getNeighbourMap(lifeMap),
      cellsAlive: utils.getCellsAliveCount(lifeMap),
      colSize: utils.getColSize(),
      gridSize: utils.getGridSize(),
      totalCells: utils.getTotalCells(),
      isIterating: false,
      allIndexChanged: [],
      randomSeedGenerated: this.state.randomSeed,
      activeShape: { type: null, name: null, exportString: null }
    }, this.generateCells)
  }

  setCanvasProperties() {
    this.ctx.scale(this.pixelRatio, this.pixelRatio)
    this.ctx.font = `${this.state.cellSize}px monospace`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
  }

  saveShape(name) {
    if (shapesHandler.loadCustomShape(name)) {
      if (!confirm('This shape already exists. Overwrite it ?')) {return}
    }
    const indexChanged = this.state.iterationCount > 0 ?
      utils.getChangedIndexesFromLifeMap(this.state.lifeMap) :
      this.state.allIndexChanged
    let shapeData = { name, indexChanged, gridSize: this.state.gridSize }
    shapesHandler.saveCustomShape(shapeData)
    const exportString = shapesHandler.loadCustomShape(name).exportString
    this.setState({ activeShape: { type: 'custom', name, exportString } })
  }

  importShape(shapeExportString) {
    const shapeData = shapesHandler.decodeShapeExportString(shapeExportString)
    const isAlreadyExistingShape = shapesHandler.doesImportShapeAlreadyExist(shapeExportString)
    // If shapeExportString is not a valid Base64 string
    if (!shapeData) {return notif.wrongShapeExportString()}
    // If same shape already exists in custom shapes
    if (isAlreadyExistingShape) {return notif.shapeAlreadyExists(isAlreadyExistingShape)}
    shapesHandler.importCustomShape(shapeData, shapeExportString)
    notif.shapeSuccessfullyImported()
    this.loadShapeFromDb('custom', shapeData.name)
  }

  loadShape(shapeData, type) {
    const gridSize = this.state.gridSize
    // If shape size is bigger than actual grid size,
    // reduce cell size or border size to make it fit
    if (gridSize[0] < shapeData.shapeSize[0] || gridSize[1] < shapeData.shapeSize[1]) {
      const newCellAndBorderValues = utils.adaptGridSizeToShapeSize(
        shapeData.shapeSize,
        this.state.cellSize,
        this.state.borderSize
      )
      // If shape is still too big even with minimal
      // cell and border size, display notif
      if (!newCellAndBorderValues) return notif.shapeIsTooBig()
      this.changeCellAndBorderSize(newCellAndBorderValues)
      notif.clearAll()
      notif.cellBorderSizeChanged()
    }
    let newLifeMap = utils.generateSeed(false)
    if (this.state.isIterating) {this.switchIterationMode()}
    let colStart = Math.floor(gridSize[0] / 2 - shapeData.shapeSize[0] / 2)
    let rowStart = Math.floor(gridSize[1] / 2 - shapeData.shapeSize[1] / 2)
    let allIndexChanged = []
    for (let i = 0; i < shapeData.lifeMap.length; i++) {
      let activeRow = Math.floor(shapeData.lifeMap[i] / shapeData.shapeSize[0])
      let activeRowIndex = rowStart * gridSize[0] + activeRow * gridSize[0]
      let activeColLifeMapIndex = shapeData.lifeMap[i] % shapeData.shapeSize[0]
      let activeIndex = activeRowIndex + colStart + activeColLifeMapIndex
      allIndexChanged.push(activeIndex)
      newLifeMap[activeIndex] = 1
    }
    this.setState({
      iterationCount: 0,
      lifeMap: newLifeMap,
      neighbourLifeMap: utils.getNeighbourMap(newLifeMap),
      cellsAlive: utils.getCellsAliveCount(newLifeMap),
      colSize: utils.getColSize(),
      isIterating: false,
      allIndexChanged: allIndexChanged,
      randomSeedGenerated: false,
      activeShape: { type, name: shapeData.name, exportString: shapeData.exportString }
    }, this.generateCells)
  }

  loadShapeFromDb(type, name) {
    const shapeData = type === 'custom' ? shapesHandler.loadCustomShape(name) : shapesLibrary[name]
    this.loadShape(shapeData, type)
  }

  displayResizeGridPrompt() {
    // Prevent displaying the resize Grid prompt if the user mobile
    // virtual keyboard is showing up (which trigger a resize event)
    if (utils.getDeviceType() === 'mobile' && this.windowWidth === window.innerWidth) return
    this.windowWidth = window.innerWidth
    // When window is resized, ask if the user wants
    // to adapt the canvas size to the new window size
    notif.resizeGridPrompt(() => {
      utils.initGridData(this.state.cellSize, this.state.borderSize, true)
      // Redraw the canvas with the new size
      this.changeCellAndBorderSize({})
    })
  }

  onResize() {
    // Debounce resize
    if (this.resizeTimer) clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(this.displayResizeGridPrompt, 200)
  }

  componentDidMount() {
    notif.init(this.refs.notificationSystem)
    this.ctx = this.canvas.getContext('2d')
    this.setCanvasProperties()
    this.generateCells()
    this.windowWidth = window.innerWidth
    window.addEventListener('resize', this.onResize, { passive: true })
    // Get shapes library & set it in memory
    fetch(new Request('shapesLibrary.json'))
      .then(response => response.json())
      .then(response => {
        let shapesLibraryNames = Object.keys(response)
        shapesLibraryNames.unshift('Load a shape')
        shapesLibrary = response
        this.setState({ shapesLibraryNames })
      })
  }

  render() {
    const wrapperWidth = utils.getWrapperWidth()
    const wrapperHeight = utils.getWrapperHeight()
    const state = this.state
    const canvasStyle = this.pixelRatio > 1 ?
      { width: `${wrapperWidth}px`, height: `${wrapperHeight}px` } : {}
    return (
      <div className="main-wrapper"
           style={{ backgroundColor: colorThemes[this.state.colorTheme].background }}>
        <canvas id="game"
                width={wrapperWidth * this.pixelRatio}
                height={wrapperHeight * this.pixelRatio}
                style={canvasStyle}
                ref={canvas => this.canvas = canvas}
                onMouseMove={this.handleCellChangeState}
                onMouseDown={this.handleCellChangeState}
                onMouseUp={this.stopClickDrag}
                onTouchStart={this.handleCellChangeState}
                onTouchMove={this.handleCellChangeState}
                onTouchEnd={this.stopClickDrag}>
          Game of Life sandbox.
        </canvas>
        <Controls isIterating={state.isIterating}
                  switchIterationMode={this.switchIterationMode}
                  resetCells={this.resetCells}
                  iterationCount={state.iterationCount}
                  cellsCount={state.totalCells}
                  cellsAlive={state.cellsAlive}
                  gridSize={state.gridSize}
                  showNeighborsCount={state.showNeighborsCount}
                  switchShowNeighborsCount={this.switchShowNeighborsCount}
                  switchRandomSeed={this.switchRandomSeed}
                  randomSeed={state.randomSeed}
                  changeTimeCompression={this.changeTimeCompression}
                  timeCompression={state.timeCompression}
                  cellSize={state.cellSize}
                  borderSize={state.borderSize}
                  changeCellAndBorderSize={this.changeCellAndBorderSize}
                  loadShapeFromDb={this.loadShapeFromDb}
                  saveShape={this.saveShape}
                  importShape={this.importShape}
                  activeShape={state.activeShape}
                  shapesLibraryNames={state.shapesLibraryNames}
                  randomSeedGenerated={state.randomSeedGenerated}
                  allIndexChanged={state.allIndexChanged}
                  colorTheme={state.colorTheme}
                  changeColorTheme={this.changeColorTheme}
                  modalStyle={state.modalStyle} />
        <Footer colorTheme={state.colorTheme} modalStyle={state.modalStyle} />
        <NotificationSystem ref="notificationSystem" />
      </div>
    )
  }
}
