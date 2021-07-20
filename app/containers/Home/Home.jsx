// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { FormattedMessage } from 'react-intl'

import LoginPrivateKey from '../LoginPrivateKey'
import LoginNep2 from '../LoginNep2'
import LoginLedgerNanoS from '../LoginLedgerNanoS'
import LoginLocalStorage from '../LoginLocalStorage'
import LoginWatchOnly from '../LoginWatchOnly'
import Button from '../../components/Button'
import styles from './Home.scss'
import AddIcon from '../../assets/icons/add.svg'
import ImportIcon from '../../assets/icons/import.svg'
import { ROUTES, MODAL_TYPES } from '../../core/constants'
import HomeLayout from './HomeLayout'
import pack from '../../../package.json'

type State = {
  tabIndex: number,
}
type Props = {
  loading: boolean,
  theme: ThemeType,
  showModal: (modalType: string, modalProps: Object) => any,
  chain: string,
}

const LOGIN_OPTIONS = {
  LOCAL_STORAGE: {
    render: () => <LoginLocalStorage />,
    displayKey: 'Saved',
    renderDisplayMessage: () => <FormattedMessage id="authSaved" />,
    chainSupport: ['neo2', 'neo3'],
  },
  PRIVATE_KEY: {
    render: () => <LoginPrivateKey />,
    displayKey: 'Private',
    renderDisplayMessage: () => <FormattedMessage id="authPrivate" />,
    chainSupport: ['neo2', 'neo3'],
  },
  NEP2: {
    render: () => <LoginNep2 />,
    displayKey: 'Encrypted',
    renderDisplayMessage: () => <FormattedMessage id="authEncrypted" />,
    chainSupport: ['neo2', 'neo3'],
  },

  watch: {
    render: () => <LoginWatchOnly />,
    displayKey: 'Watch',
    renderDisplayMessage: () => <FormattedMessage id="authWatch" />,
    chainSupport: ['neo2', 'neo3'],
  },
  ledger: {
    render: () => <LoginLedgerNanoS />,
    displayKey: 'Ledger',
    renderDisplayMessage: () => <FormattedMessage id="authLedger" />,
    chainSupport: ['neo2'],
  },
}

// NOTE: all other solutions seemed to be overly
// complex... Revisit this if it becomes painful
const shouldRenderReleaseNotes = version => {
  const displayWhitelist = ['2.6.0', '2.6.1', '2.6.2']
  if (
    displayWhitelist.includes(version) &&
    !localStorage.getItem(`hasSeenReleaseNotes-${version}`)
  ) {
    return true
  }
  return false
}

export default class Home extends React.Component<Props, State> {
  state = {
    tabIndex: 0,
  }

  // $FlowFixMe
  options = Object.keys(LOGIN_OPTIONS).map((key: string) => LOGIN_OPTIONS[key])

  renderReleaseNotesModal = () => {
    this.props.showModal(MODAL_TYPES.RELEASE_NOTES, {
      renderBody: () => (
        <div className={styles.confirmDeleteModalPrompt}>
          Please confirm removing saved wallet
        </div>
      ),
    })
  }

  render() {
    const { loading, theme, chain } = this.props

    if (shouldRenderReleaseNotes(pack.version)) {
      // Allow users to view the normal for 1 second
      // befre rendering the release notes modal
      setTimeout(() => {
        this.renderReleaseNotesModal()
      }, 1000)
      localStorage.setItem(`hasSeenReleaseNotes-${pack.version}`, 'true')
    }

    return (
      <HomeLayout theme={theme} chain={chain}>
        <div className={styles.inputContainer}>
          <Tabs
            selectedIndex={this.state.tabIndex}
            onSelect={tabIndex => this.setState({ tabIndex })}
            className="neon-tabs"
          >
            <TabList>
              {this.options.map(
                option =>
                  option.chainSupport &&
                  option.chainSupport.includes(chain) && (
                    <Tab key={option.displayKey}>
                      {option.renderDisplayMessage()}
                    </Tab>
                  ),
              )}
            </TabList>
            <div className={styles.loginContentContainer}>
              {this.options.map(
                option =>
                  option.chainSupport &&
                  option.chainSupport.includes(chain) && (
                    <TabPanel
                      key={option.displayKey}
                      selectedClassName={styles.homeTabPanel}
                    >
                      {option.render()}
                    </TabPanel>
                  ),
              )}
            </div>
          </Tabs>
          <div className={styles.buttonRow}>
            <div className={styles.buttonContainer}>
              <Link to={ROUTES.CREATE_WALLET}>
                <Button disabled={loading} renderIcon={AddIcon}>
                  <FormattedMessage id="authCreateWallet" />
                </Button>
              </Link>
            </div>
            <div className={styles.buttonContainer}>
              <Link to={ROUTES.IMPORT_WALLET}>
                <Button disabled={loading} renderIcon={ImportIcon}>
                  <FormattedMessage id="authImportWallet" />
                </Button>
              </Link>
            </div>
          </div>
          <div
            onClick={this.renderReleaseNotesModal}
            className={styles.versionNumber}
          >{`v${pack.version}`}</div>
        </div>
      </HomeLayout>
    )
  }
}
