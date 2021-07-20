// @flow
import { connect } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
import { injectIntl } from 'react-intl'

import CreateImportWalletForm from './CreateImportWalletForm'
import { generateNewWalletAccount } from '../../modules/generateWallet'
import withChainData from '../../hocs/withChainData'

const actionCreators = {
  generateNewWalletAccount,
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionCreators, dispatch)

export default compose(
  connect(
    null,
    mapDispatchToProps,
  ),
  withChainData(),
)(injectIntl(CreateImportWalletForm))
