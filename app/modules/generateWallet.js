// @flow
import storage from 'electron-json-storage'
import { wallet } from '@cityofzion/neon-js'
import { wallet as n3Wallet, logging } from '@cityofzion/neon-js-next'
import { isEmpty, intersectionBy } from 'lodash-es'
import { ECCurves } from 'ecc-jsbn'
import {
  showErrorNotification,
  showInfoNotification,
  hideNotification,
} from './notifications'

import { validatePassphraseLength } from '../core/wallet'
import { ROUTES, DEFAULT_WALLET } from '../core/constants'
import { Account } from '../core/schemas'
import toSentence from '../util/toSentence'

// Actions
import { saveAccountActions, getWallet } from '../actions/accountsActions'
import {
  saveAccountActions as n3SaveAccountActions,
  getWallet as n3GetWallet,
} from '../actions/n3AccountsActions'

const { BigInteger } = require('jsbn')

logging.logger.setDefaultLevel('info')

// Constants
export const NEW_WALLET_ACCOUNT = 'NEW_WALLET_ACCOUNT'
export const RESET_WALLET_ACCOUNT = 'RESET_WALLET_ACCOUNT'

export function newWalletAccount({
  account,
  isImport,
}: {
  account: Object,
  isImport: boolean,
}) {
  return {
    type: NEW_WALLET_ACCOUNT,
    payload: {
      wif: account.wif,
      address: account.address,
      passphrase: account.passphrase,
      encryptedWIF: account.encryptedWIF,
      walletName: account.walletName,
      isImport,
    },
  }
}

export function resetKey() {
  return {
    type: RESET_WALLET_ACCOUNT,
  }
}

// Utils
export const walletHasKey = (wallet: Object, key: string) =>
  wallet.accounts.some(account => account.key === key)

export const walletHasLabel = (wallet: Object, label: string) =>
  wallet.accounts.some(account => account.label === label)

export const convertOldWalletAccount = (
  label: string,
  key: string,
  isDefault: boolean,
) => {
  if (!key || typeof key !== 'string') return null
  return new Account({
    address: '', // Unfortunately all we have is the encrypted private keys, so no way to get this for now.
    label,
    isDefault, // Make the first account the default
    key,
  })
}

export const upgradeUserWalletNEP6 = (): Promise<*> =>
  new Promise((resolve, reject) => {
    storage.get('userWallet', (readNEP6Error, data) => {
      if (readNEP6Error) {
        reject(readNEP6Error)
      }

      if (isEmpty(data)) {
        storage.get('keys', (readLegacyError, keyData) => {
          if (readLegacyError) {
            reject(readLegacyError)
          }
          const wallet = { ...DEFAULT_WALLET }

          if (isEmpty(keyData)) {
            // create empty nep-6 wallet
            storage.set('userWallet', wallet)
          } else {
            const accounts = []
            // eslint-disable-next-line
            Object.keys(keyData).map((label: string) => {
              const newAccount = convertOldWalletAccount(
                label,
                keyData[label],
                accounts.length === 0,
              )
              if (newAccount) {
                accounts.push(newAccount)
              }
            })

            wallet.accounts = accounts

            storage.set('userWallet', wallet, saveError => {
              if (saveError) {
                reject(saveError)
              } else {
                resolve()
              }
            })
          }
        })
      } else {
        resolve()
      }
    })
  })

export const recoverWallet = (wallet: Object): Promise<*> =>
  new Promise((resolve, reject) => {
    storage.get('userWallet', (readError, data) => {
      if (readError) {
        reject(readError)
      }

      let accounts: Array<any> = []

      // If for some reason we have no NEP-6 wallet stored, create a default.
      if (!data) {
        // eslint-disable-next-line no-param-reassign
        data = { ...DEFAULT_WALLET }
      }

      if (!wallet.accounts) {
        // Load the old wallet type
        // eslint-disable-next-line
        Object.keys(wallet).map((label: string) => {
          const isDefault = accounts.length === 0 && wallet.length === 0
          const newAccount = convertOldWalletAccount(
            label,
            wallet[label],
            isDefault,
          )
          if (newAccount && newAccount.key) {
            accounts.push(newAccount)
          }
        })
      } else {
        accounts = wallet.accounts // eslint-disable-line
      }

      if (!accounts.length) {
        reject(Error('No accounts found in recovery file.'))
      }

      // check if wallet label already exists
      const dupAccounts = intersectionBy(data.accounts, accounts, 'label')

      if (dupAccounts.length > 0) {
        const labels = dupAccounts.map(acc => `"${acc.label}"`)
        const errMsg =
          labels.length === 1
            ? `A wallet named ${labels[0]} already exists locally.`
            : `Wallets named ${toSentence(labels)} already exist locally.`

        reject(Error(errMsg))
        return
      }

      // eslint-disable-next-line
      accounts.some(account => {
        if (account.key && !walletHasKey(data, account.key)) {
          data.accounts.push(account)
        }
      })

      storage.set('userWallet', data, saveError => {
        if (saveError) {
          reject(saveError)
        } else {
          resolve(data)
        }
      })
    })
  })

