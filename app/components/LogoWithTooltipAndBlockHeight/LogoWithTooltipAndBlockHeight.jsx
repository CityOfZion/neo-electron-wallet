// @flow
import React, { Fragment } from 'react'
import { FormattedMessage } from 'react-intl'

import Tooltip from '../Tooltip'
import NetworkConfigurationTooltip from '../NetworkConfigurationTooltip'
import LightLogoWithoutText from '../../assets/images/logo-without-text-black.png'
import DarkLogoWithoutText from '../../assets/images/logo-without-text.png'

import styles from '../../containers/App/Sidebar/Sidebar.scss'
import themes from '../../themes'
import IntlWrapper from '../Root/IntlWrapper'

type Props = {
  count: number,
  theme: string,
  store: any,
}

class LogoWithTooltipAndBlockHeight extends React.Component<Props> {
  render() {
    const { count, theme, store } = this.props

    const themeBasedLogo =
      theme === 'Light' ? LightLogoWithoutText : DarkLogoWithoutText

    return (
      <Tooltip
        position="left"
        interactive
        theme="network-settings"
        onShow={() => this.handleOnShow()}
        html={
          <IntlWrapper store={store}>
            <NetworkConfigurationTooltip store={store} />{' '}
          </IntlWrapper>
        }
      >
        <div className={styles.logo} id="neon-logo-container">
          <img src={themeBasedLogo} id="neon-logo" alt="neon-logo" />
        </div>

        <div id="block-height-container" className={styles.blockHeight}>
          {count && (
            <Fragment>
              <div id="block-height-label" className={styles.heightText}>
                <FormattedMessage id="sidebarCurrentBlock" />
              </div>
              <div id="block-height">{count.toLocaleString()}</div>
            </Fragment>
          )}
        </div>
      </Tooltip>
    )
  }

  handleOnShow = () => {
    const { theme } = this.props
    setTimeout(() => {
      const currentlySelectedThemeElement = document.querySelector(
        '.tippy-popper',
      )
      if (currentlySelectedThemeElement) {
        // $FlowFixMe
        currentlySelectedThemeElement.style = ''
        const styleString = Object.entries(themes[theme]).reduce(
          // eslint-disable-next-line
          (styleString, [propName, propValue]) => {
            // $FlowFixMe
            return `${styleString}${propName}:${propValue};`
          },
          '',
        )
        // $FlowFixMe
        currentlySelectedThemeElement.style = styleString
      }
    }, 1)
  }
}

export default LogoWithTooltipAndBlockHeight
