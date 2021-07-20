// @flow
import axios from 'axios'
import { api } from '@cityofzion/neon-js'
import { createActions } from 'spunky'

import { TX_TYPES } from '../core/constants'
import { findAndReturnTokenInfo } from '../util/findAndReturnTokenInfo'
import { getSettings } from './settingsActions'

type Props = {
  net: string,
  address: string,
  shouldIncrementPagination: boolean,
}

export async function parseAbstractData(
  data: Array<any>,
  currentUserAddress: string,
  net: string,
) {
  const parsedTxType = abstract => {
    if (
      abstract.address_to === currentUserAddress &&
      abstract.address_from !== 'claim'
    )
      return TX_TYPES.RECEIVE
    if (abstract.address_from === 'claim') return TX_TYPES.CLAIM
    return TX_TYPES.SEND
  }

  const parsedTo = abstract => {
    if (abstract.address_to === 'fees') return 'NETWORK FEES'
    if (abstract.address_to === 'mint') return 'MINT TOKENS'
    return abstract.address_to
  }

  const parsedFrom = abstract => {
    if (abstract.address_from === 'mint') return 'MINT TOKENS'
    return abstract.address_from
  }

  const results = []
  for (const abstract of data) {
    const asset = await findAndReturnTokenInfo(abstract.asset, net)

    const type = parsedTxType(abstract)
    const summary: TxEntryType = {
      to: parsedTo(abstract),
      isNetworkFee: abstract.address_to === 'fees',
      from: parsedFrom(abstract),
      txid: abstract.txid,
      time: abstract.time,
      amount: abstract.amount,
      asset,
      symbol: asset.symbol,
      image: asset.image,
      label: type === TX_TYPES.CLAIM ? 'GAS Claim' : asset.symbol,
      type,
      id: `_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    }

    results.push(summary)
  }
  return results
}

export const ID = 'transactionHistory'

// TODO: Refactor to use immutable data types!
// hold entries in memory for infinite scroll
let entries = []
let page = 1
export default createActions(
  ID,
  ({
    net,
    address,
    shouldIncrementPagination = false,
  }: Props = {}) => async () => {
    const { chain } = await getSettings()

    // If refresh action dispatched reset pagination
    // to grab the most recent abstracts
    if (!shouldIncrementPagination) {
      page = 1
    }

    let data = { entries: [] }

    if (chain === 'neo3') {
      const results = await axios.get(
        `https://dora.coz.io/api/v1/neo3/testnet/get_address_abstracts/${address}/${page}`,
      )
      // eslint-disable-next-line
      data = results.data
    } else {
      const endpoint = api.neoscan.getAPIEndpoint(net)
      const results = await axios.get(
        `${endpoint}/v1/get_address_abstracts/${address}/${page}`,
      )
      // eslint-disable-next-line
      data = results.data
    }

    const parsedEntries = await parseAbstractData(data.entries, address, net)
    page += 1
    if (shouldIncrementPagination) {
      if (page === 1) entries = []
      entries.push(...parsedEntries)
      return entries
    }
    entries = [...parsedEntries]
    return entries
  },
)
