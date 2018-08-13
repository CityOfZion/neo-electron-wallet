// @flow
import React, { Component } from 'react'
import fs from 'fs'
import storage from 'electron-json-storage'

import { recoverWallet } from '../../modules/generateWallet'

import Panel from '../../components/Panel'
import SelectInput from '../../components/Inputs/SelectInput'
import UnderlinedHeader from '../../components/Headers/UnderlinedHeader'
import NetworkSwitch from '../../components/Settings/NetworkSwitch'
import SettingsItem from '../../components/Settings/SettingsItem'
import SettingsLink from '../../components/Settings/SettingsLink'
import WalletRecoveryPanel from '../../components/Settings/WalletRecoveryPanel'
import {
  EXPLORERS,
  MODAL_TYPES,
  CURRENCIES,
  ROUTES
} from '../../core/constants'
import themes from '../../themes'
import styles from './Settings.scss'
import Tooltip from '../../components/Tooltip'
import AddIcon from '../../assets/icons/add.svg'

const { dialog } = require('electron').remote

type Props = {
  setAccounts: (Array<Object>) => any,
  setBlockExplorer: string => any,
  explorer: string,
  setCurrency: string => any,
  currency: string,
  setTheme: string => any,
  theme: string,
  showModal: Function,
  showSuccessNotification: Object => any,
  showErrorNotification: Object => any
}

type State = {
  explorer: string
}

export default class Settings extends Component<Props, State> {
  state = {
    explorer: this.props.explorer,
    currency: this.props.currency
  }

  saveWalletRecovery = () => {
    const { showSuccessNotification, showErrorNotification } = this.props

    storage.get('userWallet', (errorReading, data) => {
      if (errorReading) {
        showErrorNotification({
          message: `An error occurred reading wallet file: ${
            errorReading.message
          }`
        })
        return
      }
      const content = JSON.stringify(data)
      dialog.showSaveDialog(
        {
          filters: [
            {
              name: 'JSON',
              extensions: ['json']
            }
          ]
        },
        fileName => {
          if (fileName === undefined) {
            return
          }
          // fileName is a string that contains the path and filename created in the save file dialog.
          fs.writeFile(fileName, content, errorWriting => {
            if (errorWriting) {
              showErrorNotification({
                message: `An error occurred creating the file: ${
                  errorWriting.message
                }`
              })
            } else {
              showSuccessNotification({
                message: 'The file has been succesfully saved'
              })
            }
          })
        }
      )
    })
  }

  loadWalletRecovery = () => {
    const {
      showSuccessNotification,
      showErrorNotification,
      setAccounts
    } = this.props

    dialog.showOpenDialog(fileNames => {
      // fileNames is an array that contains all the selected
      if (!fileNames) {
        return
      }
      const filepath = fileNames[0]
      fs.readFile(filepath, 'utf-8', (err, data) => {
        if (err) {
          showErrorNotification({
            message: `An error occurred reading the file: ${err.message}`
          })
          return
        }
        const walletData = JSON.parse(data)

        recoverWallet(walletData)
          .then(data => {
            showSuccessNotification({ message: 'Recovery was successful.' })
            setAccounts(data.accounts)
          })
          .catch(err => {
            showErrorNotification({
              message: `An error occurred recovering wallet: ${err.message}`
            })
          })
      })
    })
  }

  updateExplorerSettings = (e: Object) => {
    const { setBlockExplorer } = this.props
    setBlockExplorer(e)
  }

  updateCurrencySettings = (e: Object) => {
    const { setCurrency } = this.props
    setCurrency(e)
  }

  updateThemeSettings = (e: Object) => {
    const { setTheme } = this.props
    setTheme(e)
  }

  deleteWalletAccount = (label: string, key: string) => {
    const {
      showSuccessNotification,
      showErrorNotification,
      setAccounts,
      showModal
    } = this.props

    showModal(MODAL_TYPES.CONFIRM, {
      title: 'Confirm Delete',
      text: `Please confirm deleting saved wallet - ${label}`,
      onClick: () => {
        storage.get('userWallet', (readError, data) => {
          if (readError) {
            showErrorNotification({
              message: `An error occurred reading previously stored wallet: ${
                readError.message
              }`
            })
            return
          }

          data.accounts = reject(data.accounts, { key })

          storage.set('userWallet', data, saveError => {
            if (saveError) {
              showErrorNotification({
                message: `An error occurred updating the wallet: ${
                  saveError.message
                }`
              })
            } else {
              showSuccessNotification({
                message: 'Account deletion was successful.'
              })
              setAccounts(data.accounts)
            }
          })
        })
      }
    })
  }

  openTokenModal = () => {
    this.props.showModal(MODAL_TYPES.TOKEN)
  }

  render() {
    const { explorer, currency, theme } = this.props

    return (
      <section className={styles.settingsContainer}>
        <UnderlinedHeader text="Settings">
          <NetworkSwitch />
          <Tooltip title="Add Token" className={styles.headerButtonContainer}>
            <AddIcon className={styles.add} />
            <span>Add Token</span>
          </Tooltip>
        </UnderlinedHeader>
        <Panel
          className={styles.settingsPanel}
          renderHeader={this.renderHeader}
        >
          <section className={styles.settingsItemsContainer}>
            <SettingsItem title="THEME">
              <SelectInput
                items={Object.keys(themes)}
                value={theme}
                onChange={this.updateThemeSettings}
              />
            </SettingsItem>
            <SettingsItem title="CURRENCY">
              <SelectInput
                items={Object.keys(CURRENCIES).map(value =>
                  value.toUpperCase()
                )}
                value={currency.toUpperCase()}
                onChange={this.updateCurrencySettings}
                getItemValue={value => value.toLowerCase()}
              />
            </SettingsItem>
            <SettingsItem title="BLOCK EXPLORER">
              <SelectInput
                items={Object.keys(EXPLORERS).map(value => EXPLORERS[value])}
                value={explorer}
                onChange={this.updateExplorerSettings}
              />
            </SettingsItem>
            <SettingsLink route="" title="ENCRYPT A KEY" />
            <WalletRecoveryPanel
              title="WALLET RECOVERY"
              loadWalletRecovery={this.loadWalletRecovery}
              saveWalletRecovery={this.saveWalletRecovery}
            />
            <div className={styles.settingsDonations}>
              Created by CoZ. Donations: Adr3XjZ5QDzVJrWvzmsTTchpLRRGSzgS5A
            </div>
          </section>
        </Panel>
      </section>
    )
  }

  renderHeader = () => (
    <div className={styles.settingsPanelHeader}>
      <div className={styles.settingsPanelHeaderItem}>
        Manage your neon wallet
      </div>
      <div className={styles.settingsPanelHeaderItem}>
        Community Support: https://discordapp.com/invite/R8v48YA
      </div>
    </div>
  )
}
