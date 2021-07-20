// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { compose } from 'recompose'
import { withData, withActions, withCall } from 'spunky'

import ImportWallet from './ImportWallet'
import nodeStorageActions from '../../../actions/nodeStorageActions'
import accountsActions, {
  updateAccountsActions,
} from '../../../actions/accountsActions'
import {
  showErrorNotification,
  showSuccessNotification,
} from '../../../modules/notifications'
import withChainData from '../../../hocs/withChainData'

const actionCreators = {
  showErrorNotification,
  showSuccessNotification,
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionCreators, dispatch)

const mapAccountsDataToProps = accounts => ({
  accounts,
})

const mapAccountsActionsToProps = actions => ({
  setAccounts: accounts => actions.call(accounts),
})

export default compose(
  connect(
    null,
    mapDispatchToProps,
  ),
  withChainData(),
  withCall(nodeStorageActions),
  withData(accountsActions, mapAccountsDataToProps),
  withActions(updateAccountsActions, mapAccountsActionsToProps),
)(ImportWallet)
