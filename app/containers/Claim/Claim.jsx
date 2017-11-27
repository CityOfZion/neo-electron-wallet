// @flow
import React, { Component } from 'react'
import Tooltip from '../../components/Tooltip'

type Props = {
  doClaimNotify: Function,
  setClaimRequest: Function,
  doGasClaim: Function,
  claimRequest: boolean,
  disableClaimButton: boolean,
  claimWasUpdated: boolean,
  claimAmount: number,
}

export default class Claim extends Component<Props> {
  componentDidUpdate () {
    const { claimRequest, claimWasUpdated, doClaimNotify, setClaimRequest } = this.props
    if (claimRequest && claimWasUpdated) {
      setClaimRequest(false)
      doClaimNotify()
    }
  }

  render () {
    const { claimAmount, disableClaimButton, doGasClaim } = this.props
    const shouldDisableButton = disableClaimButton || claimAmount === 0
    return (
      <div id='claim'>
        <Tooltip
          title='You can claim GAS once every 5 minutes'
          disabled={!disableClaimButton}
        >
          <button
            disabled={shouldDisableButton}
            onClick={() => doGasClaim()}
            className={shouldDisableButton ? 'disabled' : ''}>Claim {claimAmount} GAS</button>
        </Tooltip>
      </div>
    )
  }
}
