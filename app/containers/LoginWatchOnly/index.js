// @flow
import { compose } from 'recompose'
import { withActions, withProgress } from 'spunky'

import LoginWatchOnly from './LoginWatchOnly'
import withFailureNotification from '../../hocs/withFailureNotification'
import { watchOnlyLoginActions } from '../../actions/authActions'
import withChainData from '../../hocs/withChainData'

const mapActionsToProps = actions => ({
  watchOnlyLogin: ({ address, chain }) => actions.call({ address, chain }),
})

export default compose(
  withChainData(),
  withActions(watchOnlyLoginActions, mapActionsToProps),
  withFailureNotification(watchOnlyLoginActions),
  withProgress(watchOnlyLoginActions),
)(LoginWatchOnly)
