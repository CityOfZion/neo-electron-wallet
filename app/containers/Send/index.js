// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Send from './Send'
import { sendTransaction, toggleAsset, sendEvent, clearTransactionEvent } from '../../modules/transactions'
import { togglePane } from '../../modules/dashboard'

const mapStateToProps = (state) => ({
  neo: state.wallet.Neo,
  gas: state.wallet.Gas,
  selectedAsset: state.transactions.selectedAsset,
  confirmPane: state.dashboard.confirmPane
})

const actionCreators = {
  sendTransaction,
  toggleAsset,
  togglePane,
  sendEvent,
  clearTransactionEvent
}

const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Send)
