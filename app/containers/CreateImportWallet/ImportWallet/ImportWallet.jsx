// @flow
import React, { Fragment } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { FormattedMessage } from 'react-intl'

import { ROUTES } from '../../../core/constants'
import CloseButton from '../../../components/CloseButton'
import BackButton from '../../../components/BackButton'
import Button from '../../../components/Button'
import CreateImportWalletForm from '../../../components/CreateImportWalletForm'
import CreateImportSplitWalletForm from '../../../components/CreateImportSplitWalletForm'
import FullHeightPanel from '../../../components/Panel/FullHeightPanel'
import { loadWalletRecovery } from '../../Settings/Settings'
import ImportIcon from '../../../assets/icons/import.svg'
import AddIcon from '../../../assets/icons/add.svg'
import styles from './ImportWallet.scss'

/* eslint-disable react/no-unused-prop-types */
type Props = {
  authenticated: boolean,
  setAccounts: (Array<Object>) => any,
  showSuccessNotification: ({ message: string }) => string,
  showErrorNotification: ({ message: string }) => string,
  chain: string,
}

type State = {
  tabIndex: number,
}

const IMPORT_OPTIONS = {
  WIF: {
    render: (props: Props) => (
      <CreateImportWalletForm
        option="IMPORT"
        importKeyOption="WIF"
        authenticated={props.authenticated}
      />
    ),
    translationId: 'privateKeyLabel',
    display: 'Private Key',
    chainSupport: ['neo2', 'neo3'],
  },
  ENCRYPTED_WIF: {
    render: (props: Props) => (
      <CreateImportWalletForm
        option="IMPORT"
        importKeyOption="ENCRYPTED_WIF"
        authenticated={props.authenticated}
      />
    ),
    translationId: 'encryptedKeyLabel',
    display: 'Encrypted Key',
    chainSupport: ['neo2', 'neo3'],
  },

  SPLIT: {
    render: (props: Props) => (
      <CreateImportSplitWalletForm authenticated={props.authenticated} />
    ),
    translationId: 'splitKeyLabel',
    display: 'Split Key',
    chainSupport: ['neo2'],
  },

  RECOVER_WALLET: {
    render: (props: Props) => (
      <Fragment>
        <p className={styles.importRecoveryInstructions}>
          <FormattedMessage id="auth.import.recoveryInstructions" />
        </p>
        <div
          className={styles.buttonContainer}
          onClick={() => {
            loadWalletRecovery(
              props.showSuccessNotification,
              props.showErrorNotification,
              props.setAccounts,
            )
          }}
        >
          <Button
            renderIcon={AddIcon}
            type="submit"
            shouldCenterButtonLabelText
            primary
          >
            <FormattedMessage id="importFile" />
          </Button>
        </div>
      </Fragment>
    ),
    translationId: 'recoverWalletLabel',
    display: 'Recover Wallet',
    chainSupport: ['neo2', 'neo3'],
  },
}

export default class ImportWallet extends React.Component<Props, State> {
  state = {
    tabIndex: 0,
  }

  // $FlowFixMe
  options = Object.keys(IMPORT_OPTIONS).map(
    (key: string) => IMPORT_OPTIONS[key],
  )

  render = () => {
    const { tabIndex } = this.state
    const { authenticated, chain } = this.props
    const conditionalPanelProps = {}
    if (authenticated) {
      conditionalPanelProps.renderBackButton = () => (
        <BackButton routeTo={ROUTES.WALLET_MANAGER} />
      )
      conditionalPanelProps.renderCloseButton = () => (
        <CloseButton routeTo={ROUTES.DASHBOARD} />
      )
    } else {
      conditionalPanelProps.renderCloseButton = () => (
        <CloseButton routeTo={ROUTES.HOME} />
      )
    }

    return (
      <FormattedMessage id="authImportWallet">
        {translation => (
          <FullHeightPanel
            headerText={translation}
            renderInstructions={false}
            renderHeaderIcon={() => (
              <div className={styles.iconDisplay}>
                <ImportIcon />
              </div>
            )}
            {...conditionalPanelProps}
          >
            <div className={styles.tabContainer}>
              <Tabs
                selectedIndex={tabIndex}
                onSelect={tabIndex => this.setState({ tabIndex })}
                className="neon-tabs"
              >
                <TabList>
                  {this.options.map(
                    option =>
                      option.chainSupport &&
                      option.chainSupport.includes(chain) && (
                        <Tab key={option.display}>
                          <FormattedMessage id={option.translationId} />
                        </Tab>
                      ),
                  )}
                </TabList>
                <div>
                  {this.options.map(
                    option =>
                      option.chainSupport &&
                      option.chainSupport.includes(chain) && (
                        <TabPanel key={option.display}>
                          {option.render(this.props)}
                        </TabPanel>
                      ),
                  )}
                </div>
              </Tabs>
            </div>
          </FullHeightPanel>
        )}
      </FormattedMessage>
    )
  }
}
