// @flow
import React from 'react'
import { withRouter } from 'react-router-dom'
import { intlShape } from 'react-intl'

import PasswordInput from '../Inputs/PasswordInput'
import TextInput from '../Inputs/TextInput'
import Button from '../Button'
import CheckIcon from '../../assets/icons/check.svg'
import AddIcon from '../../assets/icons/add.svg'
import styles from './CreateImportWalletForm.scss'

type Option = 'CREATE' | 'IMPORT'

type Props = {
  generateNewWalletAccount: Function,
  history: Object,
  option: Option,
  importKeyOption: 'WIF' | 'ENCRYPTED_WIF',
  authenticated: boolean,
  intl: intlShape,
  chain: string,
}

type State = {
  passphrase: string,
  passphrase2: string,
  passphraseValid: boolean,
  passphrase2Valid: boolean,
  passphraseError: string,
  passphrase2Error: string,
  key: string,
  walletName: string,
  submitButtonDisabled: boolean,
}

const PASS_MIN_LENGTH = 4

const LOOKUP_KEY = {
  WIF: 'privateKey',
  ENCRYPTED_WIF: 'inputEncryptedPlaceholder',
}

class CreateImportWalletForm extends React.Component<Props, State> {
  state = {
    passphrase: '',
    passphrase2: '',
    passphraseValid: false,
    passphrase2Valid: false,
    passphraseError: '',
    passphrase2Error: '',
    key: '',
    walletName: '',
    submitButtonDisabled: false,
  }

  render = () => {
    const { passphraseError, passphrase2Error, key, walletName } = this.state
    const { option, importKeyOption, intl } = this.props
    const {
      walletCreationWalletNamePlaceholder,
      walletCreationWalletNameLabel,
      walletCreationWalletPasswordLabel,
      walletCreationWalletPasswordPlaceholder,
      walletCreationWalletPasswordConfirmLabel,
      walletCreationWalletPasswordConfirmPlaceholder,
      authCreateWallet,
      authImportWallet,
    } = this.getTranslations()

    return (
      <div id="createWallet" className={styles.flexContainer}>
        <form
          className={
            option === 'IMPORT'
              ? styles.importWalletForm
              : styles.createWalletForm
          }
          onSubmit={this.createWalletAccount}
        >
          {option === 'IMPORT' && (
            <div>
              <PasswordInput
                value={key}
                label={intl.formatMessage({
                  id: LOOKUP_KEY[importKeyOption],
                })}
                onChange={e => this.setState({ key: e.target.value })}
                placeholder={intl.formatMessage({
                  id: LOOKUP_KEY[importKeyOption],
                })}
                autoFocus
              />
            </div>
          )}
          <TextInput
            value={walletName}
            label={walletCreationWalletNameLabel}
            onChange={e => this.setState({ walletName: e.target.value })}
            placeholder={walletCreationWalletNamePlaceholder}
            autoFocus={option !== 'IMPORT'}
          />
          <PasswordInput
            label={walletCreationWalletPasswordLabel}
            onChange={this.handleChangePassphrase}
            placeholder={walletCreationWalletPasswordPlaceholder}
            error={passphraseError}
          />
          <PasswordInput
            label={walletCreationWalletPasswordConfirmLabel}
            onChange={this.handleChangePassphrase2}
            placeholder={walletCreationWalletPasswordConfirmPlaceholder}
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
              {option === 'IMPORT' ? authImportWallet : authCreateWallet}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  createWalletAccount = (e: SyntheticMouseEvent<*>) => {
    this.setState({ submitButtonDisabled: true })
    e.preventDefault()
    const { history, option, importKeyOption } = this.props
    const { passphrase, passphrase2, key, walletName } = this.state
    const { generateNewWalletAccount, authenticated, chain } = this.props

    generateNewWalletAccount(
      passphrase,
      passphrase2,
      option === 'IMPORT' ? key : null,
      null,
      option === 'IMPORT' ? importKeyOption : 'WIF',
      history,
      walletName,
      authenticated,
      () => this.setState({ submitButtonDisabled: false }),
      chain,
    )
  }

  getTranslations = () => {
    const { intl } = this.props
    const walletCreationWalletNamePlaceholder = intl.formatMessage({
      id: 'walletCreationWalletNamePlaceholder',
    })
    const walletCreationWalletNameLabel = intl.formatMessage({
      id: 'walletCreationWalletNameLabel',
    })

    const walletCreationWalletPasswordLabel = intl.formatMessage({
      id: 'walletCreationWalletPasswordLabel',
    })

    const walletCreationWalletPasswordPlaceholder = intl.formatMessage({
      id: 'walletCreationWalletPasswordPlaceholder',
    })

    const walletCreationWalletPasswordConfirmLabel = intl.formatMessage({
      id: 'walletCreationWalletPasswordConfirmLabel',
    })

    const walletCreationWalletPasswordConfirmPlaceholder = intl.formatMessage({
      id: 'walletCreationWalletPasswordConfirmPlaceholder',
    })

    const authCreateWallet = intl.formatMessage({
      id: 'authCreateWallet',
    })

    const authImportWallet = intl.formatMessage({
      id: 'authImportWallet',
    })

    return {
      walletCreationWalletNamePlaceholder,
      walletCreationWalletNameLabel,
      walletCreationWalletPasswordLabel,
      walletCreationWalletPasswordPlaceholder,
      walletCreationWalletPasswordConfirmLabel,
      walletCreationWalletPasswordConfirmPlaceholder,
      authCreateWallet,
      authImportWallet,
    }
  }

  handleChangePassphrase = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ passphrase: e.target.value }, this.validatePassphrase)
  }

  handleChangePassphrase2 = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ passphrase2: e.target.value }, this.validatePassphrase2)
  }

  validatePassphrase = () => {
    const { passphrase: p } = this.state
    const { intl } = this.props
    // validate min char count
    const errorMessage =
      p && p.length < PASS_MIN_LENGTH
        ? intl.formatMessage(
            {
              id: 'errors.password.length',
            },
            { PASS_MIN_LENGTH },
          )
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
    const { intl } = this.props
    // validate phrases match
    const errorMessage =
      p1 && p2 && p1 !== p2 && passphraseValid
        ? intl.formatMessage({ id: 'errors.password.match' })
        : ''
    this.setState({
      passphrase2Error: errorMessage,
      passphrase2Valid: !!(p2 && !errorMessage),
    })
  }

  isDisabled = () => {
    const {
      passphraseValid,
      passphrase2Valid,
      key,
      walletName,
      submitButtonDisabled,
    } = this.state
    const { option } = this.props
    const validPassphrase = passphraseValid && passphrase2Valid
    if (submitButtonDisabled) return true
    if (option === 'CREATE') {
      return !(validPassphrase && !!walletName)
    }
    return !(validPassphrase && !!walletName && !!key)
  }
}

export default withRouter(CreateImportWalletForm)
