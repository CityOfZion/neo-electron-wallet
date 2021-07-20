// @flow
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import Home from './Home'
import authActions from '../../actions/authActions'
import withLoadingProp from '../../hocs/withLoadingProp'
import withThemeData from '../../hocs/withThemeData'
import pureStrategy from '../../hocs/helpers/pureStrategy'
import { showModal } from '../../modules/modal'
import withChainData from '../../hocs/withChainData'

const actionCreators = {
  showModal,
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionCreators, dispatch)

export default compose(
  connect(
    null,
    mapDispatchToProps,
  ),
  withLoadingProp(authActions, { strategy: pureStrategy }),
  withThemeData(),
  withChainData(),
)(Home)
