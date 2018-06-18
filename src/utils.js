import config from './config/configHandler'
const configData = config.get()
let windowWidth = window.innerWidth
let windowHeight = window.innerHeight
const bodyPaddingX = configData.bodyPaddingX
const bodyPaddingY = configData.bodyPaddingY
let roundedCol, roundedRow, wrapperWidth, wrapperHeight, colSize, rowSize, cellsCount
const seed = isRandomSeed =>
  isRandomSeed ? (Math.round(Math.random() * 10) % configData.randomSeedThreshold === 0 ? 1 : 0) : 0
const getNeighborsIndexes = index => {
  const position = index + 1
  let neighborsIndexes = []
  let xAxisBorder, yAxisBorder
  // Detect if cell is on X or Y axis extremities
  if (position <= colSize) xAxisBorder = 'top'
  if (position > cellsCount - colSize) xAxisBorder = 'bottom'
  if (position % colSize === 1) yAxisBorder = 'left'
  if (position % colSize === 0) yAxisBorder = 'right'
  for (let i = 0; i < 8; i++) {
    switch (i) {
      default:
      case 0: // Top Row - Left
        if (xAxisBorder !== 'top' && yAxisBorder !== 'left') {
          neighborsIndexes.push(index - (colSize + 1))
        }
        break
      case 1: // Top Row - Middle
        if (xAxisBorder !== 'top') {
          neighborsIndexes.push(index - colSize)
        }
        break
      case 2: // Top Row - Right
        if (xAxisBorder !== 'top' && yAxisBorder !== 'right') {
          neighborsIndexes.push(index - (colSize - 1))
        }
        break
      case 3: // Middle Row - Left
        if (yAxisBorder !== 'left') {
          neighborsIndexes.push(index - 1)
        }
        break
      case 4: // Middle Row - Right
        if (yAxisBorder !== 'right') {
          neighborsIndexes.push(index + 1)
        }
        break
      case 5: // Bottom Row - Left
        if (xAxisBorder !== 'bottom' && yAxisBorder !== 'left') {
          neighborsIndexes.push(index + (colSize - 1))
        }
        break
      case 6: // Bottom Row - Middle
        if (xAxisBorder !== 'bottom') {
          neighborsIndexes.push(index + colSize)
        }
        break
      case 7: // Bottom Row - Right
        if (xAxisBorder !== 'bottom' && yAxisBorder !== 'right') {
          neighborsIndexes.push(index + (colSize + 1))
        }
        break
    }
  }
  return neighborsIndexes
}

