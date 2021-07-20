// @flow
import React from 'react'
import { uniqueId, get } from 'lodash-es'
import { wallet } from '@cityofzion/neon-js'
import { wallet as n3Wallet } from '@cityofzion/neon-js-next'
import { FormattedMessage, IntlShape } from 'react-intl'

import {
  toNumber,
  toBigNumber,
  multiplyNumber,
  minusNumber,
  addNumber,
} from '../../core/math'
import { isBlacklisted } from '../../core/wallet'
import { PRICE_UNAVAILABLE } from '../../core/constants'
import AmountsPanel from '../../components/AmountsPanel'
import SendPanel from '../../components/Send/SendPanel'
import HeaderBar from '../../components/HeaderBar'

import styles from './Send.scss'

const MAX_NUMBER_OF_RECIPIENTS = 25

type Props = {
  sendableAssets: Object,
  prices: Object,
  sendTransaction: ({
    sendEntries: Array<SendEntryType>,
    fees: number,
  }) => Object,
  contacts: Object,
  currencyCode: string,
  address: string,
  shouldRenderHeaderBar: boolean,
  location: Object,
  showSendModal: (props: Object) => any,
  tokens: Array<TokenItemType>,
  networkId: string,
  isWatchOnly?: boolean,
  showGeneratedTransactionModal: Object => void,
  showImportModal: (props: Object) => void,
  intl: IntlShape,
  chain: string,
}

type State = {
  showConfirmSend: boolean,
  pendingTransaction: boolean,
  sendSuccess: boolean,
  sendError: boolean,
  sendErrorMessage: string,

  txid: string,
  fees: number,
  sendRowDetails: Array<Object>,
  address?: string,
}

