// @flow
import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import BaseModal from '../BaseModal'
import ContactForm from '../../Contacts/ContactForm'

type Props = {
  address: string,
  hideModal: () => null,
  triggerSuccessNotification: (text: string) => void,
  onSave: (name: string, address: string, chain: string) => any,
  chain: string,
}

class AddContactModal extends Component<Props> {
  handleSubmit = (name: string, address: string) => {
    const { onSave, hideModal, triggerSuccessNotification, chain } = this.props

    onSave(name, address, chain)
    triggerSuccessNotification('Contact added.')
    hideModal()
  }

  render() {
    const { address, hideModal } = this.props

    return (
      <BaseModal hideModal={hideModal} height="600px">
        <ContactForm
          formAddress={address}
          submitLabel={<FormattedMessage id="addToContacts" />}
          onSubmit={this.handleSubmit}
        />
      </BaseModal>
    )
  }
}
export default AddContactModal
