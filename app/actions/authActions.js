// @flow
import { wallet } from '@cityofzion/neon-js'
import { wallet as n3Wallet } from '@cityofzion/neon-js-next'
import { noop } from 'lodash-es'
import { createActions } from 'spunky'
import dns from 'dns'

import { bindArgsFromN } from '../util/bindHelpers'
import { resetBalanceState } from './balancesActions'
import { upgradeNEP6AddAddresses } from '../core/account'
import { validatePassphraseLength } from '../core/wallet'
import { legacySignWithLedger } from '../ledger/neonLedger'

type WifLoginProps = {
  wif: string,
}

type WatchOnlyLoginProps = {
  address: string,
  chain: string,
}

type LedgerLoginProps = {
  publicKey: string,
  signingFunction: Function,
  account: number,
}

type Nep2LoginProps = {
  passphrase: string,
  encryptedWIF: string,
  chain: string,
}

type AccountType = ?{
  address: string,
  wif?: string,
  publicKey?: string,
  signingFunction?: Function,
  isHardwareLogin: boolean,
  isWatchOnly?: boolean,
  hasInternetConnectivity: boolean,
  encryptedWIF?: string,
}

export const ID = 'auth'

export const checkForInternetConnectivity = (): Promise<boolean> =>
  new Promise(resolve => {
    dns.resolve('google.com', 'A', err => {
      if (err) {
        return resolve(false)
      }
      return resolve(true)
    })
  })

export const wifLoginActions = createActions(
  ID,
  ({ wif }: WifLoginProps) => async (): Promise<AccountType> => {
    if (!wallet.isWIF(wif) && !wallet.isPrivateKey(wif)) {
      throw new Error('Invalid private key entered')
    }

    const account = new wallet.Account(wif)
    const hasInternetConnectivity = await checkForInternetConnectivity()

    return {
      wif: account.WIF,
      publicKey: account.publicKey,
      address: account.address,
      isHardwareLogin: false,
      hasInternetConnectivity,
    }
  },
)

export const n3WifLoginActions = createActions(
  ID,
  ({ wif }: WifLoginProps) => async (): Promise<AccountType> => {
    if (!n3Wallet.isWIF(wif) && !n3Wallet.isPrivateKey(wif)) {
      throw new Error('Invalid private key entered')
    }

    const account = new n3Wallet.Account(wif)
    const hasInternetConnectivity = await checkForInternetConnectivity()

    return {
      wif: account.WIF,
      publicKey: account.publicKey,
      address: account.address,
      isHardwareLogin: false,
      hasInternetConnectivity,
    }
  },
)

export const watchOnlyLoginActions = createActions(
  ID,
  ({ address, chain }: WatchOnlyLoginProps) => async (): Promise<
    AccountType,
  > => {
    if (chain === 'neo3') {
      if (!n3Wallet.isAddress(address)) {
        throw new Error('Invalid public key entered')
      }
      // TODO: offline signing flow for n3 totally unsupported
      // const hasInternetConnectivity = await checkForInternetConnectivity()
      const hasInternetConnectivity = true

      return {
        address,
        isHardwareLogin: false,
        isWatchOnly: true,
        hasInternetConnectivity,
      }
    }

    if (!wallet.isAddress(address)) {
      throw new Error('Invalid public key entered')
    }
    const hasInternetConnectivity = await checkForInternetConnectivity()

    return {
      address,
      isHardwareLogin: false,
      isWatchOnly: true,
      hasInternetConnectivity,
    }
  },
)

export const nep2LoginActions = createActions(
  ID,
  ({ passphrase, encryptedWIF, chain }: Nep2LoginProps) => async (): Promise<
    AccountType,
  > => {
    if (chain === 'neo3') {
      if (!validatePassphraseLength(passphrase)) {
        throw new Error('Passphrase too short')
      }

      if (!n3Wallet.isNEP2(encryptedWIF)) {
        throw new Error('Invalid encrypted key entered')
      }

      const wif = await n3Wallet.decrypt(encryptedWIF, passphrase)
      const account = new n3Wallet.Account(wif)

      // TODO: offline signing flow for n3 totally unsupported
      // const hasInternetConnectivity = await checkForInternetConnectivity()
      const hasInternetConnectivity = true

      return {
        wif: account.WIF,
        publicKey: account.publicKey,
        address: account.address,
        isHardwareLogin: false,
        hasInternetConnectivity,
        encryptedWIF,
      }
    }

    if (!validatePassphraseLength(passphrase)) {
      throw new Error('Passphrase too short')
    }

    if (!wallet.isNEP2(encryptedWIF)) {
      throw new Error('Invalid encrypted key entered')
    }

    const wif = await wallet.decryptAsync(encryptedWIF, passphrase)
    const account = new wallet.Account(wif)

    await upgradeNEP6AddAddresses(encryptedWIF, wif)

    const hasInternetConnectivity = await checkForInternetConnectivity()

    return {
      wif: account.WIF,
      publicKey: account.publicKey,
      address: account.address,
      isHardwareLogin: false,
      hasInternetConnectivity,
      encryptedWIF,
    }
  },
)

export const ledgerLoginActions = createActions(
  ID,
  ({ publicKey, account }: LedgerLoginProps) => async (): Promise<
    AccountType,
  > => {
    const publicKeyEncoded = wallet.getPublicKeyEncoded(publicKey)
    const walletAccount = new wallet.Account(publicKeyEncoded)
    const hasInternetConnectivity = await checkForInternetConnectivity()

    return {
      publicKey,
      address: walletAccount.address,
      signingFunction: bindArgsFromN(legacySignWithLedger, 3, account),
      isHardwareLogin: true,
      hasInternetConnectivity,
    }
  },
)

export const logoutActions = createActions(ID, () => (): AccountType => {
  resetBalanceState()
  return null
})

// TODO: Better way to expose action data than to make a faux function?  One idea is to change
//       `withData` to accept the `ID` exported from this file instead of a generated action.
export default createActions(ID, () => () => noop)