export default class Send extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      showConfirmSend: false,
      pendingTransaction: false,
      sendSuccess: false,
      sendError: false,
      sendErrorMessage: '',
      txid: '',
      sendRowDetails: [],
      fees: 0,
    }
  }

  static defaultProps = {
    shouldRenderHeaderBar: true,
    tokens: [],
  }

  componentDidMount() {
    this.setState((prevState: Object) => {
      const newState = [...prevState.sendRowDetails]

      newState.push(this.generateRow())

      return { sendRowDetails: newState }
    })
    if (this.props.location && this.props.location.state) {
      const { address } = this.props.location.state
      if (address) {
        this.updateRowField(0, 'address', address)
      }
    }
  }

  pushQRCodeData = (data: Object) => {
    const { sendRowDetails } = this.state
    const { asset, address, amount } = data
    const firstRowEmpty =
      sendRowDetails.length === 1 && !parseInt(sendRowDetails[0].amount, 10)

    if (firstRowEmpty) {
      if (asset) this.updateRowField(0, 'asset', asset)
      if (address) this.updateRowField(0, 'address', address)
      if (amount) this.updateRowField(0, 'amount', amount)
    } else {
      this.addRow(data)
    }
  }

  generateRow = (row: Object = {}) => {
    const { sendableAssets } = this.props
    const sendableAssetNames = Object.keys(sendableAssets)
    const firstSendableAssetName = sendableAssetNames[0]

    if (sendableAssetNames.length > 0) {
      return {
        asset: row.asset || firstSendableAssetName,
        amount: row.amount || 0,
        address: row.address || '',
        max: this.calculateMaxValue(row.asset || firstSendableAssetName),
        id: uniqueId(),
        errors: {},
      }
    }
    return {
      errors: {},
    }
  }

  // TODO: Move this logic to AmountsPanel / Centralized place
  createSendAmountsData = () => {
    const { sendableAssets, prices } = this.props

    const assets = Object.keys(sendableAssets)

    return (assets.map((asset: string) => {
      const { balance } = sendableAssets[asset]
      const price = prices[asset]

      const totalBalanceWorth = price
        ? multiplyNumber(balance, price)
        : PRICE_UNAVAILABLE

      return {
        symbol: asset,
        totalBalance: balance,
        price,
        totalBalanceWorth,
      }
    }): Array<*>)
  }

  removeRow = (index: number) => {
    this.setState((prevState: Object) => {
      const newState = [...prevState.sendRowDetails]

      if (newState.length > 1) {
        newState.splice(index, 1)
      }
      return { sendRowDetails: newState }
    })
  }

  addRow = (row?: Object) => {
    this.setState((prevState: Object) => {
      const newState = [...prevState.sendRowDetails]

      if (newState.length < MAX_NUMBER_OF_RECIPIENTS) {
        newState.push(this.generateRow(row))
        return { sendRowDetails: newState }
      }
      return prevState
    })
  }

  updateRowField = (index: number, field: string, value: string) => {
    this.setState((prevState: Object) => {
      const newState = [...prevState.sendRowDetails]
      const objectToModify = newState[index]
      objectToModify[field] = value

      if (field === 'asset') {
        objectToModify.amount = 0
        const maxValue = this.calculateMaxValue(objectToModify.asset)
        objectToModify.max = maxValue
      }

      if (field === 'amount' && value) {
        objectToModify.max = this.calculateMaxValue(objectToModify.asset, index)
      }

      if (field === 'address') {
        objectToModify.address = value
      }
      return { sendRowDetails: newState }
    })
  }

  calculateMaxValue = (asset: string, index: number = 0) => {
    const { sendableAssets } = this.props
    if (sendableAssets[asset]) {
      const rows = [...this.state.sendRowDetails]
      const rowsWithAsset = rows.filter(row => row.asset === asset)
      const existingAmounts = this.calculateRowAmounts(asset, index)
      const decimals = this.calculateDecimals(asset)
      const totalSendableAssets = toBigNumber(sendableAssets[asset].balance)
      if (rowsWithAsset.length === 1 || rowsWithAsset.length === 0) {
        return toNumber(sendableAssets[asset].balance).toFixed(decimals)
      }
      return minusNumber(totalSendableAssets, existingAmounts).toFixed(decimals)
    }
    return '0'
  }

  calculateRowAmounts = (asset: string, index: number) => {
    const rows = [...this.state.sendRowDetails]
    rows.splice(index, 1)
    if (rows.length > 0) {
      return (rows
        .filter((row: Object) => row.asset === asset)
        .map((row: Object) => get(row, 'amount', 0))
        .reduce(
          (accumulator: Object, currentValue: number | void) =>
            accumulator.plus(currentValue || 0),
          toBigNumber(0),
        ): number)
    }
    return 0
  }

  calculateDecimals = (asset: string) => {
    const { tokens, networkId } = this.props
    let decimals = 8
    if (asset === 'NEO') {
      decimals = 0
    }
    if (asset === 'GAS') {
      decimals = 8
    } else {
      const foundToken: TokenItemType | void = tokens.find(
        token => token.symbol === asset && token.networkId === networkId,
      )
      if (foundToken) {
        decimals = get(foundToken, 'decimals', 8)
      }
    }
    return decimals
  }

  resetViews = () => {
    this.setState(() => {
      const newState = []

      newState.push(this.generateRow())

      return {
        showConfirmSend: false,
        sendSuccess: false,
        sendRowDetails: newState,
        fees: 0,
      }
    })
  }

  handleSubmit = (generateTransaction: boolean = false) => {
    const rows = [...this.state.sendRowDetails]
    const promises = rows.map((row: Object, index: number) =>
      this.validateRow(row, index),
    )

    if (this.validateRowAmounts(rows)) {
      Promise.all(promises).then(values => {
        const isValid = values.every((result: boolean) => result)

        if (isValid && !this.props.isWatchOnly && !generateTransaction) {
          this.setState({ showConfirmSend: true })
        }
        if ((isValid && this.props.isWatchOnly) || generateTransaction) {
          this.handleSend(true)
        }
      })
    }
  }

  validateRowAmounts = (rows: Array<any>) => {
    const { sendableAssets, intl } = this.props

    let validAmounts = true

    rows.reduce((accum, currRow, index) => {
      if (accum[currRow.asset]) {
        // eslint-disable-next-line
        accum[currRow.asset] = addNumber(
          accum[currRow.asset],
          toBigNumber(currRow.amount),
        )
        if (
          toBigNumber(accum[currRow.asset]).greaterThan(
            toBigNumber(sendableAssets[currRow.asset].balance),
          )
        ) {
          const { errors } = this.state.sendRowDetails[index]

          const error = intl.formatMessage(
            { id: 'errors.send.balance' },
            { total: accum[currRow.asset], asset: currRow.asset },
          )

          errors.amount = error

          this.updateRowField(index, 'errors', errors)
          validAmounts = false
        }
      } else {
        // eslint-disable-next-line
        accum[currRow.asset] = toBigNumber(currRow.amount)
      }
      return accum
    }, {})

    return validAmounts
  }

  handleSend = (showTransactionModal: boolean = false) => {
    const {
      sendTransaction,
      isWatchOnly,
      showGeneratedTransactionModal,
      chain,
    } = this.props

    const { sendRowDetails, fees } = this.state

    const entries = sendRowDetails.map((row: Object) => ({
      address: row.address,
      amount: toNumber(row.amount.toString()),
      symbol: row.asset,
    }))

    this.setState({ pendingTransaction: true })
    sendTransaction({
      sendEntries: entries,
      fees,
      isWatchOnly: isWatchOnly || showTransactionModal,
      chain,
    })
      .then((result: Object) => {
        if (isWatchOnly || showTransactionModal) {
          this.setState({ pendingTransaction: false })
          showGeneratedTransactionModal(result)
        } else {
          this.setState({
            sendSuccess: true,
            txid: result.txid,
            pendingTransaction: false,
          })
        }
      })
      .catch((error: Object) => {
        // TODO: here is where we must generate the expected txId locally
        // and then add it to our pending tx arr
        this.setState({
          sendError: true,
          sendErrorMessage: error.message,
          pendingTransaction: false,
        })
      })
  }

  handleEditRecipientsClick = () => this.setState({ showConfirmSend: false })

  handleAddPriorityFee = (fees: number) => this.setState({ fees })

  validateRow = async (row: Object, index: number) => {
    const validAmount = this.validateAmount(
      row.amount,
      row.max,
      row.asset,
      index,
    )
    const validAddress = await this.validateAddress(row.address, index)

    return validAmount && validAddress
  }

  validateAmount = (
    amount: number,
    max: number,
    asset: string,
    index: number,
  ) => {
    const { errors } = this.state.sendRowDetails[index]
    const { tokens, networkId, intl } = this.props

    const amountNum = Number(amount)

    if (typeof amountNum !== 'number') {
      errors.amount = intl.formatMessage({ id: 'errors.send.number' })
    }

    if (asset === 'NEO' && !toBigNumber(amountNum).isInteger()) {
      errors.amount = intl.formatMessage({ id: 'errors.send.fraction' })
    }

    if (amountNum < 0) {
      errors.amount = intl.formatMessage(
        { id: 'errors.send.negative' },
        { asset },
      )
    }

    if (amountNum === 0) {
      errors.amount = intl.formatMessage({ id: 'errors.send.zero' }, { asset })
    }

    if (amountNum > max) {
      errors.amount = intl.formatMessage(
        { id: 'errors.send.balance' },
        { asset, total: amount },
      )
    }

    if (asset !== 'NEO' && asset !== 'GAS') {
      let decimalPlaces = 0
      const amountStr = amountNum.toString()
      const decPointIndex = amountStr.indexOf('.')

      if (decPointIndex !== -1) {
        decimalPlaces = amountStr.length - 1 - decPointIndex
      }

      const foundToken: TokenItemType | void = tokens.find(
        token => token.symbol === asset && token.networkId === networkId,
      )

      if (
        foundToken &&
        decimalPlaces > toNumber(get(foundToken, 'decimals', 8))
      ) {
        const decimalError = intl.formatMessage(
          { id: 'errors.send.decimal' },
          {
            asset,
            decimalCount: get(foundToken, 'decimals', 8),
          },
        )
        errors.amount = decimalError
      }
    }

    if (errors.amount) {
      this.updateRowField(index, 'errors', errors)
      return false
    }
    return true
  }

  validateAddress = async (formAddress: string, index: number) => {
    const { intl, chain } = this.props
    const { errors } = this.state.sendRowDetails[index]

    if (chain === 'neo3') {
      if (!n3Wallet.isAddress(formAddress)) {
        errors.address = intl.formatMessage({
          id: 'errors.send.invalidAddress',
        })
        if (errors.address) {
          this.updateRowField(index, 'errors', errors)
          return false
        }
      }
    } else {
      if (!wallet.isAddress(formAddress)) {
        errors.address = intl.formatMessage({
          id: 'errors.send.invalidAddress',
        })
      }

      const blackListedAddress = await isBlacklisted(formAddress)
      if (blackListedAddress) {
        errors.address = intl.formatMessage({ id: 'errors.send.blackListed' })
      }

      if (errors.address) {
        this.updateRowField(index, 'errors', errors)
        return false
      }
    }

    return true
  }

  clearErrors = (index: number, field: string) => {
    this.setState((prevState: Object) => {
      const newState = [...prevState.sendRowDetails]

      const objectToClear = newState[index]

      if (get(objectToClear, ['errors', field])) {
        objectToClear.errors[field] = null
      }

      return newState
    })
  }

  resetViewsAfterError = () =>
    this.setState({ sendError: false, sendErrorMessage: '' })

  render() {
    const {
      sendRowDetails,
      showConfirmSend,
      sendSuccess,
      sendError,
      sendErrorMessage,
      txid,
      fees,
      pendingTransaction,
    } = this.state
    const {
      sendableAssets,
      contacts,
      currencyCode,
      shouldRenderHeaderBar,
      address,
      showSendModal,
      isWatchOnly,
      showImportModal,
      chain,
    } = this.props
    const noSendableAssets = Object.keys(sendableAssets).length === 0

    return (
      <section className={styles.sendContainer}>
        {shouldRenderHeaderBar && (
          <HeaderBar
            label={<FormattedMessage id="sendPageLabel" />}
            shouldRenderRefresh
          />
        )}
        {!noSendableAssets && (
          <AmountsPanel
            amountsData={this.createSendAmountsData()}
            currencyCode={currencyCode}
          />
        )}
        <SendPanel
          calculateMaxValue={this.calculateMaxValue}
          maxNumberOfRecipients={MAX_NUMBER_OF_RECIPIENTS}
          sendRowDetails={sendRowDetails}
          sendableAssets={sendableAssets}
          showConfirmSend={showConfirmSend}
          pendingTransaction={pendingTransaction}
          sendSuccess={sendSuccess}
          sendError={sendError}
          sendErrorMessage={sendErrorMessage}
          noSendableAssets={noSendableAssets}
          contacts={contacts}
          txid={txid}
          addRow={this.addRow}
          removeRow={this.removeRow}
          updateRowField={this.updateRowField}
          clearErrors={this.clearErrors}
          handleSubmit={this.handleSubmit}
          handleAddPriorityFee={this.handleAddPriorityFee}
          fees={fees}
          address={address}
          resetViewsAfterError={this.resetViewsAfterError}
          handleEditRecipientsClick={this.handleEditRecipientsClick}
          handleSend={this.handleSend}
          resetViews={this.resetViews}
          showSendModal={showSendModal}
          pushQRCodeData={this.pushQRCodeData}
          isWatchOnly={isWatchOnly}
          showImportModal={showImportModal}
          chain={chain}
        />
      </section>
    )
  }
}
