// @flow
/* eslint-disable camelcase */
import { api, sc, u, wallet, settings } from '@cityofzion/neon-js'
import { api as n3Api, wallet as n3Wallet } from '@cityofzion/neon-js-next'
import { flatMap, keyBy, isEmpty, get } from 'lodash-es'

import {
  showErrorNotification,
  showInfoNotification,
  showSuccessNotification,
} from './notifications'
import {
  getNetwork,
  getWIF,
  getPublicKey,
  getSigningFunction,
  getAddress,
  getIsHardwareLogin,
  getAssetBalances,
  getTokenBalances,
} from '../core/deprecated'
import {
  isToken,
  validateTransactionsBeforeSending,
  getTokenBalancesMap,
} from '../core/wallet'
import { toNumber } from '../core/math'
import { getNode, getRPCEndpoint } from '../actions/nodeStorageActions'
import { addPendingTransaction } from '../actions/pendingTransactionActions'

const { reverseHex, ab2hexstring } = u

const MAX_FREE_TX_SIZE = 1024
const FEE_PER_EXTRA_BYTE = 0.00001
const LOW_PRIORITY_THRESHOLD_GAS_AMOUNT = 0.001
const RPC_TIMEOUT_OVERRIDE = 60000
const FEE_OPTIONS = {
  LOW: 0.001,
  MEDIUM: 0.05,
  HIGH: 0.1,
}

settings.timeout.rpc = RPC_TIMEOUT_OVERRIDE

const extractTokens = (sendEntries: Array<SendEntryType>) =>
  sendEntries.filter(({ symbol }) => isToken(symbol))

const extractAssets = (sendEntries: Array<SendEntryType>) =>
  sendEntries.filter(({ symbol }) => !isToken(symbol))

const buildIntents = (sendEntries: Array<SendEntryType>) => {
  const assetEntries = extractAssets(sendEntries)
  // $FlowFixMe
  return flatMap(assetEntries, ({ address, amount, symbol }) =>
    api.makeIntent({ [symbol]: toNumber(amount) }, address),
  )
}

const buildTransferScript = (
  net: NetworkType,
  sendEntries: Array<SendEntryType>,
  fromAddress: string,
  tokensBalanceMap: {
    [key: string]: TokenBalanceType,
  },
) => {
  const tokenEntries = extractTokens(sendEntries)
  const fromAcct = new wallet.Account(fromAddress)
  const scriptBuilder = new sc.ScriptBuilder()

  tokenEntries.forEach(({ address, amount, symbol }) => {
    const toAcct = new wallet.Account(address)
    const { scriptHash, decimals } = tokensBalanceMap[symbol]
    const args = [
      u.reverseHex(fromAcct.scriptHash),
      u.reverseHex(toAcct.scriptHash),
      sc.ContractParam.byteArray(toNumber(amount), 'fixed8', decimals),
    ]

    scriptBuilder.emitAppCall(scriptHash, 'transfer', args)
  })

  return scriptBuilder.str
}

const makeRequest = (
  sendEntries: Array<SendEntryType>,
  config: Object,
  script: string,
) => {
  // NOTE: We purposefully mutate the contents of config
  // because neon-js will also mutate this same object by reference
  // eslint-disable-next-line no-param-reassign
  config.intents = buildIntents(sendEntries)

  if (script === '') {
    return api.sendAsset(config, api.neoscan)
  }
  // eslint-disable-next-line no-param-reassign
  config.script = script
  // eslint-disable-next-line no-param-reassign
  config.gas = 0
  return api.doInvoke(config, api.neoscan)
}

export const generateBalanceInfo = (
  tokensBalanceMap: any,
  address: string,
  net: NetworkType,
) => {
  const Balance = new wallet.Balance({ address, net })
  // $FlowFixMe
  Object.values(tokensBalanceMap).forEach(({ name, balance }) => {
    Balance.addAsset(name, { balance, unspent: [] })
  })
}

