// @flow
import { compose } from 'recompose'
import { withActions } from 'spunky'
import { trim } from 'lodash-es'
import { connect } from 'react-redux'

import { showSuccessNotification } from '../../../modules/notifications'

import AddContactModal from './AddContactModal'
import { addContactActions } from '../../../actions/contactsActions'
import withChainData from '../../../hocs/withChainData'

const mapContactActionsToProps = (actions: Object) => ({
  onSave: (name: string, address: string, chain: string) =>
    actions.call({ name: trim(name), address: trim(address), chain }),
})

const mapDispatchToProps = (dispatch: Function) => ({
  triggerSuccessNotification(text: string) {
    dispatch(showSuccessNotification({ message: text }))
  },
})

export default compose(
  connect(
    null,
    mapDispatchToProps,
  ),
  withChainData,
  withActions(addContactActions, mapContactActionsToProps),
)(AddContactModal)