// This method return the WIF from the encryptedWIF and passphrase
export async function decryptEncryptedWIF(
  encryptedWIF: string,
  passphrase: string,
) {
  if (!wallet.isNEP2(encryptedWIF)) {
    throw new Error('The encrypted key is not valid')
  }
  const wa = new wallet.Account({
    key: encryptedWIF,
  })
  const a = await wa.decrypt(passphrase)
  return a.WIF
}

// This method returns one WIF from two WIFs added together modulo the curve order (split-key method)
export async function joinWIFKeys(wif1: string, wif2: string) {
  const a = new wallet.Account(wif1)
  const b = new wallet.Account(wif2)
  const q = ECCurves.secp256r1().getN()
  const x = new BigInteger(a.privateKey, 16)
  const y = new BigInteger(b.privateKey, 16)
  const r = x.add(y).mod(q)
  const c = r.toString(16).padStart(64, '0')
  const priv = new wallet.Account(c)
  return priv.WIF
}

export function validateInputs(
  wif: string,
  passphrase: string,
  passphrase2: string,
) {
  if (passphrase !== passphrase2) {
    throw new Error('Passphrases do not match')
  }
  if (!validatePassphraseLength(passphrase)) {
    throw new Error('Please choose a longer passphrase')
  }
  if (wif && !wallet.isWIF(wif)) {
    throw new Error('The private key is not valid')
  }
}

type KeyOption = 'WIF' | 'ENCRYPTED_WIF' | 'SPLIT'

export const generateN3NewWalletAccount = (
  passphrase: string,
  passphrase2: string,
  key: string,
  keypart2: string,
  keyOption: KeyOption,
  history: Object,
  walletName: string,
  authenticated: boolean = false,
  onFailure: () => any = () => undefined,
) => (dispatch: DispatchType) => {
  const dispatchError = (message: string) => {
    dispatch(showErrorNotification({ message }))
    return false
  }
  const infoNotificationId: any = dispatch(
    showInfoNotification({
      message: 'Generating encoded key...',
      autoDismiss: 0,
    }),
  )
  let wif = ''
  const isImport = key !== null

  const setWIF = async () => {
    switch (keyOption) {
      case 'ENCRYPTED_WIF':
        wif = await n3Wallet.decrypt(key, passphrase)
        break
      default:
        wif = key
    }
    validateInputs(wif, passphrase, passphrase2)
  }

  setWIF()
    .then(async () => {
      try {
        const account = new n3Wallet.Account(wif || wallet.generatePrivateKey())

        const { WIF, address } = account
        let encryptedWIF
        switch (keyOption) {
          case 'WIF':
            encryptedWIF = await n3Wallet.encrypt(WIF, passphrase)
            break
          default:
            encryptedWIF = key
        }

        // TODO: Do we care about validating wallet names across chain?
        const storedWallet = await n3GetWallet()

        if (walletName && walletHasLabel(storedWallet, walletName)) {
          onFailure()
          return dispatchError(
            'A wallet with this name already exists locally.',
          )
        }
        if (walletHasKey(storedWallet, encryptedWIF)) {
          onFailure()
          return dispatchError(
            'A wallet with this encrypted key already exists locally.',
          )
        }

        dispatch(
          n3SaveAccountActions.call({
            isImport,
            label: walletName,
            address,
            key: encryptedWIF,
          }),
        )

        dispatch(hideNotification(infoNotificationId))
        dispatch(
          newWalletAccount({
            account: {
              wif: WIF,
              address,
              passphrase,
              encryptedWIF,
              walletName,
            },
            isImport,
          }),
        )

        if (wif) history.push(ROUTES.HOME)
        if (authenticated)
          history.push(ROUTES.DISPLAY_WALLET_KEYS_AUTHENTICATED)
        else history.push(ROUTES.DISPLAY_WALLET_KEYS)
        return true
      } catch (e) {
        onFailure()
        console.error(e)
        return dispatchError(
          `An error occured while trying to ${
            isImport ? 'import' : 'generate'
          } a new wallet`,
        )
      }
    })
    .catch(e => {
      onFailure()
      console.error(e)
      return dispatchError(e.message)
    })
}

