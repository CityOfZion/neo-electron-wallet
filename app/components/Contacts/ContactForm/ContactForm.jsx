// @flow
import React from 'react'
import { noop } from 'lodash-es'
import { FormattedMessage, intlShape } from 'react-intl'
import { wallet } from '@cityofzion/neon-js'
import { wallet as n3Wallet } from '@cityofzion/neon-js-next'

import Button from '../../Button'
import TextInput from '../../Inputs/TextInput'
import DialogueBox from '../../DialogueBox'
import AddContactIcon from '../../../assets/icons/contacts-add.svg'
import WarningIcon from '../../../assets/icons/warning.svg'
import styles from './ContactForm.scss'

type Props = {
  submitLabel: string,
  formName: string,
  formAddress: string,
  mode?: string,
  contacts: Object,
  setName: Function,
  newAddress?: boolean,
  setAddress: Function,
  onSubmit: Function,
  intl: intlShape,
  chain: string,
}

type State = {
  nameError: string,
  addressError: string,
}

export default class ContactForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      nameError: '',
      addressError: '',
    }
  }

  static defaultProps = {
    submitLabel: <FormattedMessage id="saveContactButtonText" />,
    name: '',
    address: '',
    setName: noop,
    setAddress: noop,
    onSubmit: noop,
  }

  render() {
    const { submitLabel, formName, formAddress, intl } = this.props
    const { nameError, addressError } = this.state

    return (
      <section className={styles.contactFormContainer}>
        <form className={styles.contactForm} onSubmit={this.handleSubmit}>
          <TextInput
            id="contactName"
            name="name"
            label={intl.formatMessage({
              id: 'contactName',
            })}
            className={styles.input}
            placeholder={intl.formatMessage({
              id: 'enterAContactName',
            })}
            value={formName}
            onChange={this.handleChangeName}
            error={nameError}
          />
          <TextInput
            id="contactAddress"
            label={intl.formatMessage({
              id: 'contactWalletAddress',
            })}
            name="address"
            className={styles.input}
            placeholder={intl.formatMessage({
              id: 'enterAWalletAddress',
            })}
            value={formAddress}
            onChange={this.handleChangeAddress}
            error={addressError}
          />
          <div className={styles.dialogueAndButtonContainer}>
            <DialogueBox
              icon={<WarningIcon />}
              text={intl.formatMessage({
                id: 'editContactDisclaimer',
              })}
              className={styles.conactFormDialogue}
            />
          </div>
          <Button
            className={styles.submitButton}
            primary
            type="submit"
            disabled={this.disableButton(formName, formAddress)}
            renderIcon={AddContactIcon}
          >
            {submitLabel}
          </Button>
        </form>
      </section>
    )
  }

  componentWillMount() {
    const { newAddress, setAddress } = this.props

    if (newAddress) {
      setAddress('')
    }
  }

  disableButton = (name: string, address: string) => {
    const { chain } = this.props
    if (name.length === 0) {
      return true
    }

    if (name.length > 100) {
      return true
    }

    if (
      chain === 'neo3'
        ? !n3Wallet.isAddress(address)
        : !wallet.isAddress(address)
    ) {
      return true
    }

    return false
  }

  validate = (name: string, address: string) => {
    const validName = this.validateName(name)
    const validAddress = this.validateAddress(address)

    return validName && validAddress
  }

  validateName = (name: string) => {
    const { contacts, mode, intl } = this.props
    let error

    if (name.length === 0) {
      error = intl.formatMessage({ id: 'errors.contact.nameNull' }) // eslint-disable-line
    }

    if (name.length > 100) {
      error = intl.formatMessage({ id: 'errors.contact.nameLength' })
    }

    if (mode !== 'edit') {
      const nameExists = Object.keys(contacts).filter(
        (contactName: string) => contactName === name,
      )

      if (nameExists.length > 0) {
        error = intl.formatMessage({ id: 'errors.contact.nameDupe' })
      }
    }

    if (error) {
      this.setState({ nameError: error })
      return false
    }
    return true
  }

  validateAddress = (address: string) => {
    const { mode, contacts, formAddress, intl, chain } = this.props
    let error

    if (
      chain === 'neo3'
        ? !n3Wallet.isAddress(address)
        : !wallet.isAddress(address)
    ) {
      error = intl.formatMessage({ id: 'errors.contact.invalidAddress' })
    }

    if (mode !== 'edit') {
      const addressExists = Object.keys(contacts)
        .map(acc => contacts[acc])
        .filter(adr => adr === formAddress)

      if (addressExists.length > 0) {
        error = intl.formatMessage({ id: 'errors.contact.contactExists' })
      }
    }

    if (error) {
      this.setState({ addressError: error })
      return false
    }
    return true
  }

  clearErrors = (name: string) => {
    if (name === 'name') {
      this.setState({ nameError: '' })
    }

    if (name === 'address') {
      this.setState({ addressError: '' })
    }
  }

  handleChangeName = (event: Object) => {
    this.clearErrors(event.target.name)
    this.props.setName(event.target.value)
    this.validate(event.target.value, this.props.formAddress)
  }

  handleChangeAddress = (event: Object) => {
    this.clearErrors(event.target.name)
    this.props.setAddress(event.target.value)
    this.validate(this.props.formName, event.target.value)
  }

  handleSubmit = (event: Object) => {
    event.preventDefault()
    const { onSubmit, formName, formAddress } = this.props

    const validInput = this.validate(formName, formAddress)

    if (validInput) {
      onSubmit(formName, formAddress)
    }
  }
}
