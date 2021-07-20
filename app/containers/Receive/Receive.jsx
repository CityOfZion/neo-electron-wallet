// @flow
import React from 'react'
import { FormattedMessage } from 'react-intl'

import HeaderBar from '../../components/HeaderBar'
import ReceivePanel from '../../components/Receive/ReceivePanel'
import { PRICE_UNAVAILABLE } from '../../core/constants'
import { multiplyNumber } from '../../core/math'

import styles from './Receive.scss'

type Props = {
  sendableAssets: Object,
  address: string,
  accounts: Array<any>,
  prices: Object,
  showReceiveModal: Function,
  networkId: string,
}

type State = {
  walletName: ?string,
}

export default class Receive extends React.Component<Props, State> {
  static defaultProps = {
    accounts: [],
  }

  constructor(props: Props) {
    super(props)
    const walletName: ?string = props.accounts.reduce(
      (accum, account) =>
        props.address === account.address ? account.label : accum,
      null,
    )
    this.state = { walletName }
  }

  render() {
    const { address, showReceiveModal, networkId } = this.props

    const { walletName } = this.state

    return (
      <section className={styles.receiveContainer}>
        <FormattedMessage id="receivePageLabel">
          {t => <HeaderBar label={t} shouldRenderRefresh />}
        </FormattedMessage>
        <ReceivePanel
          address={address}
          networkId={networkId}
          onSubmit={props => showReceiveModal({ ...props, walletName })}
        />
      </section>
    )
  }

  // TODO: Move this logic to AmountsPanel / Centralized place
  createSendAmountsData() {
    const { sendableAssets, prices } = this.props

    const assets = Object.keys(sendableAssets)

    /* $FlowFixMe */
    return assets.map((asset: string) => {
      if (sendableAssets) {
        const { balance } = sendableAssets[asset]
        const currentBalance = balance
        const price = prices[asset]

        const totalBalanceWorth = price
          ? multiplyNumber(balance, price)
          : PRICE_UNAVAILABLE

        return {
          symbol: asset,
          totalBalance: balance,
          price,
          currentBalance,
          totalBalanceWorth,
        }
      }
      return {}
    })
  }
}
