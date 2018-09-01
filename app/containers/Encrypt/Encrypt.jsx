// @flow
import React from 'react'
import { noop } from 'lodash'

import EncryptPanel from '../../components/Settings/EncryptPanel'
import styles from './Encrypt.scss'

type Props = {
  encryptPrivateKey: Function
}

export default class Encrypt extends React.Component<Props> {
  static defaultProps = {
    encryptPrivateKey: noop
  }

  render = () => {
    const { encryptPrivateKey } = this.props
    return (
      <div className={styles.encrypt}>
        <EncryptPanel
          title="Encrypt Private Key"
          handleSubmit={encryptPrivateKey}
        />
      </div>
    )
  }

  renderIcon = () => (
    <div>
      <LockIcon />
    </div>
  )
}