// This adds some random bits to the transaction to prevent any hash collision.
const attachAttributesForEmptyTransaction = (config: api.apiConfig) => {
  config.tx.addAttribute(
    32,
    reverseHex(wallet.getScriptHashFromAddress(config.address)),
  )
  config.tx.addRemark(
    Date.now().toString() + ab2hexstring(wallet.generateRandomArray(4)),
  )
  return config
}

// Convert a hex string to a byte array (adopted from crypto js)
export const hexStringToByteArray = (hex: string = '0') => {
  // eslint-disable-next-line
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16))
  // eslint-disable-next-line
  return bytes
}

export const calculateTransactionFees = (bytes: Array<number>) => {
  let fee = 0
  if (bytes.length > MAX_FREE_TX_SIZE) {
    const requiredFee = FEE_PER_EXTRA_BYTE * (bytes.length - MAX_FREE_TX_SIZE)
    if (requiredFee < LOW_PRIORITY_THRESHOLD_GAS_AMOUNT) {
      fee = LOW_PRIORITY_THRESHOLD_GAS_AMOUNT
    } else {
      fee = requiredFee
    }
  }
  return fee
}

export const checkConfigForFees = (config: {
  fees: number,
  tx: { serialize: () => string } | void,
}): Promise<void> =>
  new Promise((resolve, reject) => {
    if (config.tx) {
      const feeSize = calculateTransactionFees(
        hexStringToByteArray(config.tx.serialize()),
      )
      if (feeSize > config.fees) {
        const gasFeeOption = Object.keys(FEE_OPTIONS)
          .map(key => FEE_OPTIONS[key])
          .find((feeOption: number) => feeOption >= feeSize)

        return reject(
          new Error(
            `Based on the size of this transaction a fee of at least ${gasFeeOption ||
              feeSize} GAS is required.`,
          ),
        )
      }
      return resolve()
    }
    return resolve()
  })

