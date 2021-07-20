// @flow
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withData } from 'spunky'
import { invert } from 'lodash-es'

import Transaction from './Transaction'
import withNetworkData from '../../../hocs/withNetworkData'
import withExplorerData from '../../../hocs/withExplorerData'
import withAuthData from '../../../hocs/withAuthData'
import { showModal } from '../../../modules/modal'
import { MODAL_TYPES } from '../../../core/constants'

import contactsActions from '../../../actions/contactsActions'
import withChainData from '../../../hocs/withChainData'

const mapDispatchToProps = dispatch => ({
  showAddContactModal: props =>
    dispatch(showModal(MODAL_TYPES.ADD_CONTACT, props)),
})

const mapContactsDataToProps = (contacts: Object) => ({
  contacts: invert(contacts),
})

export default compose(
  connect(
    null,
    mapDispatchToProps,
  ),
  withChainData(),
  withAuthData(),
  withData(contactsActions, mapContactsDataToProps),
  withNetworkData(),
  withExplorerData(),
)(Transaction)
