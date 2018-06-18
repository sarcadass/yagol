let notif
const displayNotification = options =>
  notif.addNotification({
    title: options.title,
    message: options.message,
    position: options.position || 'bc',
    level: options.level || 'info',
    autoDismiss: options.autoDismiss || 4,
    action: options.action || null
  })
const isNotificationAlreadyOpen = title => {
  if (notif.state.notifications.length) {
    for (let i = 0; i < notif.state.notifications.length; i++) {
      if (notif.state.notifications[i].title === title) return true
    }
  }
  return false
}

export default {
  init: notificationSystem => notif = notificationSystem,

  clearAll: () => notif.clearNotifications(),

  /* APP */
  showNeighborsCountDisabled: () => displayNotification({
    title: 'Show Neighbors count disabled',
    message: 'The show neighbors counter is disabled when the cell size is under 10 pixels.',
  }),

  cellBorderSizeChanged: () => displayNotification({
    title: 'Cell/Border Size changed',
    message: 'The cell/border size has changed to adapt the grid size to the shape size.',
  }),

  shapeIsTooBig: () => displayNotification({
    title: 'Shape is too big',
    message: 'Shape is too big to fit in the canvas. Try to enlarge your window then reset and reload the shape.',
    level: 'error',
    autoDismiss: 8
  }),

  shapeLoadedAndSaved: () => displayNotification({
    title: 'Shape loaded',
    message: 'The shape has been successfully loaded and saved in your custom shapes library.',
    level: 'success',
    autoDismiss: 6
  }),

  cellOrBorderSizeTooBig: () => displayNotification({
    title: 'Cell or border is too big',
    message: 'Please reduce the cell or border size.',
    level: 'error'
  }),

  resizeGridPrompt: callback => {
    const title = 'Window size changed'
    if (!isNotificationAlreadyOpen(title)) {
      return displayNotification({
        title: title,
        message: 'Do you want to adapt the game size to your new window size?',
        level: 'info',
        action: { label: 'Resize grid', callback }
      })
    }
  },

  /* CONTROLS */
  cantSaveShape: message => displayNotification({
    title: "Can't save shape",
    message,
    level: 'warning',
    autoDismiss: 6
  }),

  /* MANAGE SHAPES MODAL */
  shapeSuccessfullyLoaded: () => displayNotification({
    title: 'Shape successfully loaded',
    message: 'The shape has been successfully loaded in the game.',
    level: 'success'
  }),

  shapeLinkCopied: () => displayNotification({
    title: 'Shape link copied',
    message: 'The shape link has been copied into your clipboard.',
    level: 'success'
  }),

  shapeLinkNotCopied: error => displayNotification({
    title: "Shape link can't be copied",
    message: `Error while copying the shape link into your clipboard. Error: ${error}`,
    level: 'error'
  }),

  /* IMPORT SHAPES MODAL */
  wrongShapeExportString: () => displayNotification({
    title: 'Wrong shape export string',
    message: 'The shape export string you have entered is invalid.',
    level: 'error'
  }),

  shapeAlreadyExists: shapeName => displayNotification({
    title: 'This shape already exists',
    message: `The shape you trying to import already exists with the name: ${shapeName}.`,
    level: 'warning'
  }),

  shapeSuccessfullyImported: shapeName => displayNotification({
    title: 'Shape successfully imported',
    message: 'The shape has been successfully imported and saved in your custom shapes.',
    level: 'success'
  })
}
