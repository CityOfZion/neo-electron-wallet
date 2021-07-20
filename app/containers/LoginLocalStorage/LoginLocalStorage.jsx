// @flow
import React, { Component } from 'react'
import { cloneDeep } from 'lodash-es'
import { FormattedMessage } from 'react-intl'

import PasswordInput from '../../components/Inputs/PasswordInput'
import Button from '../../components/Button'
import StyledReactSelect from '../../components/Inputs/StyledReactSelect/StyledReactSelect'

import LoginIcon from '../../assets/icons/login.svg'
import styles from '../Home/Home.scss'

type Props = {
  loading: boolean,
  loginNep2: Function,
  accounts: Object,
  n3Accounts: Object,
  chain: string,
}

type State = {
  passphrase: string,
  selectedAccount: Object | null,
}

export default class LoginLocalStorage extends Component<Props, State> {
  static defaultProps = {
    accounts: [],
    n3Accounts: [],
  }

  state = {
    passphrase: '',
    selectedAccount: null,
  }

  returnMappedAccounts = () => {
    const { chain, n3Accounts, accounts } = this.props
    let dynamicMappedAccounts = cloneDeep(accounts)
    if (chain === 'neo3') {
      dynamicMappedAccounts = cloneDeep(n3Accounts)
    }
    return dynamicMappedAccounts.map(account => {
      const clonedAccount = cloneDeep(account)
      clonedAccount.value = account.label
      return clonedAccount
    })
  }

  render() {
    const { loading } = this.props
    const { passphrase, selectedAccount } = this.state
    return (
      <div id="loginLocalStorage" className={styles.flexContainer}>
        <form onSubmit={this.handleSubmit}>
          <div className={styles.selectMargin}>
            <StyledReactSelect
              value={selectedAccount}
              onChange={this.handleChange}
              options={this.returnMappedAccounts()}
            />
          </div>
          <div className={styles.inputMargin}>
            <FormattedMessage id="inputPasswordPlaceholder">
              {placeholder => (
                <PasswordInput
                  placeholder={placeholder}
                  value={passphrase}
                  disabled={loading}
                  onChange={e => this.setState({ passphrase: e.target.value })}
                />
              )}
            </FormattedMessage>
          </div>

          <Button
            id="loginButton"
            primary
            shouldCenterButtonLabelText
            type="submit"
            className={styles.loginButtonMargin}
            disabled={loading || !this.isValid()}
            renderIcon={() => <LoginIcon />}
          >
            <FormattedMessage id="authLogin" />
          </Button>
        </form>
      </div>
    )
  }

  handleChange = (selectedAccount: Object) => {
    this.setState({ selectedAccount })
  }

  handleSubmit = (event: Object) => {
    const { loading, loginNep2, accounts, chain } = this.props
    const { passphrase, selectedAccount } = this.state
    if (selectedAccount) {
      const accountInStorage = this.returnMappedAccounts().find(
        account => account.label === selectedAccount.value,
      )

      event.preventDefault()

      if (!loading) {
        loginNep2(passphrase, accountInStorage.key, chain)
      }
    }
  }

  isValid = () => !!this.state.selectedAccount && this.state.passphrase !== ''
}