export const sendTransaction = ({
  sendEntries,
  fees = 0,
  isWatchOnly,
}: {
  sendEntries: Array<SendEntryType>,
  fees: number,
  isWatchOnly?: boolean,
  chain: string,
}) => (dispatch: DispatchType, getState: GetStateType): Promise<*> => {
  const state = getState()
  const wif = getWIF(state)
  const fromAddress = getAddress(state)
  const net = getNetwork(state)
  const tokenBalances = getTokenBalances(state)
  const tokensBalanceMap = keyBy(tokenBalances, 'symbol')
  const balances = {
    ...getAssetBalances(state),
    ...getTokenBalancesMap(tokenBalances),
  }
  const signingFunction = getSigningFunction(state)
  const publicKey = getPublicKey(state)
  const isHardwareSend = getIsHardwareLogin(state)
  const { tokens, chain } = state.spunky.settings.data
  return chain === 'neo3'
    ? new Promise(async (resolve, reject) => {
        try {
          /*
            TODO:
              - Ledger support
              - Support for test AND main net
              - Node url should come from settings
          */

          if (!isWatchOnly)
            dispatch(
              showInfoNotification({
                message: 'Broadcasting transaction to network...',
                autoDismiss: 0,
              }),
            )

          const NODE_URL = 'https://testnet2.neo.coz.io:443'
          const FROM_ACCOUNT = new n3Wallet.Account(wif)
          const CONFIG = {
            account: FROM_ACCOUNT,
            rpcAddress: NODE_URL,
            // TODO: this will have to by dynamic based on test/mainnets
            networkMagic: 844378958,
          }

          const facade = await n3Api.NetworkFacade.fromConfig({
            node: NODE_URL,
          })

          const signingConfig = {
            signingCallback: n3Api.signWithAccount(CONFIG.account),
          }

          const nep17Intents = sendEntries.map(entry => {
            const { address, amount, symbol } = entry
            const token = tokens.find(
              // eslint-disable-next-line eqeqeq
              t => t.networkId == 2 && t.symbol === symbol,
            )
            const contractHash = token
              ? token.scriptHash
              : tokensBalanceMap[symbol] && tokensBalanceMap[symbol].scriptHash

            entry.contractHash = contractHash || ''
            const intent = {
              from: CONFIG.account,
              to: address,
              decimalAmt: amount,
              contractHash,
            }
            return intent
          })

          const results = await facade.transferToken(
            nep17Intents,
            signingConfig,
          )

          dispatch(
            showSuccessNotification({
              message:
                'Transaction pending! Your balance will automatically update when the blockchain has processed it.',
            }),
          )

          if (!isWatchOnly) {
            dispatch(
              addPendingTransaction.call({
                address: CONFIG.account.address,
                tx: {
                  hash: results,
                  txid: results,
                  sendEntries,
                },
                net,
              }),
            )
          }
          return resolve({ txid: results })
        } catch (e) {
          console.error({ e })
          return reject(e)
        }
      })
    : new Promise(async (resolve, reject) => {
        let url = await getNode(net)
        if (isEmpty(url)) {
          url = await getRPCEndpoint(net)
        }

        const rejectTransaction = (message: string) =>
          dispatch(showErrorNotification({ message }))

        const error = validateTransactionsBeforeSending(balances, sendEntries)

        if (error) {
          console.error({ error })
          rejectTransaction(error)
          return reject(error)
        }

        if (!isWatchOnly)
          dispatch(
            showInfoNotification({
              message: 'Broadcasting transaction to network...',
              autoDismiss: 0,
            }),
          )

        if (isHardwareSend && !isWatchOnly) {
          dispatch(
            showInfoNotification({
              message: 'Please sign the transaction on your hardware device',
              autoDismiss: 0,
            }),
          )
        }

        const config = {
          net,
          tokensBalanceMap,
          address: fromAddress,
          publicKey,
          privateKey: new wallet.Account(wif).privateKey,
          signingFunction: isHardwareSend ? signingFunction : null,
          fees,
          url,
          balance: undefined,
          tx: undefined,
          intents: undefined,
          script: undefined,
          gas: undefined,
        }
        const balanceResults = await api
          .getBalanceFrom({ net, address: fromAddress }, api.neoscan)
          .catch(e => {
            // indicates that neo scan is down and that api.sendAsset and api.doInvoke
            // will fail unless balances are supplied
            console.error(e)
            config.balance = generateBalanceInfo(
              tokensBalanceMap,
              fromAddress,
              net,
            )
          })
        if (balanceResults) config.balance = balanceResults.balance

        try {
          const script = buildTransferScript(
            config.net,
            sendEntries,
            config.address,
            // $FlowFixMe
            config.tokensBalanceMap,
          )
          if (isWatchOnly) {
            config.intents = buildIntents(sendEntries)
            config.script = script
            if (script) {
              config.gas = 0
              api.createTx(config, 'invocation')
              attachAttributesForEmptyTransaction(config)
            } else {
              api.createTx(config, 'contract')
              attachAttributesForEmptyTransaction(config)
            }

            await checkConfigForFees(config)

            return resolve(config)
          }
          const { response } = await makeRequest(sendEntries, config, script)

          if (!response.result) {
            throw new Error('Rejected by RPC server.')
          }

          dispatch(
            showSuccessNotification({
              message:
                'Transaction pending! Your balance will automatically update when the blockchain has processed it.',
            }),
          )
          return resolve(response)
        } catch (err) {
          console.error({ err })
          return checkConfigForFees(config)
            .then(() => {
              rejectTransaction(`Transaction failed: ${err.message}`)
              return reject(err)
            })
            .catch(e => {
              rejectTransaction(`Transaction failed: ${e.message}`)
              return reject(e)
            })
        } finally {
          const hash = get(config, 'tx.hash')

          if (!isWatchOnly) {
            dispatch(
              addPendingTransaction.call({
                address: config.address,
                tx: {
                  hash,
                  sendEntries,
                },
                net,
              }),
            )
          }
        }
      })
}
