import React, { Component } from 'react'
import colorThemes from './config/colorThemes'
import IconGithub from './media/icon-github.svg'
import IconFacebook from './media/icon-facebook.svg'
import IconTwitter from './media/icon-twitter.svg'
import AboutModal from './controls/modals/AboutModal'
import pckg from '../package.json'
const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(pckg.description)}
&via=Sarcadass&url=${encodeURIComponent(pckg.url)}`
import './css/Footer.css'

export default class Footer extends Component {
  constructor(props) {
    super(props)
    this.state = { isAboutModalOpen: false }
    this.handleAboutModal = this.handleAboutModal.bind(this)
  }

  handleAboutModal(event) {
    if (event) event.preventDefault()
    this.setState(prevState => {
      return { isAboutModalOpen: !prevState.isAboutModalOpen }
    })
  }

  render() {
    return (
      <footer style={{ color: colorThemes[this.props.colorTheme].footerText }}>
        <div className="social-share-wrapper">
          {/* Github Link */}
          <a className="github" href="https://github.com/sarcadass/yagol" target="_blank" rel="noopener">
            <IconGithub width={20} height={20} fill={colorThemes[this.props.colorTheme].footerText} />
          </a>
          {/* Share on Facebook */}
          <a className="social-cta facebook" href={`http://www.facebook.com/sharer.php?u=${encodeURIComponent(pckg.url)}`} target="_blank" rel="noopener">
            <IconFacebook width={12} height={12} fill="#fff" /> Share on Facebook
          </a>
          {/* Share on Twitter */}
          <a className="social-cta twitter" href={twitterLink} target="_blank" rel="noopener">
            <IconTwitter width={12} height={12} fill="#fff" /> Share on Twitter
          </a>
          <AboutModal showModal={this.state.isAboutModalOpen}
                        handleShowModal={this.handleAboutModal}
                        colorTheme={this.props.colorTheme}
                        modalStyle={this.props.modalStyle}/>
        </div>

        <p className="credits-wrapper">
          <span className="first-row">
            <strong>Yagol v{pckg.version}. </strong>
            <a className="about-modal-cta"
               href="#open-about-modal"
               onClick={this.handleAboutModal}>
              About this project</a>.
          </span>
          Created by <a href="https://twitter.com/Sarcadass" target="_blank" rel="noopener">{pckg.author}</a>, {pckg.license} license.
        </p>
      </footer>
    )
  }
}
