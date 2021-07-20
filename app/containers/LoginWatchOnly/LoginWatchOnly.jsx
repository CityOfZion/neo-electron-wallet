// @flow
import React from 'react'
import { FormattedMessage } from 'react-intl'

import Button from '../../components/Button'
import LoginIcon from '../../assets/icons/login.svg'
import styles from '../Home/Home.scss'
import TextInput from '../../components/Inputs/TextInput'

type Props = {
  watchOnlyLogin: ({ address: string, chain: string }) => void,
  chain: string,
}

type State = {
  address: string,
}

export default class LoginPrivateKey extends React.Component<Props, State> {
  state = {
    address: '',
  }

  render = () => {
    const { watchOnlyLogin, chain } = this.props
    const { address } = this.state

    return (
      <div id="loginPrivateKey" className={styles.flexContainer}>
        <form
          onSubmit={e => {
            e.preventDefault()
            watchOnlyLogin({ address, chain })
          }}
        >
          <React.Fragment>
            <div className={styles.centeredInput}>
              <FormattedMessage id="authWatchPlaceholder">
                {translation => (
                  <TextInput
                    placeholder={translation}
                    value={address}
                    onChange={(e: Object) =>
                      this.setState({ address: e.target.value })
                    }
                    autoFocus
                  />
                )}
              </FormattedMessage>
            </div>
            <div className={styles.loginButtonRow}>
              <Button
                id="loginButton"
                primary
                type="submit"
                renderIcon={LoginIcon}
                disabled={address.length < 10}
                shouldCenterButtonLabelText
              >
                <FormattedMessage id="authLogin" />
              </Button>
            </div>
          </React.Fragment>
        </form>
      </div>
    )
  }
}
