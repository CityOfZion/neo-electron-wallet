// @flow
import React from 'react'
import { noop } from 'lodash-es'
import { FormattedMessage } from 'react-intl'

import FullHeightPanel from '../../Panel/FullHeightPanel'
import ContactForm from '../ContactForm'
import { ROUTES } from '../../../core/constants'
import AddIcon from '../../../assets/icons/add.svg'
import BackButton from '../../BackButton'

import styles from './AddContactPanel.scss'

type Props = {
  className: ?string,
  name: string,
  address: string,
  onSave: Function,
  chain: string,
}

export default class AddContactPanel extends React.Component<Props> {
  static defaultProps = {
    name: '',
    address: '',
    setName: noop,
    setAddress: noop,
    onSave: noop,
  }

  render() {
    const { className, name, address } = this.props

    return (
      <FullHeightPanel
        className={className}
        renderHeaderIcon={() => <AddIcon />}
        renderBackButton={() => <BackButton routeTo={ROUTES.CONTACTS} />}
        headerText={<FormattedMessage id="addAContact" />}
        renderInstructions={() => (
          <div>
            {' '}
            <FormattedMessage id="addContactDetails" />
          </div>
        )}
      >
        <div className={styles.formContainer}>
          <ContactForm
            formName={name}
            newAddress
            formAddress={address}
            submitLabel={<FormattedMessage id="addToContacts" />}
            onSubmit={this.handleSubmit}
          />
        </div>
      </FullHeightPanel>
    )
  }

  handleSubmit = (name: string, address: string) => {
    const { chain } = this.props
    this.props.onSave(name, address, chain)
  }
}
