// @flow
import { map, isEmpty } from 'lodash-es'
import axios from 'axios'

import { toBigNumber } from './math'
import { COIN_DECIMAL_LENGTH } from './formatters'
import {
  TOKENS,
  TOKENS_TEST,
  N3_TOKENS_TEST,
  MAIN_NETWORK_ID,
  TEST_NETWORK_ID,
} from './constants'
import { imageMap } from '../assets/nep5/png'

let fetchedTokens

export const adjustDecimalAmountForTokenTransfer = (value: string): string =>
  toBigNumber(value)
    .times(10 ** COIN_DECIMAL_LENGTH)
    .round()
    .toNumber()

const getTokenEntry = ((): Function => {
  let id = 1

  return (
    symbol: string,
    cryptocompareSymbol: string,
    scriptHash: string,
    networkId: string,
    name: string,
    decimals: number,
    networkData: Object = {},
  ) => ({
    id: `${id++}`, // eslint-disable-line no-plusplus
    symbol,
    cryptocompareSymbol,
    scriptHash,
    networkId,
    isUserGenerated: false,
    totalSupply: networkData.totalSupply,
    decimals: networkData.decimals,
    image: imageMap[symbol],
  })
})()

export const getNeo3Tokens = async (): Promise<Array<TokenItemType>> => {
  const tokens = []
  tokens.push(
    ...map(N3_TOKENS_TEST, tokenData =>
      getTokenEntry(
        tokenData.symbol,
        tokenData.cryptocompareSymbol,
        tokenData.networks['1'].hash,
        MAIN_NETWORK_ID,
        tokenData.networks['1'].name,
        tokenData.networks['1'].decimals,
        tokenData.networks['1'],
      ),
    ),
  )
  tokens.push(
    ...map(N3_TOKENS_TEST, tokenData =>
      getTokenEntry(
        tokenData.symbol,
        tokenData.cryptocompareSymbol,
        tokenData.networks['2'].hash,
        TEST_NETWORK_ID,
        tokenData.networks['2'].name,
        tokenData.networks['2'].decimals,
        tokenData.networks['2'],
      ),
    ),
  )
  return tokens
}

export const getDefaultTokens = async (
  chain?: string,
): Promise<Array<TokenItemType>> => {
  if (chain === 'neo3') {
    return getNeo3Tokens()
  }
  const tokens = []
  // Prevent duplicate requests here
  if (!fetchedTokens) {
    const response = await axios
      // use a time stamp query param to prevent caching
      .get(
        `https://raw.githubusercontent.com/CityOfZion/neo-tokens/master/tokenList.json?timestamp=${new Date().getTime()}`,
      )
      .catch(error => {
        console.error('Falling back to hardcoded list of NEP5 tokens!', error)
        // if request to gh fails use hardcoded list
        fetchedTokens = TOKENS
      })
    if (response && response.data && !isEmpty(response.data)) {
      fetchedTokens = response.data
    } else {
      fetchedTokens = TOKENS
    }
  }

  tokens.push(
    ...map(fetchedTokens, tokenData =>
      getTokenEntry(
        tokenData.symbol,
        tokenData.cryptocompareSymbol,
        tokenData.networks['1'].hash,
        MAIN_NETWORK_ID,
        tokenData.networks['1'].name,
        tokenData.networks['1'].decimals,
        tokenData.networks['1'],
      ),
    ),
  )

  tokens.push(
    ...map(TOKENS_TEST, (scriptHash, symbol) =>
      getTokenEntry(symbol, undefined, scriptHash, TEST_NETWORK_ID),
    ),
  )

  return tokens
}
