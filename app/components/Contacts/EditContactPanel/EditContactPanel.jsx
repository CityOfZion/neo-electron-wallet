// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import { noop } from 'lodash-es'
import { FormattedMessage, IntlShape } from 'react-intl'

import FullHeightPanel from '../../Panel/FullHeightPanel'
import ContactForm from '../ContactForm'
import ArrowIcon from '../../../assets/icons/arrow.svg'
import Close from '../../../assets/icons/close.svg'
import AddIcon from '../../../assets/icons/add.svg'
import BackButton from '../../BackButton'
import { ROUTES, MODAL_TYPES } from '../../../core/constants'
import styles from './EditContactPanel.scss'

type Props = {
  className: ?string,
  name: string,
  address: string,
  onSave: Function,
  deleteContact: (string, string) => void,
  showSuccessNotification: ({ message: string }) => void,
  showModal: (modalType: string, modalProps: Object) => any,
  intl: IntlShape,
  chain: string,
}

export default class EditContactPanel extends React.Component<Props> {
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
        headerText={<FormattedMessage id="editAContact" />}
        renderInstructions={() => (
          <div className={styles.editContactInstructions}>
            <div>
              <FormattedMessage id="modifyDetails" />
            </div>
            <span onClick={this.handleDelete}>
              <Close /> <FormattedMessage id="removeContact" />
            </span>
          </div>
        )}
      >
        <div className={styles.formContainer}>
          <ContactForm
            formName={name}
            mode="edit"
            formAddress={address}
            onSubmit={this.handleSubmit}
          />
        </div>
      </FullHeightPanel>
    )
  }

  renderHeader = () => (
    <span className={styles.header}>
      <Link to={ROUTES.CONTACTS} className={styles.back}>
        <ArrowIcon />
      </Link>
      <span>Edit Contact</span>
    </span>
  )

  handleSubmit = (name: string, address: string) => {
    const { chain } = this.props
    this.props.onSave(name, address, chain)
  }

  handleDelete = () => {
    const { name, showModal, showSuccessNotification, intl, chain } = this.props

    showModal(MODAL_TYPES.CONFIRM, {
      title: 'Confirm Delete',
      renderBody: () => (
        <div className={styles.confirmDeleteModalPrompt}>
          {`${intl.formatMessage({
            id: 'confirmRemoveContact',
          })}`}
          <h2>{name}</h2>
        </div>
      ),
      onClick: () => {
        this.props.deleteContact(name, chain)
        showSuccessNotification({
          message: 'Contact removal was successful.',
        })
      },
    })
  }
}
