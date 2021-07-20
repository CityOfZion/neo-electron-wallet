// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { compose, withProps } from 'recompose'
import { withActions, progressValues } from 'spunky'
import { trim } from 'lodash-es'
import { injectIntl } from 'react-intl'

import EditContactPanel from './EditContactPanel'
import {
  updateContactActions,
  deleteContactActions,
} from '../../../actions/contactsActions'
import {
  showErrorNotification,
  showSuccessNotification,
} from '../../../modules/notifications'
import withProgressChange from '../../../hocs/withProgressChange'
import withFailureNotification from '../../../hocs/withFailureNotification'
import { showModal } from '../../../modules/modal'
import withChainData from '../../../hocs/withChainData'

const { LOADED } = progressValues

const actionCreators = {
  showModal,
  showErrorNotification,
  showSuccessNotification,
}

const mapContactActionsToProps = (actions, props) => ({
  onSave: (name, address, chain) =>
    actions.call({
      oldName: props.oldName,
      newName: trim(name),
      newAddress: trim(address),
      chain,
    }),
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionCreators, dispatch)

const mapDeleteContactActionsToProps = actions => ({
  deleteContact: (name, chain) => actions.call({ name, chain }),
})

export default compose(
  connect(
    null,
    mapDispatchToProps,
  ),
  withProps(({ name }) => ({ oldName: name })),
  withProgressChange(
    updateContactActions,
    LOADED,
    (state, props) => props.onSave && props.onSave(),
  ),
  withChainData(),
  withActions(updateContactActions, mapContactActionsToProps),
  withActions(deleteContactActions, mapDeleteContactActionsToProps),
  withFailureNotification(deleteContactActions),
  withFailureNotification(updateContactActions),
  injectIntl,
)(EditContactPanel)
