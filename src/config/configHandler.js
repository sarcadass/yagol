import defaultConfig from './defaultConfig'
import colorThemes from '../config/colorThemes'

export default {
  save: configToSave => {
    let savedConfig = localStorage.getItem('savedConfig')
    let newConfig = savedConfig ? JSON.parse(savedConfig) : {}
    Object.assign(newConfig, configToSave)
    localStorage.setItem('savedConfig', JSON.stringify(newConfig))
  },

  get: () => ({
    ...defaultConfig,
    ...JSON.parse(localStorage.getItem('savedConfig'))
  }),

  getModalStyle: theme => ({
    overlay: defaultConfig.modalStyle.overlay,
    content: {
      ...defaultConfig.modalStyle.content,
      ...{
        background: colorThemes[theme].controlsBackground,
        color: colorThemes[theme].footerText,
        borderColor: colorThemes[theme].footerText,
      }
    }
  })
}
