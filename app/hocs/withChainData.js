// @flow
import { withData } from 'spunky'

import chainActions from '../actions/settingsActions'

export default function withChainData() {
  const mapChainDataToProps = settings => ({
    chain: settings ? settings.chain || 'neo2' : 'neo2',
  })

  return withData(chainActions, mapChainDataToProps)
}
