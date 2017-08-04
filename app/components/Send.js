import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { sendAssetTransaction } from '../wallet/api.js';
import { verifyAddress } from '../wallet/index.js';
import { sendEvent, clearTransactionEvent, toggleAsset, togglePane } from '../actions/index.js';
import SplitPane from 'react-split-pane';
import ReactTooltip from 'react-tooltip';

let sendAddress, sendAmount, confirmButton;

const afterSend = (dispatch) => {
  dispatch(togglePane("confirmPane"));
  setTimeout(() => dispatch(clearTransactionEvent()), 5000);
  sendAddress.value = '';
  sendAmount.value = '';
  confirmButton.blur();
}

const sendTransaction = (dispatch, net, wif, asset, neo_balance, gas_balance) => {
  let assetSwap;
  if (asset === "NEO"){
    assetSwap = "AntShares";
  } else {
    assetSwap = "AntCoins";
  }
  dispatch(sendEvent(true, "Processing..."));
  if (verifyAddress(sendAddress.value) !== true){
    dispatch(sendEvent(false, "The address you entered was not valid. No NEO was sent."));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
  }
  else if (asset === "NEO" && parseFloat(sendAmount.value) !== parseInt(sendAmount.value)){
    dispatch(sendEvent(false, "You cannot send fractional amounts of Neo."));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
  }
  else if (asset === "NEO" && parseInt(sendAmount.value) > neo_balance){
    dispatch(sendEvent(false, "You do not have enough NEO to send. No NEO was sent."));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
  }
  else if (asset === "GAS" && parseFloat(sendAmount.value) > gas_balance){
    dispatch(sendEvent(false, "You do not have enough GAS to send. No GAS was sent."));
    setTimeout(() => dispatch(clearTransactionEvent()), 5000);
  }
  else {
    sendAssetTransaction(net, sendAddress.value, wif, assetSwap, sendAmount.value).then((response) => {
      if (response.result === undefined){
        dispatch(sendEvent(false, "Transaction failed!"));
      } else {
        dispatch(sendEvent(true, "Transaction complete! Your balance will automatically update when the blockchain has processed it."));
      }
      setTimeout(() => dispatch(clearTransactionEvent()), 5000);
    });
  }
  dispatch(togglePane("confirmPane"));
  sendAddress.value = '';
  sendAmount.value = '';
  confirmButton.blur();
};

let Send = ({dispatch, wif, status, ans, anc, net, confirmPane, selectedAsset}) => {
  let confirmPaneClosed;
  if (confirmPane){
    confirmPaneClosed = "100%";
  } else {
    confirmPaneClosed = "69%";
  }
  return (<SplitPane className="confirmSplit" split="horizontal" size={confirmPaneClosed} allowResize={false}>
    <div id="sendPane">
        <div id="sendAddress">
          <input placeholder="Where to send the asset (address)" ref={node => {sendAddress = node;}}/>
        </div>
        <div id="sendAmount">
          <input id="sendAmount" placeholder="Amount" ref={node => {sendAmount = node;}}/>
        </div>
        <button id="sendAsset" data-tip data-for="assetTip" onClick={() => dispatch(toggleAsset())}>{selectedAsset}</button>
        <ReactTooltip class="solidTip" id="assetTip" place="bottom" type="dark" effect="solid">
          <span>Toggle NEO / GAS</span>
        </ReactTooltip>
      <button id="doSend" onClick={() => dispatch(togglePane("confirmPane"))}>Send Asset</button>
    </div>
    <div id="confirmPane" onClick={() => sendTransaction(dispatch, net, wif, selectedAsset, ans, anc)}>
      <button ref={node => {confirmButton = node;}}>Confirm Transaction</button>
    </div>
  </SplitPane>);
}

const mapStateToProps = (state) => ({
  wif: state.account.wif,
  net: state.wallet.net,
  ans: state.wallet.ANS,
  anc: state.wallet.ANC,
  selectedAsset: state.transactionState.selectedAsset,
  confirmPane: state.dashboard.confirmPane,
});

Send = connect(mapStateToProps)(Send);

export default Send;