export default {
  initGridData: (cellSize, borderSize, isResize) => {
    if (isResize) {
      windowWidth = window.innerWidth
      windowHeight = window.innerHeight
    }
    cellSize += borderSize * 2
    roundedCol = Math.floor((windowWidth - bodyPaddingX * 2) / cellSize)
    roundedRow = Math.floor((windowHeight - bodyPaddingY * 2) / cellSize)
    wrapperWidth = roundedCol * cellSize
    wrapperHeight = roundedRow * cellSize
    colSize = roundedCol
    rowSize = Math.floor(wrapperHeight / cellSize)
    cellsCount = rowSize * colSize
  },

  // Predict if the grid will have enough space to paint
  // at least one cell when changing cell or border size
  gridHasCells: (newCellSize, newBorderSize) => {
    newCellSize += newBorderSize * 2
    const newRoundedCol = Math.floor((windowWidth - bodyPaddingX * 2) / newCellSize)
    const newRoundedRow = Math.floor((windowHeight - bodyPaddingY * 2) / newCellSize)
    return !!(newRoundedCol && newRoundedRow)
  },

  adaptGridSizeToShapeSize: (shapeSize, cellSize, borderSize) => {
    let newGridSize = [colSize, rowSize]
    let newCellSize = cellSize
    let newBorderSize = borderSize
    let newRoundedCol, newRoundedRow, newWrapperHeight, newRowSize
    let shapeTooBigWithSmallestCellSize = false
    let shapeTooBigWithSmallestBorderSize = false
    // Try adapating the canvas size by reducing the cell size and keeping
    // the actual border size
    while (!shapeTooBigWithSmallestCellSize && (newGridSize[0] < shapeSize[0] || newGridSize[1] < shapeSize[1])) {
      if (newCellSize <= 2) {
        shapeTooBigWithSmallestCellSize = true
        break
      }
      newCellSize -= 2
      newRoundedCol = Math.floor((windowWidth - bodyPaddingX * 2) / (newCellSize + newBorderSize * 2))
      newRoundedRow = Math.floor((windowHeight - bodyPaddingY * 2) / (newCellSize + newBorderSize * 2))
      newWrapperHeight = newRoundedRow * (newCellSize + newBorderSize * 2)
      newRowSize = Math.floor(newWrapperHeight / (newCellSize + newBorderSize * 2))
      newGridSize = [newRoundedCol, newRowSize]
    }
    // If shape is still too big with minimum cell size,
    // try reducing the border size until the minimum size
    // with minimum cell size
    if (shapeTooBigWithSmallestCellSize) {
      while (!shapeTooBigWithSmallestBorderSize && (newGridSize[0] < shapeSize[0] || newGridSize[1] < shapeSize[1])) {
        if (newBorderSize === 0) {
          shapeTooBigWithSmallestBorderSize = true
          break
        }
        newBorderSize -= 1
        newRoundedCol = Math.floor((windowWidth - bodyPaddingX * 2) / (newCellSize + newBorderSize * 2))
        newRoundedRow = Math.floor((windowHeight - bodyPaddingY * 2) / (newCellSize + newBorderSize * 2))
        newWrapperHeight = newRoundedRow * (newCellSize + newBorderSize * 2)
        newRowSize = Math.floor(newWrapperHeight / (newCellSize + newBorderSize * 2))
        newGridSize = [newRoundedCol, newRowSize]
      }
    }

    // If grid could be adapted to shape, return new cell and border values,
    // Else shape is too big to adapt the canvas, return null
    return !shapeTooBigWithSmallestBorderSize ?
      { cellSize: newCellSize, borderSize: newBorderSize } :
      null
  },

  generateSeed: isRandomSeed => {
    const seedMap = []
    for (let i = 0; i < cellsCount; i++) {seedMap.push(seed(isRandomSeed))}
    return seedMap
  },

  /**
   * Switch a cell State, by returning updated data.
   * @param {object} options - Options
   * @param {int} options.index - The index of the cell
   * @param {array} options.lifeMap - The current life map
   * @param {array} options.neighbourLifeMap - The current neighbour life map
   * @param {int} options.cellsAlive - The current total cells alive
   * @returns {object} Object with 3 keys { lifeMap, neighbourLifeMap, cellsAlive }
   */
  switchCellState: options => {
    const lifeStateDiff = options.lifeMap[options.index] ? -1 : 1
    let newValues = {
      lifeMap: options.lifeMap,
      neighbourLifeMap: options.neighbourLifeMap,
      cellsAlive: options.cellsAlive
    }
    newValues.lifeMap[options.index] += lifeStateDiff
    newValues.cellsAlive += lifeStateDiff
    getNeighborsIndexes(options.index).forEach(el => {
      newValues.neighbourLifeMap[el] += lifeStateDiff
    })
    return newValues
  },

  // Add a comma every 3 figures
  formatDigits: totalCellsNumber =>
    totalCellsNumber.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'),

  /* GETTER */
  getLifeMap: (lifeMap, neighbourLifeMap) => neighbourLifeMap.map((el, i) =>
    lifeMap[i] ? (el === 2 || el === 3 ? 1 : 0) : (el === 3 ? 1 : 0)
  ),

  getLifeMapDiff: (previousLifeMap, newLifeMap) => previousLifeMap.reduce((acc, el, i) => {
    if (el !== newLifeMap[i]) acc.push(i)
    return acc
  }, []),

  getLifeMapDiffWithNeighbors: (diffMap, previousNeighbourLifeMap, neighbourLifeMap) => {
    previousNeighbourLifeMap.forEach((el, i) => {
      if (el !== neighbourLifeMap[i]) {diffMap.push(i)}
    })
    // Remove duplicates
    let newDiffMap = {}
    return diffMap.filter(function(el) {
      return newDiffMap.hasOwnProperty(el) ? false : (newDiffMap[el] = true)
    })
  },

  // get all indexes of the alive cells from the lifeMap
  getChangedIndexesFromLifeMap: lifemap => lifemap.reduce((acc, el, i) => {
    if (el) acc.push(i)
    return acc
  }, []),

  getTotalCells: () => cellsCount,

  getWrapperWidth: () => wrapperWidth,

  getWrapperHeight: () => wrapperHeight,

  getColSize: () => colSize,

  // Return an array with the alive cells neighbors count for each cell
  getNeighbourMap: lifeMap =>
    lifeMap.map((element, index) =>
      getNeighborsIndexes(index).reduce((acc, el) => acc + lifeMap[el], 0)
    ),

  getCellsAliveCount: lifeMap =>
    lifeMap.reduce((acc, el) => acc + el),

  getGridSize: () => [colSize, rowSize],

  getSelectList: array => array.reduce((acc, el) => {
    acc.push([el, el])
    return acc
  }, []),

  getPointerType: eventType =>
    eventType === 'touchstart' || eventType === 'touchmove' ? 'touch' : 'mouse',

  getDeviceType: () => /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(navigator.userAgent) ?
    'mobile' : 'desktop'
}
