// @flow
import React from 'react'
import { type ProgressState } from 'spunky'
import { FormattedMessage } from 'react-intl'

import QrCodeScanner from '../../components/QrCodeScanner'
import Button from '../../components/Button'
import PasswordInput from '../../components/Inputs/PasswordInput/PasswordInput'
import LoginIcon from '../../assets/icons/login.svg'
import GridIcon from '../../assets/icons/grid.svg'
import Close from '../../assets/icons/close.svg'
import styles from '../Home/Home.scss'

type Props = {
  loginWithPrivateKey: (content: string) => void,
  loginWithN3PrivateKey: (content: string) => void,
  cameraAvailable: boolean,
  progress: ProgressState,
  chain: string,
}

type State = {
  wif: string,
  scannerActive: boolean,
}

export default class LoginPrivateKey extends React.Component<Props, State> {
  state = {
    wif: '',
    scannerActive: false,
  }

  toggleScanner = () => {
    this.setState(prevState => ({ scannerActive: !prevState.scannerActive }))
  }

  render = () => {
    const {
      loginWithPrivateKey,
      loginWithN3PrivateKey,
      cameraAvailable,
      progress,
      chain,
    } = this.props
    const { wif, scannerActive } = this.state

    return (
      <div id="loginPrivateKey" className={styles.flexContainer}>
        <form
          onSubmit={e => {
            e.preventDefault()
            return chain === 'neo3'
              ? loginWithN3PrivateKey(wif)
              : loginWithPrivateKey(wif)
          }}
        >
          {scannerActive ? (
            <React.Fragment>
              <div className={styles.scannerContainer}>
                <QrCodeScanner
                  callback={loginWithPrivateKey}
                  callbackProgress={progress}
                  width="316"
                  height="178"
                />
              </div>
              <div className={styles.loginButtonRowScannerActive}>
                <Button
                  id="scan-private-key-qr-button"
                  renderIcon={Close}
                  onClick={this.toggleScanner}
                  primary
                >
                  <FormattedMessage id="auth.cancel" />
                </Button>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div className={styles.centeredInput}>
                <FormattedMessage id="authPrivateKeyPlaceholder">
                  {translation => (
                    <PasswordInput
                      textInputClassName={styles.privateKeyInput}
                      placeholder={translation}
                      value={wif}
                      onChange={(e: Object) =>
                        this.setState({ wif: e.target.value })
                      }
                      autoFocus
                    />
                  )}
                </FormattedMessage>
              </div>
              <div className={styles.loginButtonRow}>
                <Button
                  id="scan-private-key-qr-button"
                  primary
                  renderIcon={GridIcon}
                  onClick={this.toggleScanner}
                  disabled={!cameraAvailable}
                >
                  <FormattedMessage id="authScanQRButton" />
                </Button>
                <Button
                  id="loginButton"
                  primary
                  type="submit"
                  renderIcon={LoginIcon}
                  disabled={wif.length < 10}
                >
                  <FormattedMessage id="authLogin" />
                </Button>
              </div>
            </React.Fragment>
          )}
        </form>
      </div>
    )
  }
}
