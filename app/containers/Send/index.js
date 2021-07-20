// @flow
import { compose } from 'recompose'
import { values, omit } from 'lodash-es'
import { withData } from 'spunky'
import { connect, type MapStateToProps } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl } from 'react-intl'

import Send from './Send'
import { sendTransaction } from '../../modules/transactions'
import { showModal } from '../../modules/modal'
import { getNotifications } from '../../modules/notifications'
import withPricesData from '../../hocs/withPricesData'
import withNetworkData from '../../hocs/withNetworkData'
import withAuthData from '../../hocs/withAuthData'
import withBalancesData from '../../hocs/withBalancesData'
import withCurrencyData from '../../hocs/withCurrencyData'
import withFilteredTokensData from '../../hocs/withFilteredTokensData'
import contactsActions from '../../actions/contactsActions'
import balancesActions from '../../actions/balancesActions'
import withSuccessNotification from '../../hocs/withSuccessNotification'
import withFailureNotification from '../../hocs/withFailureNotification'
import { MODAL_TYPES } from '../../core/constants'
import withTokensData from '../../hocs/withTokensData'
import withChainData from '../../hocs/withChainData'

const mapDispatchToProps = (dispatch: Function) =>
  bindActionCreators(
    {
      sendTransaction,
      showSendModal: props => dispatch(showModal(MODAL_TYPES.SEND, props)),
      showGeneratedTransactionModal: props =>
        dispatch(showModal(MODAL_TYPES.GENERATED_TRANSACTION, props)),
      showImportModal: props =>
        dispatch(showModal(MODAL_TYPES.IMPORT_TRANSACTION, props)),
    },
    dispatch,
  )

const mapStateToProps: MapStateToProps<*, *, *> = (state: Object) => ({
  notification: getNotifications(state),
})

const filterSendableAssets = (balances: Object) => {
  const sendableAssets = {}
  if (balances) {
    if (Number(balances.NEO > 0)) {
      sendableAssets.NEO = { symbol: 'NEO', balance: balances.NEO }
    }

    if (Number(balances.GAS > 0)) {
      sendableAssets.GAS = { symbol: 'GAS', balance: balances.GAS }
    }

    values(omit(balances, 'NEO', 'GAS'))
      .filter(token => token.balance > 0)
      .forEach(token => {
        sendableAssets[token.symbol] = {
          symbol: token.symbol,
          balance: token.balance,
        }
      })
  }

  return sendableAssets
}

const mapPricesDataToProps = (prices: Object) => ({
  prices,
})

const mapContactsDataToProps = (contacts: Object) => ({ contacts })

const mapBalanceDataToProps = (balances: Object) => ({
  NEO: balances ? balances.NEO : 0,
  GAS: balances ? balances.GAS : 0,
  tokenBalances: values(omit(balances, 'NEO', 'GAS')),
  sendableAssets: filterSendableAssets(balances),
})

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withChainData(),
  withTokensData(),
  withBalancesData(mapBalanceDataToProps),
  withCurrencyData('currencyCode'),
  withData(contactsActions, mapContactsDataToProps),
  withPricesData(mapPricesDataToProps),
  withNetworkData(),
  withAuthData(),
  withFilteredTokensData(),
  withSuccessNotification(
    balancesActions,
    'notifications.success.receivedBlockchainInfo',
    {},
    true,
  ),
  withFailureNotification(
    balancesActions,
    'notifications.failure.blockchainInfoFailure',
    {},
    true,
  ),
  injectIntl,
)(Send)