export const generateNewWalletAccount = (
  passphrase: string,
  passphrase2: string,
  key: string,
  keypart2: string,
  keyOption: KeyOption,
  history: Object,
  walletName: string,
  authenticated: boolean = false,
  onFailure: () => any = () => undefined,
  chain: string,
) => (dispatch: DispatchType) => {
  const dispatchError = (message: string) => {
    dispatch(showErrorNotification({ message }))
    return false
  }

  const infoNotificationId: any = dispatch(
    showInfoNotification({
      message: 'Generating encoded key...',
      autoDismiss: 0,
    }),
  )

  if (chain === 'neo3') {
    return dispatch(
      generateN3NewWalletAccount(
        passphrase,
        passphrase2,
        key,
        keypart2,
        keyOption,
        history,
        walletName,
        authenticated,
        onFailure,
      ),
    )
  }

  let wif = ''
  // If the key is not given, it means that the user has choosen
  // the option 'Create Wallet'. Therefore isImport = false.
  // If the key is given, isImport = true.
  const isImport = key !== null

  const setWIF = async () => {
    switch (keyOption) {
      case 'ENCRYPTED_WIF':
        wif = await decryptEncryptedWIF(key, passphrase)
        break
      case 'SPLIT':
        wif = await joinWIFKeys(key, keypart2)
        break
      default:
        wif = key
    }
    validateInputs(wif, passphrase, passphrase2)
  }

  setWIF()
    .then(async () => {
      try {
        const account = new wallet.Account(wif || wallet.generatePrivateKey())
        const { WIF, address } = account
        let encryptedWIF
        switch (keyOption) {
          case 'WIF':
            encryptedWIF = wallet.encrypt(WIF, passphrase)
            break
          case 'SPLIT':
            encryptedWIF = wallet.encrypt(
              await joinWIFKeys(key, keypart2),
              passphrase,
            )
            break
          default:
            encryptedWIF = key
        }
        const storedWallet = await getWallet()
        if (walletName && walletHasLabel(storedWallet, walletName)) {
          onFailure()
          return dispatchError(
            'A wallet with this name already exists locally.',
          )
        }

        if (walletHasKey(storedWallet, encryptedWIF)) {
          onFailure()
          return dispatchError(
            'A wallet with this encrypted key already exists locally.',
          )
        }

        dispatch(
          saveAccountActions.call({
            isImport,
            label: walletName,
            address,
            key: encryptedWIF,
          }),
        )

        dispatch(hideNotification(infoNotificationId))
        dispatch(
          newWalletAccount({
            account: {
              wif: WIF,
              address,
              passphrase,
              encryptedWIF,
              walletName,
            },
            isImport,
          }),
        )

        if (wif) history.push(ROUTES.HOME)
        if (authenticated)
          history.push(ROUTES.DISPLAY_WALLET_KEYS_AUTHENTICATED)
        else history.push(ROUTES.DISPLAY_WALLET_KEYS)
        return true
      } catch (e) {
        onFailure()
        console.error(e)
        return dispatchError(
          `An error occured while trying to ${
            isImport ? 'import' : 'generate'
          } a new wallet`,
        )
      }
    })
    .catch(e => {
      onFailure()
      console.error(e)
      return dispatchError(e.message)
    })
}

// state getters
export const getWIF = (state: Object) => state.generateWallet.wif
export const getAddress = (state: Object) => state.generateWallet.address
export const getPassphrase = (state: Object) => state.generateWallet.passphrase
export const getWalletName = (state: Object) => state.generateWallet.walletName
export const getEncryptedWIF = (state: Object) =>
  state.generateWallet.encryptedWIF
export const getIsImport = (state: Object) => state.generateWallet.isImport

const initialState = {
  wif: null,
  address: null,
  passphrase: null,
  encryptedWIF: null,
  walletName: null,
  isImport: null,
}

export default (state: Object = initialState, action: ReduxAction) => {
  switch (action.type) {
    case NEW_WALLET_ACCOUNT: {
      const {
        passphrase,
        wif,
        address,
        encryptedWIF,
        walletName,
        isImport,
      } = action.payload
      return {
        ...state,
        wif,
        address,
        passphrase,
        encryptedWIF,
        walletName,
        isImport,
      }
    }
    case RESET_WALLET_ACCOUNT: {
      return { ...initialState }
    }
    default:
      return state
  }
}
