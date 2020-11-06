// @flow
import React from 'react'
import classNames from 'classnames'
import { FormattedMessage, intlShape } from 'react-intl'

import { ROUTES, EXPLORERS } from '../../core/constants'
import FullHeightPanel from '../../components/Panel/FullHeightPanel'
import NeoLogo from '../../assets/icons/neo.svg'
import NodeSelectIcon from '../../assets/icons/node-select.svg'
import BlockExplorerIcon from '../../assets/icons/block-explorer.svg'
import CogIcon from '../../assets/icons/cog-icon.svg'
import CloseButton from '../../components/CloseButton'
import SettingsItem from '../../components/Settings/SettingsItem'
import StyledReactSelect from '../../components/Inputs/StyledReactSelect/StyledReactSelect'
import SettingsLink from '../../components/Settings/SettingsLink'
import settingsStyles from '../Settings/Settings.scss'
import NetworkSwitch from '../App/Sidebar/NetworkSwitch'

import styles from './NetworkConfiguration.scss'

type Props = {
  explorer: string,
  setBlockExplorer: string => any,
  selectedNode: string,
  intl: intlShape,
}

type State = {
  selectedExplorer: SelectOption,
}

export default class NetworkConfiguration extends React.Component<
  Props,
  State,
> {
  state = {
    selectedExplorer: {
      value: this.props.explorer,
      label: this.props.explorer,
    },
  }

  render() {
    const parsedExplorerOptions = Object.keys(EXPLORERS).map(key => ({
      value: key,
      label: EXPLORERS[key],
    }))

    const { intl } = this.props

    return (
      <FullHeightPanel
        containerClassName={styles.contentContainerStyle}
        className={styles.networkConfigPanel}
        headerText={<FormattedMessage id="networkSettingsLabel" />}
        renderCloseButton={() => <CloseButton routeTo={ROUTES.SETTINGS} />}
        renderHeaderIcon={() => <CogIcon />}
        instructionsClassName={styles.networkConfigInstructions}
        renderInstructions={() => (
          <div>
            <FormattedMessage id="networkSettingsInstructions" />
          </div>
        )}
      >
        <section
          className={classNames(
            settingsStyles.settingsItemsContainer,
            styles.networkItemsContainer,
          )}
        >
          <div className={settingsStyles.innerContainer}>
            <SettingsLink
              to={ROUTES.NODE_SELECT}
              label={this.props.selectedNode || 'AUTOMATIC'}
              renderIcon={() => <NodeSelectIcon />}
              title={intl.formatMessage({
                id: 'networkSettingsNodeSelectLabel',
              })}
            />

            <SettingsItem
              renderIcon={() => <BlockExplorerIcon />}
              title={intl.formatMessage({
                id: 'networkSettingsExplorerLabel',
              })}
            >
              <div className={settingsStyles.settingsSelectContainer}>
                <StyledReactSelect
                  settingsSelect
                  transparent
                  options={parsedExplorerOptions}
                  value={this.state.selectedExplorer}
                  onChange={this.updateExplorerSettings}
                  isSearchable={false}
                />
              </div>
            </SettingsItem>
            <SettingsItem
              renderIcon={() => <NeoLogo />}
              title={intl.formatMessage({
                id: 'networkSettingsCurrentLabel',
              })}
              noBorderBottom
            >
              <div className={styles.settingsSelectContainer}>
                <NetworkSwitch transparent settingsSelect />
              </div>
            </SettingsItem>
          </div>
        </section>
      </FullHeightPanel>
    )
  }

  updateExplorerSettings = (option: SelectOption) => {
    this.setState({ selectedExplorer: option })
    const { setBlockExplorer } = this.props
    setBlockExplorer(option.label)
  }
}
