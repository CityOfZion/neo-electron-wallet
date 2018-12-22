// @flow
import {
  MAIN_NETWORK_ID,
  TEST_NETWORK_ID,
  MAIN_NETWORK_LABEL,
  TEST_NETWORK_LABEL,
} from './constants'

export const isMainNetwork = (networkId: string) =>
  networkId === MAIN_NETWORK_ID
export const isTestNetwork = (networkId: string) =>
  networkId === TEST_NETWORK_ID

export const getNetworks = () => [
  {
    id: MAIN_NETWORK_ID,
    value: MAIN_NETWORK_ID,
    label: MAIN_NETWORK_LABEL,
    network: MAIN_NETWORK_LABEL,
  },
  {
    id: TEST_NETWORK_ID,
    value: TEST_NETWORK_ID,
    label: TEST_NETWORK_LABEL,
    network: TEST_NETWORK_LABEL,
  },
]

export const findNetwork = (networkId: string): NetworkItemType => {
  const networks = getNetworks()
  return networks.find(({ id }) => id === networkId) || networks[0]
}

export const findNetworkByLabel = (networkLabel: string): NetworkItemType => {
  const networks = getNetworks()
  return networks.find(({ label }) => networkLabel === label) || networks[0]
}
