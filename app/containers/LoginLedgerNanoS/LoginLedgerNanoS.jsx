// @flow
import React, { Component } from 'react'

import Page from '../../components/Page'
import HomeButtonLink from '../../components/HomeButtonLink'

import { ROUTES } from '../../core/constants'

import loginStyles from '../../styles/login.scss'

type Props = {
  ledgerNanoSGetLogin: Function,
  ledgerNanoSGetInfoAsync: Function,
  hardwareDeviceInfo: string,
  hardwarePublicKeyInfo: string,
  publicKey: string,
  history: Object
}
type State = {
  intervalId: number
}

export default class LoginLedgerNanoS extends Component<Props, State> {
  state = {
    intervalId: ''
  }

  componentDidMount () {
    const { ledgerNanoSGetInfoAsync } = this.props
    const intervalId = setInterval(async () => {
      await ledgerNanoSGetInfoAsync()
    }, 1000)
    this.setState({ intervalId })
  }

  shouldComponentUpdate (nextProps) {
    const { publicKey, hardwarePublicKeyInfo } = this.props
    if (nextProps.publicKey !== publicKey ||
        nextProps.hardwarePublicKeyInfo !== hardwarePublicKeyInfo) return true
    return false
  }

  componentWillUnmount () {
    clearInterval(this.state.intervalId)
  }

  onLedgerNanoSChange = () => {
    const { ledgerNanoSGetLogin, publicKey, history } = this.props
    if (publicKey) {
      ledgerNanoSGetLogin()
      history.push(ROUTES.DASHBOARD)
    }
  }

  render () {
    const { hardwareDeviceInfo, hardwarePublicKeyInfo, publicKey } = this.props
    return (
      <Page id='loginPage' className={loginStyles.loginPage}>
        <div className={loginStyles.title}>Login using the Ledger Nano S:</div>
        <div className={loginStyles.loginForm}>
          <div>
            <button className={!publicKey ? 'disabled' : ''} onClick={this.onLedgerNanoSChange}>Use Ledger Nano S</button>
            <HomeButtonLink />
          </div>
          <p>{hardwareDeviceInfo}</p>
          <p>{hardwarePublicKeyInfo}</p>
        </div>
      </Page>
    )
  }
}
