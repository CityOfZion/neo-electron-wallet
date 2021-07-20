// @flow
import React from 'react'
import type { Node } from 'react'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'
import { isEmpty } from 'lodash-es'
import classNames from 'classnames'

import { TX_TYPES } from '../../../core/constants'
import Button from '../../Button'
import PendingAbstract from './PendingAbstract'
import ClaimAbstract from './ClaimAbstract'
import SendAbstract from './SendAbstract'
import ReceiveAbstract from './ReceiveAbstract'
import InfoIcon from '../../../assets/icons/info.svg'
import { openExplorerTx } from '../../../core/explorer'
import Tooltip from '../../Tooltip'

import styles from './Transaction.scss'

type Props = {
  tx: TxEntryType,
  pendingTx: {
    asset: {
      symbol: string,
      image?: string,
    },
    blocktime: number,
    amount: string,
    to: string,
    confirmations: number,
  },
  networkId: string,
  explorer: ExplorerType,
  contacts: Object,
  showAddContactModal: ({ address: string }) => null,
  address: string,
  className?: string,
  isPending?: boolean,
  chain: string,
}

export default class Transaction extends React.Component<Props> {
  static defaultProps = {
    tx: {},
  }

  render = () => {
    const {
      tx: { type },
      className,
      isPending,
    } = this.props
    return (
      <div className={classNames(styles.transactionContainer, className)}>
        {this.renderAbstract(type)}
        {!isPending && (
          <Button
            className={styles.transactionHistoryButton}
            renderIcon={InfoIcon}
            onClick={this.handleViewTransaction}
          >
            <FormattedMessage id="activityViewTx" />
          </Button>
        )}
      </div>
    )
  }

  findContact = (address: string): Node | string => {
    const { contacts } = this.props
    if (contacts && !isEmpty(contacts)) {
      const label = contacts[address]
      return label ? (
        <Tooltip title={address} className={styles.largerFont}>
          {label}
        </Tooltip>
      ) : (
        address
      )
    }
    return address
  }

  displayModal = (address: string) => {
    this.props.showAddContactModal({ address })
  }

  handleViewTransaction = () => {
    const { networkId, explorer, tx, chain } = this.props
    const { txid } = tx
    openExplorerTx(networkId, explorer, txid, chain)
  }

  renderTxDate = (time: ?number) => {
    if (!time) {
      return null
    }

    return (
      <div className={styles.txDateContainer}>
        {moment.unix(time).format('MM/DD/YYYY | HH:mm:ss')}
      </div>
    )
  }

  renderAbstract = (type: string) => {
    const { isPending, address } = this.props
    const { time, label, amount, isNetworkFee, to, from, image } = this.props.tx
    const contactTo = this.findContact(to)
    const contactFrom = from && this.findContact(from)
    const contactToExists = contactTo !== to
    const contactFromExists = contactFrom !== from
    const logo = image && <img src={image} alt={`${label}`} />
    const txDate = this.renderTxDate(time)

    const abstractProps = {
      txDate,
      logo,
      contactTo,
      amount,
      contactFrom,
      contactToExists,
      findContact: this.findContact,
      showAddContactModal: this.displayModal,
      isNetworkFee,
      contactFromExists,
      from,
      address,
      ...this.props.tx,
    }

    if (isPending) {
      return (
        <PendingAbstract
          {...abstractProps}
          {...this.props.pendingTx}
          renderTxDate={this.renderTxDate}
        />
      )
    }

    switch (type) {
      case TX_TYPES.CLAIM:
        return <ClaimAbstract {...abstractProps} />
      case TX_TYPES.SEND:
        return <SendAbstract {...abstractProps} />
      case TX_TYPES.RECEIVE: {
        return <ReceiveAbstract {...abstractProps} />
      }
      default:
        console.warn('renderTxTypeIcon() invoked with an invalid argument!', {
          type,
        })
        return null
    }
  }
}
