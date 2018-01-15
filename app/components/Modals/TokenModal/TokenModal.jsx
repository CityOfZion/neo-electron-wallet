// @flow
import React, { Component } from 'react'
import { reject } from 'lodash'

import { getNewTokenItem, validateTokens } from './utils'

import BaseModal from '../BaseModal'
import Button from '../../Button'
import Row from './Row'

import Add from 'react-icons/lib/md/add'

import styles from './TokenModal.scss'

type Props = {
    hideModal: () => any,
    networks: Array<NetworkItemType>,
    setUserGeneratedTokens: Function,
    tokens: Array<TokenItemType>,
    showErrorNotification: (Object) => any
}

type InputErrorType = 'label' | 'url'

type State = {
  tokens: Array<TokenItemType>,
  networkId: string,
  errorItemId: ?number,
  errorType: ?InputErrorType
}

class TokenModal extends Component<Props, State> {
  state = {
    tokens: this.props.tokens,
    networkId: this.props.networks[0].id,
    errorItemId: null,
    errorType: null
  }

  deleteToken = (id: string) => {
    const { tokens } = this.state

    this.setState({
      tokens: reject(tokens, { id })
    })
  }

  addToken = () => {
    const { tokens, networkId } = this.state
    this.setState({
      tokens: [
        ...tokens,
        getNewTokenItem(networkId)
      ]
    })
  }

  saveAndValidateTokens = () => {
    const { setUserGeneratedTokens, hideModal, showErrorNotification } = this.props
    const { tokens } = this.state
    const { errorMessage, errorType, errorItemId } = validateTokens(tokens)

    if (errorMessage) {
      showErrorNotification({ message: errorMessage })
      this.setState({
        errorItemId,
        errorType
      })
    } else {
      setUserGeneratedTokens(tokens)
      hideModal()
    }
  }

  updateToken = (id: string, newValue: TokenItemType) => {
    const { tokens } = this.state
    const updatedTokens = [...tokens]
    const tokenIndex = updatedTokens.findIndex((token) => token.id === id)
    updatedTokens[tokenIndex] = newValue

    this.setState({
      tokens: updatedTokens,
      errorItemId: null,
      errorType: null
    })
  }

  updateNetworkId = (e: Object) => {
    this.setState({
      networkId: e.target.value
    })
  }

  render () {
    const { hideModal, networks } = this.props
    const { tokens, errorItemId, errorType, networkId } = this.state

    return (
      <BaseModal
        title='Manage Tokens'
        hideModal={hideModal}
        style={{
          content: {
            width: '600px',
            height: '500px'
          }
        }}
      >
        <div className={styles.container}>
          <div className={styles.addToken}>
            <Button onClick={this.addToken}><Add /> Add a new token</Button>
            <div className={styles.switchNetworkContainer}>
              <span className={styles.switchNetworkLabel}>Network:</span>
              <select defaultValue={networkId} onChange={this.updateNetworkId}>
                {networks.map(({ label, id }: NetworkItemType) =>
                  <option key={`networkOption${id}`} value={id}>{label}</option>
                )}
              </select>
            </div>

          </div>
          <form onSubmit={(e) => {
            e.preventDefault()
            this.saveAndValidateTokens()
          }}>
            <div className={styles.rowsContainer}>
              {tokens.filter(token => token.networkId === networkId).map((token: TokenItemType) => (
                <Row
                  token={token}
                  isSymbolInvalid={errorItemId === token.id && errorType === 'symbol'}
                  isScriptHashInvalid={errorItemId === token.id && errorType === 'scriptHash'}
                  onChangeSymbol={(symbol: SymbolType) => this.updateToken(token.id, { ...token, symbol })}
                  onChangeScriptHash={(scriptHash: string) => this.updateToken(token.id, { ...token, scriptHash })}
                  onDelete={() => this.deleteToken(token.id)}
                  key={`tokenOption${token.id}`}
                />
              ))}
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={this.saveAndValidateTokens}>Save</Button>
              <Button cancel onClick={hideModal}>Cancel</Button>
            </div>
          </form>
        </div>
      </BaseModal>
    )
  }
}

export default TokenModal
