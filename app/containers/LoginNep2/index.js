// @flow
import { compose } from 'recompose'
import { withActions, withProgress } from 'spunky'
import { injectIntl } from 'react-intl'

import LoginNep2 from './LoginNep2'
import withLoadingProp from '../../hocs/withLoadingProp'
import withFailureNotification from '../../hocs/withFailureNotification'
import pureStrategy from '../../hocs/helpers/pureStrategy'
import { nep2LoginActions } from '../../actions/authActions'
import withCameraAvailability from '../../hocs/withCameraAvailability'
import withChainData from '../../hocs/withChainData'

const mapActionsToProps = actions => ({
  loginNep2: ({ passphrase, encryptedWIF, chain }) =>
    actions.call({ passphrase, encryptedWIF, chain }),
})

export default compose(
  withChainData(),
  withActions(nep2LoginActions, mapActionsToProps),
  withLoadingProp(nep2LoginActions, { strategy: pureStrategy }),
  withFailureNotification(nep2LoginActions),
  withProgress(nep2LoginActions),
  withCameraAvailability,
  injectIntl,
)(LoginNep2)
