// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { compose } from 'recompose'
import {
  withProgressComponents,
  alreadyLoadedStrategy,
  progressValues,
} from 'spunky'

import appActions from '../../actions/appActions'
import authActions from '../../actions/authActions'
import accountActions from '../../actions/accountActions'
import withLoginRedirect from '../../hocs/auth/withLoginRedirect'
import withLogoutRedirect from '../../hocs/auth/withLogoutRedirect'
import withLogoutReset from '../../hocs/auth/withLogoutReset'
import withInitialCall from '../../hocs/withInitialCall'
import withAuthData from '../../hocs/withAuthData'
import withThemeData from '../../hocs/withThemeData'
import { checkVersion } from '../../modules/metadata'
import { showErrorNotification } from '../../modules/notifications'

import App from './App'
import Loading from './Loading'
import n3AccountsActions from '../../actions/n3AccountsActions'

const { LOADING } = progressValues

const actionCreators = {
  checkVersion,
  showErrorNotification,
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionCreators, dispatch)

export default compose(
  // Old way of fetching data, need to refactor this out...
  connect(
    null,
    mapDispatchToProps,
  ),

  // Provide authenticated state so dashboard knows what layout to use.
  withAuthData(),

  // Fetch the initial network type, and pass it down as a prop.  This must come before other data
  // fetches that depend on knowing the selected network.
  withInitialCall(appActions),
  withProgressComponents(
    appActions,
    {
      // TODO: seems to be a spunky race condition here in terms of applying the theme (minor severity)
      [LOADING]: withThemeData()(Loading),
      // [FAILED]: Failed
    },
    {
      strategy: alreadyLoadedStrategy,
    },
  ),

  // Navigate to the home or dashboard when the user logs in or out.
  withLoginRedirect,
  withLogoutRedirect,

  // Remove stale data from store on logout
  withLogoutReset(authActions),
  withLogoutReset(accountActions),
  withLogoutReset(n3AccountsActions),
)(App)
