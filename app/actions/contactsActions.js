// @flow
import { createActions } from 'spunky'
import { wallet } from '@cityofzion/neon-js'
import { wallet as n3Wallet } from '@cityofzion/neon-js-next'
import { has, isEmpty, keys, values, indexOf, zipObject, omit } from 'lodash-es'

import { getStorage, setStorage } from '../core/storage'
import { getSettings } from './settingsActions'

type Contacts = {
  [name: string]: string,
}

const STORAGE_KEY = 'addressBook'
const N3_STORAGE_KEY = 'n3AddressBook'

const getContacts = async (chain: string): Promise<Contacts> =>
  chain === 'neo3' ? getStorage(N3_STORAGE_KEY) : getStorage(STORAGE_KEY)

const setContacts = async (contacts: Contacts, chain: string): Promise<any> =>
  setStorage(chain === 'neo3' ? N3_STORAGE_KEY : STORAGE_KEY, contacts)

const validateContact = (name: string, address: string, chain: string) => {
  if (isEmpty(name)) {
    throw new Error('Name cannot be empty.')
  }
  if (
    chain === 'neo3' ? !n3Wallet.isAddress(address) : !wallet.isAddress(address)
  ) {
    throw new Error(`Invalid address ${address}.`)
  }
}

export const ID = 'contacts'
export const addContactActions = createActions(
  ID,
  ({
    name,
    address,
    chain,
  }: {
    name: string,
    address: string,
    chain: string,
  }) => async (): Promise<Contacts> => {
    validateContact(name, address, chain)

    const contacts = await getContacts(chain)

    if (has(contacts, name)) {
      throw new Error(`Contact "${name}" already exists.`)
    }

    const newContacts = { ...contacts, [name]: address }
    await setContacts(newContacts, chain)

    return newContacts
  },
)

export const updateContactActions = createActions(
  ID,
  ({
    oldName,
    newName,
    newAddress,
    chain,
  }: {
    oldName: string,
    newName: string,
    newAddress: string,
    chain: string,
  }) => async (): Promise<Contacts> => {
    validateContact(newName, newAddress, chain)

    const contacts = await getContacts(chain)
    const names = keys(contacts)
    const addresses = values(contacts)
    const index = indexOf(names, oldName)

    if (index === -1) {
      throw new Error(`Contact "${oldName}" does not exist.`)
    }

    const newContacts = zipObject(
      [...names.slice(0, index), newName, ...names.slice(index + 1)],
      [...addresses.slice(0, index), newAddress, ...addresses.slice(index + 1)],
    )
    await setContacts(newContacts, chain)

    return newContacts
  },
)

export const deleteContactActions = createActions(
  ID,
  ({ name, chain }: { name: string, chain: string }) => async (): Promise<
    Contacts,
  > => {
    const contacts = await getContacts(chain)

    if (!has(contacts, name)) {
      throw new Error(`Contact "${name}" does not exist.`)
    }

    const newContacts = omit(contacts, name)
    await setContacts(newContacts, chain)

    return newContacts
  },
)

export default createActions(ID, () => async (): Promise<Contacts> => {
  const settings = await getSettings()
  const { chain } = settings
  return getContacts(chain)
})
