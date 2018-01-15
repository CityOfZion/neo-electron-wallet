// @flow
import { createSelector } from 'reselect'
import { isNil } from 'lodash'
import axios from 'axios'
import { api } from 'neon-js'
import storage from 'electron-json-storage'

import { showWarningNotification } from './notifications'
import { setCurrency } from './price'

import {
  EXPLORERS,
  NEON_WALLET_RELEASE_LINK,
  NOTIFICATION_POSITIONS,
  TOKENS,
  TOKENS_TEST,
  MAIN_NETWORK_ID,
  TEST_NETWORK_ID
} from '../core/constants'
import asyncWrap from '../core/asyncHelper'

import { version } from '../../package.json'

// Constants
export const SET_HEIGHT = 'SET_HEIGHT'
export const SET_NETWORK_ID = 'SET_NETWORK_ID'
export const SET_EXPLORER = 'SET_EXPLORER'
export const SET_USER_GENERATED_TOKENS = 'SET_USER_GENERATED_TOKENS'

// Actions
export const setNetworkId = (networkId: string) => ({
  type: SET_NETWORK_ID,
  payload: { networkId }
})

export function setBlockHeight (blockHeight: number) {
  return {
    type: SET_HEIGHT,
    payload: { blockHeight }
  }
}

export function setBlockExplorer (blockExplorer: ExplorerType) {
  return {
    type: SET_EXPLORER,
    payload: { blockExplorer }
  }
}

export const setUserGeneratedTokens = (tokens: Array<TokenItemType>) => ({
  type: SET_USER_GENERATED_TOKENS,
  payload: { tokens }
})

export const checkVersion = () => async (dispatch: DispatchType, getState: GetStateType) => {
  const state = getState()
  const net = getNetwork(state)
  const apiEndpoint = api.neonDB.getAPIEndpoint(net)

  const [err, res] = await asyncWrap(axios.get(`${apiEndpoint}/v2/version`))
  const shouldUpdate = res && res.data && res.data.version !== version
  if (err || shouldUpdate) {
    const link = `<a href='${NEON_WALLET_RELEASE_LINK}' target='_blank' class="notification-link">${NEON_WALLET_RELEASE_LINK}</a>`
    const message = err ? `Error checking wallet version! Please make sure you have downloaded the latest version: ${link}`
      : `Your wallet is out of date! Please download the latest version from ${link}`
    return dispatch(showWarningNotification({
      message,
      autoDismiss: 0,
      stack: true,
      position: NOTIFICATION_POSITIONS.BOTTOM_CENTER
    }))
  }
}

export const initSettings = () => async (dispatch: DispatchType) => {
  // eslint-disable-next-line
  storage.get('settings', (error, settings) => {
    if (!isNil(settings.blockExplorer)) {
      dispatch(setBlockExplorer(settings.blockExplorer))
    }

    if (!isNil(settings.currency)) {
      dispatch(setCurrency(settings.currency))
    }

    if (!isNil(settings.tokens)) {
      dispatch(setUserGeneratedTokens(settings.tokens))
    }
  })
}

export const syncBlockHeight = (net: NetworkType) => async (dispatch: DispatchType) => {
  const [_err, blockHeight] = await asyncWrap(api.neonDB.getWalletDBHeight(net)) // eslint-disable-line
  return dispatch(setBlockHeight(blockHeight))
}

// state getters
export const getNetworkId = (state: Object) => state.metadata.networkId
export const getBlockHeight = (state: Object) => state.metadata.blockHeight
export const getBlockExplorer = (state: Object) => state.metadata.blockExplorer
export const getNetworks = (state: Object) => state.metadata.networks
export const getAllTokens = (state: Object) => state.metadata.tokens

// computed state getters

export const getNetwork = createSelector(
  getNetworks,
  getNetworkId,
  (networks, selectedNetworkId) => networks.find(({ id, value }) => id === selectedNetworkId).network
)

export const getTokensForNetwork = createSelector(
  getAllTokens,
  getNetworkId,
  (allTokens, selectedNetworkId) => allTokens.filter(({ networkId }) => networkId === selectedNetworkId)
)

const generatePredfinedTokens = (): Array<TokenItemType> => {
  const tokens = []
  let id = 1

  const getTokenEntry = (symbol: string, scriptHash: string, networkId: string) => ({
    id: `${id++}`,
    symbol,
    scriptHash,
    networkId,
    isUserGenerated: false
  })

  Object.keys(TOKENS).forEach(symbol => {
    const scriptHash = TOKENS[symbol]
    tokens.push(getTokenEntry(symbol, scriptHash, MAIN_NETWORK_ID))
  })

  Object.keys(TOKENS_TEST).forEach(symbol => {
    const scriptHash = TOKENS_TEST[symbol]
    tokens.push(getTokenEntry(symbol, scriptHash, TEST_NETWORK_ID))
  })

  return tokens
}

const initialState = {
  blockHeight: 0,
  networkId: MAIN_NETWORK_ID,
  networks: [
    {
      id: MAIN_NETWORK_ID,
      label: 'MainNet',
      network: 'MainNet'
    },
    {
      id: TEST_NETWORK_ID,
      label: 'TestNet',
      network: 'TestNet'
    }
  ],
  tokens: generatePredfinedTokens(),
  blockExplorer: EXPLORERS.NEO_TRACKER
}

export default (state: Object = initialState, action: ReduxAction) => {
  switch (action.type) {
    case SET_HEIGHT:
      const { blockHeight } = action.payload
      return {
        ...state,
        blockHeight
      }
    case SET_EXPLORER:
      const { blockExplorer } = action.payload
      return {
        ...state,
        blockExplorer
      }
    case SET_NETWORK_ID:
      const { networkId } = action.payload
      return {
        ...state,
        networkId
      }
    case SET_USER_GENERATED_TOKENS:
      const { tokens } = action.payload
      return {
        ...state,
        tokens: [
          // keep existing non user generated tokens
          ...state.tokens.filter((token) => !token.isUserGenerated),
          ...tokens.filter((token) => token.isUserGenerated)
        ]
      }
    default:
      return state
  }
}
