// @flow
import { createBatchActions } from 'spunky'

import networkActions from './networkActions'
import accountsActions from './accountsActions'
import settingsActions from './settingsActions'
import contactsActions from './contactsActions'
import n3AccountsActions from './n3AccountsActions'

export const ID = 'app'

export default createBatchActions(ID, {
  network: networkActions,
  accounts: accountsActions,
  n3Accounts: n3AccountsActions,
  settings: settingsActions,
  contacts: contactsActions,
})
