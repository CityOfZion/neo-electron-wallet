// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import { orderBy, groupBy, isEmpty } from 'lodash-es'
import classNames from 'classnames'
import { FormattedMessage, IntlShape } from 'react-intl'

import StyledReactSelect from '../../Inputs/StyledReactSelect/StyledReactSelect'
import HeaderBar from '../../HeaderBar'
import Address from '../../Blockchain/Address'
import Panel from '../../Panel'
import Button from '../../Button'
import AddIcon from '../../../assets/icons/add.svg'
import InfoIcon from '../../../assets/icons/info.svg'
import EditIcon from '../../../assets/icons/edit.svg'
import DeleteIcon from '../../../assets/icons/delete.svg'
import SendIcon from '../../../assets/icons/send.svg'
import { ROUTES, MODAL_TYPES } from '../../../core/constants'
import CopyToClipboard from '../../CopyToClipboard'
import LogoWithStrikethrough from '../../LogoWithStrikethrough'

import styles from './ContactsPanel.scss'

type Contact = {
  address: string,
  name: string,
}

type OrderDirection = 'desc' | 'asc'

type Contacts = {
  [key: string]: Contact,
}

type Props = {
  history: Object,
  contacts: Contacts,
  deleteContact: (string, string) => void,
  showSuccessNotification: ({ message: string }) => void,
  showModal: (modalType: string, modalProps: Object) => any,
  intl: IntlShape,
  chain: string,
}

type State = {
  sorting: {
    label: string,
    value: OrderDirection,
  },
}

type SelectOption = {
  label: string,
  value: OrderDirection,
}

const SORTING_OPTIONS = [
  {
    label: 'Sorting A-Z',
    value: 'asc',
  },
  {
    label: 'Sorting Z-A',
    value: 'desc',
  },
]

const getContactsInGroups = (
  contacts: Contacts,
  orderDirection: OrderDirection,
) => {
  /* $FlowFixMe */
  const contactsArray: Array<Contacts> = Object.entries(contacts).map(
    ([name, address]) => ({
      name,
      address,
    }),
  )

  const groupContactsByFirstLetter = groupBy(
    contactsArray,
    ({ name }: Contact) => {
      const firstLetter = name.substr(0, 1).toUpperCase()
      return /[a-zA-Z]/.test(firstLetter) ? firstLetter : '#'
    },
  )

  const groupedContacts = Object.entries(groupContactsByFirstLetter).map(
    ([groupName, groupContacts]) => ({
      groupName,
      /* $FlowFixMe */
      groupContacts: orderBy(groupContacts, 'name', orderDirection),
    }),
  )

  return orderBy(groupedContacts, 'groupName', orderDirection)
}

export default class ContactsPanel extends React.Component<Props, State> {
  state = {
    sorting: SORTING_OPTIONS[0],
  }

  renderHeader = () => {
    const { sorting } = this.state
    const { contacts } = this.props
    return (
      <div className={styles.headerSelect}>
        <StyledReactSelect
          disabled={isEmpty(contacts)}
          value={sorting}
          onChange={this.handleSort}
          options={SORTING_OPTIONS}
          isSearchable={false}
          transparent
          hideHighlight
        />
      </div>
    )
  }

  renderContact = (address: string, name: string, i: number) => {
    const { intl } = this.props
    return (
      <div
        key={`contact${name}${i}`}
        className={classNames(styles.contact, {
          [styles.oddNumberedRow]: i % 2 === 0,
        })}
      >
        <div className={styles.name}>{name}</div>
        <div className={styles.address}>
          <span>{address}</span>
          <CopyToClipboard
            className={styles.copy}
            text={address}
            tooltip={intl.formatMessage({ id: 'copyAddressTooltip' })}
          />
        </div>
        <div className={styles.actions}>
          <Button
            className={styles.editButton}
            renderIcon={EditIcon}
            onClick={() => this.handleEdit(name)}
          >
            <FormattedMessage id="manageWalletsEdit" />
          </Button>
          <Button
            className={styles.deleteButton}
            renderIcon={DeleteIcon}
            onClick={() => this.handleDelete(name)}
          >
            <FormattedMessage id="deleteLabel" />
          </Button>
          <Address address={address} asWrapper>
            <Button className={styles.infoButton} renderIcon={InfoIcon}>
              <FormattedMessage id="sidebarActivity" />
            </Button>
          </Address>
          <Link
            to={{
              pathname: ROUTES.SEND,
              state: { address },
            }}
            className={styles.settingsDonations}
          >
            <Button className={styles.sendButton} renderIcon={SendIcon}>
              <FormattedMessage id="sidebarSend" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  handleSort = (option: SelectOption) => {
    this.setState({ sorting: option })
  }

  handleEdit = (name: string) => {
    this.props.history.push(`/contacts/edit/${encodeURIComponent(name)}`)
  }

  render() {
    const { contacts } = this.props
    const { sorting } = this.state

    return (
      <React.Fragment>
        <HeaderBar
          label={<FormattedMessage id="contactsPageLabel" />}
          shouldRenderRefresh={false}
          renderRightContent={() => (
            <Link id="add" className={styles.addButton} to={ROUTES.ADD_CONTACT}>
              <AddIcon className={styles.addIcon} />
              <span>
                <FormattedMessage id="newContact" />
              </span>
            </Link>
          )}
        />
        <Panel
          className={styles.contactsPanel}
          renderHeader={this.renderHeader}
          contentClassName={styles.contactPanelContent}
        >
          {isEmpty(contacts) ? (
            <div className={styles.emptyContactsContainer}>
              <LogoWithStrikethrough />
            </div>
          ) : (
            <div className={styles.contacts}>
              {getContactsInGroups(contacts, sorting.value).map(
                ({ groupName, groupContacts }) => (
                  <div key={`group${groupName}`}>
                    <div className={styles.groupHeader}>{groupName}</div>
                    {groupContacts.map(({ address, name }, i) =>
                      this.renderContact(address, name, i),
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </Panel>
      </React.Fragment>
    )
  }

  handleDelete = (name: string) => {
    const { showModal, showSuccessNotification, intl, chain } = this.props

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
