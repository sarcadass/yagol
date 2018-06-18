/* Default config */
export default {
  // Responsive
  mobileThreshold: 560,
  // Basic
  bodyPaddingX: 14,
  bodyPaddingY: 28,
  randomSeedThreshold: 4, // (100 / n)% alive cells
  colorTheme: 'default (light)', // See './colorThemes.js'
  // Options
  isControlsOpen: true,
  isOptionsOpen: false,
  showNeighborsCount: false,
  randomSeed: false,
  timeCompressionList: [
    [1000, '1 iteration / second'],
    [500, '2 iterations / second'],
    [250, '4 iterations / second'],
    [125, '8 iterations / second'],
    [0, 'Real Time']
  ],
  timeCompression: 250,
  cellSizesList: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
  cellSize: 12,
  borderSizesList: [0, 1, 2, 3, 4, 5, 6],
  borderSize: 1,
  // Modal style
  modalStyle: {
    overlay: { backgroundColor: 'rgba(0, 0, 0, .5)' },
    content: {
      position: 'absolute',
      width: '260px',
      background: 'rgba(0,0,0,.75)',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      outline: 'none',
      padding: '15px'
    }
  }
}
