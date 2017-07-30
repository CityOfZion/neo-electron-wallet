import React, { Component } from 'react';
import { connect } from 'react-redux';
import Claim from "./Claim.js";
import MdSync from 'react-icons/lib/md/sync';
import QRCode from 'qrcode';
import { initiateGetBalance, intervals } from "../components/NetworkSwitch";
import { resetPrice, sendEvent, clearTransactionEvent } from '../actions/index.js';

// need handlers on these as otherwise the interval is not cleared when switching between accounts

const refreshBalance = (dispatch, net, address) => {
  dispatch(sendEvent(true, "Refreshing..."));
  initiateGetBalance(dispatch, net, address).then((response) => {
    dispatch(sendEvent(true, "Received latest blockchain information."));
    setTimeout(() => dispatch(clearTransactionEvent()), 1000);
  });
};

class WalletInfo extends Component {

  componentDidMount = () => {
    initiateGetBalance(this.props.dispatch, this.props.net, this.props.address);
    QRCode.toCanvas(this.canvas, this.props.address, { version: 5 }, (err) => {
      if (err) console.log(err)
    });
    // intervals.balance = setInterval(() => initiateGetBalance(this.props.dispatch, this.props.net, this.props.address), 1000);
  }

  componentDidUpdate = () => {

  }

  render = () => {
    if (this.props.address !== null){
      return (<div id="accountInfo">
        <div className="label">Your Public Neo Address:</div>
        <div className="address">{this.props.address}</div>
        <div className="spacer"></div>
        <div id="balance">
          <div className="split">
            <div className="label">NEO</div>
            <div className="amountBig">{this.props.ans}</div>
          </div>
          <div className="split">
            <div className="label">GAS</div>
            <div className="amountBig">{this.props.anc < 0.001 ? 0 : this.props.anc.toPrecision(5)}</div>
          </div>
          <div className="fiat">US {this.props.price}</div>
          <div onClick={() => refreshBalance(this.props.dispatch, this.props.net, this.props.address)}>
            <MdSync id="refresh"/>
          </div>
        </div>
        <div className="spacer"></div>
        <Claim />
        <div className="spacer"></div>
        <div className="qrCode"><canvas id="qrCanvas" ref={(node) => this.canvas = node}></canvas></div>
      </div>);
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state) => ({
  ans: state.wallet.ANS,
  anc: state.wallet.ANC,
  address: state.account.address,
  net: state.wallet.net,
  price: state.wallet.price
});

WalletInfo = connect(mapStateToProps)(WalletInfo);

export default WalletInfo;
