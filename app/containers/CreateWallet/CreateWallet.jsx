// @flow

import React from 'react'
import { ROUTES } from '../../core/constants'

import PasswordInput from '../../components/Inputs/PasswordInput'
import TextInput from '../../components/Inputs/TextInput'
import CloseButton from '../../components/CloseButton'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import ImportIcon from '../../assets/icons/import.svg'
import CheckIcon from '../../assets/icons/check.svg'
import AddIcon from '../../assets/icons/add.svg'
import FullHeightPanel from '../../components/Panel/FullHeightPanel'
import styles from './CreateWallet.scss'

type Option = 'CREATE' | 'IMPORT'

type Props = {
  generateNewWalletAccount: Function,
  history: Object,
  option: Option,
  authenticated: boolean,
}

type State = {
  passphrase: string,
  passphrase2: string,
  passphraseValid: boolean,
  passphrase2Valid: boolean,
  passphraseError: string,
  passphrase2Error: string,
  wif: string,
  walletName: string,
  submitButtonDisabled: boolean,
}

const PASS_MIN_LENGTH = 4

export default class CreateWallet extends React.Component<Props, State> {
  state = {
    passphrase: '',
    passphrase2: '',
    passphraseValid: false,
    passphrase2Valid: false,
    passphraseError: '',
    passphrase2Error: '',
    wif: '',
    walletName: '',
    submitButtonDisabled: false,
  }

  createWalletAccount = (e: SyntheticMouseEvent<*>) => {
    this.setState({ submitButtonDisabled: true })
    e.preventDefault()
    const { history, option } = this.props
    const { passphrase, passphrase2, wif, walletName } = this.state
    const { generateNewWalletAccount, authenticated } = this.props
    generateNewWalletAccount(
      passphrase,
      passphrase2,
      option === 'IMPORT' ? wif : null,
      history,
      walletName,
      authenticated,
      () => this.setState({ submitButtonDisabled: false }),
    )
  }

  render = () => {
    const { passphraseError, passphrase2Error, wif, walletName } = this.state
    const { option, authenticated } = this.props
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
      <FullHeightPanel
        headerText={option === 'CREATE' ? 'Create New Wallet' : 'Import Wallet'}
        renderHeaderIcon={() =>
          option === 'IMPORT' ? (
            <div className={styles.iconDisplay}>
              <ImportIcon />
            </div>
          ) : (
            <div className={styles.iconDisplay}>
              <AddIcon />
            </div>
          )
        }
        {...conditionalPanelProps}
      >
        <div className={styles.inputContainer}>
          <div id="createWallet" className={styles.flexContainer}>
            <form
              className={styles.createWalletForm}
              onSubmit={this.createWalletAccount}
            >
              {option === 'IMPORT' && (
                <PasswordInput
                  value={wif}
                  label="Private Key"
                  onChange={e => this.setState({ wif: e.target.value })}
                  placeholder="Private Key"
                  autoFocus
                />
              )}
              <TextInput
                value={walletName}
                label="Wallet Name"
                onChange={e => this.setState({ walletName: e.target.value })}
                placeholder="Wallet Name"
                autoFocus={option !== 'IMPORT'}
              />
              <PasswordInput
                label="Passphrase"
                onChange={this.handleChangePassphrase}
                placeholder="Password"
                error={passphraseError}
              />
              <PasswordInput
                label="Confirm Passphrase"
                onChange={this.handleChangePassphrase2}
                placeholder="Confirm Password"
                error={passphrase2Error}
              />
              <div className={styles.loginButtonMargin}>
                <Button
                  renderIcon={option === 'IMPORT' ? CheckIcon : AddIcon}
                  type="submit"
                  shouldCenterButtonLabelText
                  primary
                  disabled={this.isDisabled()}
                >
                  {option === 'IMPORT' ? 'Import Wallet' : 'Create Wallet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </FullHeightPanel>
    )
  }

  handleChangePassphrase = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ passphrase: e.target.value }, this.validatePassphrase)
  }

  handleChangePassphrase2 = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ passphrase2: e.target.value }, this.validatePassphrase2)
  }

  validatePassphrase = () => {
    const { passphrase: p } = this.state
    // validate min char count
    const errorMessage =
      p && p.length < PASS_MIN_LENGTH
        ? `Passphrase must contain at least ${PASS_MIN_LENGTH} characters`
        : ''
    this.setState(
      {
        passphraseError: errorMessage,
        passphraseValid: !!(p && !errorMessage),
      },
      this.validatePassphrase2,
    )
  }

  validatePassphrase2 = () => {
    const { passphrase: p1, passphrase2: p2, passphraseValid } = this.state
    // validate phrases match
    const errorMessage =
      p1 && p2 && p1 !== p2 && passphraseValid ? 'Passphrases must match' : ''
    this.setState({
      passphrase2Error: errorMessage,
      passphrase2Valid: !!(p2 && !errorMessage),
    })
  }

  isDisabled = () => {
    const {
      passphraseValid,
      passphrase2Valid,
      wif,
      walletName,
      submitButtonDisabled,
    } = this.state
    const { option } = this.props
    const validPassphrase = passphraseValid && passphrase2Valid
    if (submitButtonDisabled) return true
    if (option === 'CREATE') {
      return !(validPassphrase && !!walletName)
    }
    return !(validPassphrase && !!walletName && !!wif)
  }
}
