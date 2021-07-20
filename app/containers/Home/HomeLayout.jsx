// @flow
import React from 'react'
import classNames from 'classnames'
import { withActions } from 'spunky'
import { compose } from 'redux'
import { FormattedMessage } from 'react-intl'

import styles from './Home.scss'
import lightLogo from '../../assets/images/logo-light.png'
import darkLogo from '../../assets/images/logo-dark.png'
import withLanguageData from '../../hocs/withLanguageData'
import { updateSettingsActions } from '../../actions/settingsActions'
import LanguageSelect from '../../components/Inputs/LanguageSelect'
import Switch from '../../components/Inputs/Switch'

type Props = {
  children: React$Node,
  renderNavigation?: Function,
  theme: ThemeType,
  language: string,
  setLanguageSetting: (value: String) => void,
  setChain: (chain: string) => any,
  chain: string,
}

type State = {
  languageMenuOpen: boolean,
}

class HomeLayout extends React.Component<Props, State> {
  state = {
    languageMenuOpen: false,
  }

  updateChain = n3Toggled => {
    const chain = n3Toggled ? 'neo3' : 'neo2'
    this.props.setChain(chain)
  }

  render() {
    const {
      children,
      renderNavigation,
      theme,
      language,
      setLanguageSetting,
    } = this.props
    const dynamicImage = theme === 'Light' ? lightLogo : darkLogo
    const { languageMenuOpen } = this.state

    return (
      <div
        id="home"
        className={styles.homeContainer}
        onClick={() =>
          languageMenuOpen && this.setState({ languageMenuOpen: false })
        }
      >
        <div className={styles.innerHomeContainer}>
          <div className={styles.chainToggleContainer}>
            <h5>NEO LEGACY</h5>
            <Switch
              checked={this.props.chain === 'neo3'}
              handleCheck={this.updateChain}
            />

            <h5>N3</h5>
          </div>

          {renderNavigation && renderNavigation()}
          <LanguageSelect
            setLanguageSetting={setLanguageSetting}
            languageMenuOpen={languageMenuOpen}
            toggleMenu={languageMenuOpen => this.setState({ languageMenuOpen })}
            value={language}
          />
          <div
            className={
              renderNavigation
                ? classNames(
                    styles.logoWithNegativeMargin,
                    styles.logoContainer,
                  )
                : styles.logoContainer
            }
          >
            <img className={styles.logo} src={dynamicImage} alt="" />
          </div>
          <div className={styles.loginHeader}>
            <FormattedMessage id="authLogin" />
          </div>
          {children}
        </div>
      </div>
    )
  }
}

const mapSettingsActionsToProps = actions => ({
  setLanguageSetting: language => actions.call({ language }),
  setChain: chain =>
    actions.call({
      chain,
    }),
})

export default compose(
  withActions(updateSettingsActions, mapSettingsActionsToProps),
  withLanguageData(),
)(HomeLayout)
