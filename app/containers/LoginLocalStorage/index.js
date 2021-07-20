// @flow
import { compose } from 'recompose'
import { withData, withActions } from 'spunky'

import LoginLocalStorage from './LoginLocalStorage'
import accountsActions from '../../actions/accountsActions'
import n3AccountsActions from '../../actions/n3AccountsActions'
import { nep2LoginActions } from '../../actions/authActions'
import withLoadingProp from '../../hocs/withLoadingProp'
import withFailureNotification from '../../hocs/withFailureNotification'
import pureStrategy from '../../hocs/helpers/pureStrategy'
import withChainData from '../../hocs/withChainData'

const mapAccountsDataToProps = accounts => ({
  accounts,
})

const mapN3AccountsDataToProps = accounts => ({
  n3Accounts: accounts,
})

const mapActionsToProps = actions => ({
  loginNep2: (passphrase, encryptedWIF, chain) =>
    actions.call({ passphrase, encryptedWIF, chain }),
})

export default compose(
  withChainData(),
  withData(accountsActions, mapAccountsDataToProps),
  withData(n3AccountsActions, mapN3AccountsDataToProps),
  withActions(nep2LoginActions, mapActionsToProps),
  withLoadingProp(nep2LoginActions, { strategy: pureStrategy }),
  withFailureNotification(nep2LoginActions),
)(LoginLocalStorage)
