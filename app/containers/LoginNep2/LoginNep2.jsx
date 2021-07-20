// @flow
import React, { Component } from 'react'
import { type ProgressState } from 'spunky'
import { FormattedMessage, IntlShape } from 'react-intl'

import QrCodeScanner from '../../components/QrCodeScanner'
import Button from '../../components/Button'
import PasswordInput from '../../components/Inputs/PasswordInput'
import LoginIcon from '../../assets/icons/login.svg'
import styles from '../Home/Home.scss'
import GridIcon from '../../assets/icons/grid.svg'
import Close from '../../assets/icons/close.svg'

type Props = {
  loading: boolean,
  loginNep2: Function,
  cameraAvailable: boolean,
  progress: ProgressState,
  intl: IntlShape,
  chain: string,
}
type State = {
  encryptedWIF: string,
  passphrase: string,
  scannerActive: boolean,
}

export default class LoginNep2 extends Component<Props, State> {
  state = {
    encryptedWIF: '',
    passphrase: '',
    scannerActive: false,
  }

  toggleScanner = () => {
    this.setState(prevState => ({ scannerActive: !prevState.scannerActive }))
  }

  render() {
    const { loading, cameraAvailable, progress, intl } = this.props
    const { encryptedWIF, passphrase, scannerActive } = this.state

    return (
      <div id="loginNep2" className={styles.flexContainer}>
        <form onSubmit={this.handleSubmit}>
          {scannerActive ? (
            <React.Fragment>
              <div className={styles.scannerContainer}>
                <QrCodeScanner
                  callback={encryptedWIF =>
                    this.setState({ encryptedWIF, scannerActive: false })
                  }
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
                >
                  <FormattedMessage id="auth.cancel" />
                </Button>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div className={styles.inputMargin}>
                <PasswordInput
                  placeholder={intl.formatMessage({
                    id: 'inputEncryptedPlaceholder',
                  })}
                  autoFocus
                  value={encryptedWIF}
                  disabled={loading}
                  onChange={e =>
                    this.setState({ encryptedWIF: e.target.value })
                  }
                />
              </div>
              <FormattedMessage id="inputPasswordPlaceholder">
                {translaction => (
                  <PasswordInput
                    placeholder={translaction}
                    value={passphrase}
                    disabled={loading}
                    onChange={e =>
                      this.setState({ passphrase: e.target.value })
                    }
                  />
                )}
              </FormattedMessage>
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
                  className={styles.loginButtonMargin}
                  renderIcon={LoginIcon}
                  disabled={loading || !this.isValid()}
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

  handleSubmit = (event: Object) => {
    const { loading, loginNep2, chain } = this.props
    const { passphrase, encryptedWIF } = this.state

    event.preventDefault()

    if (!loading) {
      loginNep2({ passphrase, encryptedWIF, chain })
    }
  }

  isValid = () => this.state.encryptedWIF !== '' && this.state.passphrase !== ''
}
