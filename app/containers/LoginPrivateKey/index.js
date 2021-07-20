// @flow
import { compose } from 'recompose'
import { withActions, withProgress } from 'spunky'

import LoginPrivateKey from './LoginPrivateKey'
import withFailureNotification from '../../hocs/withFailureNotification'
import withCameraAvailability from '../../hocs/withCameraAvailability'
import { n3WifLoginActions, wifLoginActions } from '../../actions/authActions'
import withChainData from '../../hocs/withChainData'

const mapWifLoginActionsToProps = actions => ({
  loginWithPrivateKey: wif => actions.call({ wif }),
})

const mapN3WifLoginActionsToProps = actions => ({
  loginWithN3PrivateKey: wif => actions.call({ wif }),
})

export default compose(
  withChainData(),
  withActions(wifLoginActions, mapWifLoginActionsToProps),
  withActions(n3WifLoginActions, mapN3WifLoginActionsToProps),
  withFailureNotification(wifLoginActions),
  withProgress(wifLoginActions),
  withCameraAvailability,
)(LoginPrivateKey)
