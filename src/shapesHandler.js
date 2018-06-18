import utils from './utils'

const shapesHandler = {
  saveCustomShape: options => {
    let customShapes = shapesHandler.getCustomShapes()
    let newCustomShapes = customShapes ? customShapes : {}
    let shapeData = shapesHandler.getShapeLifeMapAndSize(options.gridSize, options.indexChanged)
    newCustomShapes[options.name] = {
      name: options.name,
      shapeSize: shapeData.size,
      lifeMap: shapeData.lifeMap,
    }
    const exportString = shapesHandler.encodeShapeExportString(newCustomShapes[options.name])
    newCustomShapes[options.name].exportString = exportString
    localStorage.setItem('customShapes', JSON.stringify(newCustomShapes))
  },

  importCustomShape: (shapeData, shapeExportString) => {
    let customShapes = shapesHandler.getCustomShapes()
    let newCustomShapes = customShapes ? customShapes : {}
    newCustomShapes[shapeData.name] = shapeData
    newCustomShapes[shapeData.name].exportString = shapeExportString
    localStorage.setItem('customShapes', JSON.stringify(newCustomShapes))
  },

  // Generate a shape export string by encoding shape data to a base64 string
  encodeShapeExportString: shapeData => btoa(unescape(encodeURIComponent(JSON.stringify(shapeData)))),

  decodeShapeExportString: exportString => {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(exportString))))
    } catch(e) {
      // If corrupted Base64 string, return undefined
      return undefined
    }
  },

  loadCustomShape: name => {
    const customShapes = shapesHandler.getCustomShapes()
    return customShapes ? customShapes[name] : null
  },

  deleteCustomShape: name => {
    const customShapes = shapesHandler.getCustomShapes()
    // If only one shape delete customShapes from localStorage
    if (Object.keys(customShapes).length === 1) {
      localStorage.removeItem('customShapes')
      return 'noShapeLeft'
    }
    delete customShapes[name]
    localStorage.setItem('customShapes', JSON.stringify(customShapes))
  },

  doesImportShapeAlreadyExist: shapeExportString => {
    const customShapes = shapesHandler.getCustomShapes()
    for (let shape in customShapes) {
      if (customShapes[shape].exportString === shapeExportString) {return customShapes[shape].name}
    }
    return false
  },

  getCustomShapes: () => JSON.parse(localStorage.getItem('customShapes')),

  getCustomShapesNames: () => {
    const customShapes = shapesHandler.getCustomShapes()
    if (customShapes) {
      let customShapesNames = Object.keys(customShapes)
      customShapesNames.unshift('Load a shape')
      return customShapesNames
    }
    return null
  },

  getShapeLifeMapAndSize: (gridSize, indexChanged) => {
    let lifeMap = utils.generateSeed()
    let colLength = gridSize[0]
    let rowLength = gridSize[1]
    indexChanged.forEach((el, i) => {
      lifeMap[el] = lifeMap[el] ? 0 : 1
    })
    let gridMap = {}
    let activeGridRow = -1

    // Create an 'hashMap' of the actual lifeMap with rows
    // as keys containing the cols
    for (let i = 0; i < lifeMap.length; i++) {
      if (!(i % colLength)) {
        activeGridRow += 1
        gridMap[activeGridRow] = []
      }
      gridMap[activeGridRow].push(lifeMap[i])
    }

    let widthStart, widthEnd, heightStart, heightEnd
    // Detect the cell Alive the most on the left and right
    // of the actual shape
    for (let i = 0; i < rowLength; i++) {
      let widthStartSetForActualRow = false
      // If no cell alive on the actual row, continue
      if (gridMap[i].indexOf(1) === -1) continue
      // Set the first row of the shape
      if (heightStart === undefined) heightStart = i
      // Set the last row of the shape
      if (heightEnd === undefined || i > heightEnd) heightEnd = i
      // Iterate on each col cell of the current row
      for (let j = 0; j < gridMap[i].length ; j++) {
        if (!widthStartSetForActualRow) {
          // If the cell is alive and under the actual
          // saved widthStart
          if (gridMap[i][j] && (widthStart === undefined || j < widthStart)) {
            widthStart = j
            widthStartSetForActualRow = true
          }
        }
        // If the cell is alive and under the actual
        // saved widthEnd
        if (gridMap[i][j] && (widthEnd === undefined || j > widthEnd)) {
          widthEnd = j
        }
      }
    }

    let shapeWidth = widthStart !== undefined ? (widthEnd - widthStart) + 1 : 0
    let shapeHeight = heightStart !== undefined ? (heightEnd - heightStart) + 1 : 0
    let widthDiff = gridSize[0] - shapeWidth
    let shapelifeMap = indexChanged.map(el => {
      // remove previous row
      let newIndex = el - widthDiff * Math.floor(el / gridSize[0])
      newIndex -= widthStart
      newIndex -= shapeWidth * heightStart
      return newIndex
    })

    return {
      size: [shapeWidth, shapeHeight],
      lifeMap: shapelifeMap
    }
  },
}

export default shapesHandler
