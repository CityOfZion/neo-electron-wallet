import React, { Component } from 'react';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';
import FaArrowUpward from 'react-icons/lib/fa/arrow-circle-up';
import { NetworkSwitch } from '../components/NetworkSwitch';
import WalletInfo from '../components/WalletInfo';
import TransactionHistory from '../components/TransactionHistory';
import Logout from '../components/Logout';
import Send from '../components/Send';
import { togglePane } from '../actions/index.js';


const TransactionStatus = ({status}) => {
  console.log("status", status);
  let message = null;
  if (status === true){
    message = (<div className="statusMessage success">
    Transaction complete! Your balance will automatically update when the blockchain has processed it.
    </div>);
  }
  else if (status === false){
    message = <div className="statusMessage fail">Transaction failed</div>;
  }
  return message;
};

class Dashboard extends Component {

  render = () => {
    let sendPaneClosed, statusPaneSize;
    if (this.props.sendPane == true){
      sendPaneClosed = "0%";
    } else {
      sendPaneClosed = "120px";
    }
    if (this.props.status !== null){
      statusPaneSize = "30px";
    } else {
      statusPaneSize = "0px";
    }
    const sendStyle = !this.props.sendPane ? {backgroundColor:"#4C7631"} : {};

    return (<div id="dashboard">
        <SplitPane className="statusSplit" split="horizontal" size={statusPaneSize} allowResize={false}>
          <TransactionStatus status={this.props.status}/>
          <SplitPane className="navSplit" split="horizontal" size="40px" allowResize={false}>
            <div id="navBar">
              <div id="title">NeoWallet</div>
              <div id="version">Version 0.0.1</div>
              <NetworkSwitch />
              <Logout />
            </div>
            <SplitPane split="vertical" size="50%" allowResize={false}>
              <SplitPane className="leftSplit" split="horizontal" size="55px" allowResize={false}>
                <div id="send" onClick={() => this.props.dispatch(togglePane("sendPane"))} style={sendStyle}>
                  <FaArrowUpward id="upArrow" /> <span>Send</span>
                </div>
                <SplitPane className="sendSplit" split="horizontal" size={sendPaneClosed} allowResize={false}>
                  <Send />
                  <WalletInfo />
                </SplitPane>
              </SplitPane>
              <TransactionHistory />
            </SplitPane>
          </SplitPane>
        </SplitPane>
        </div>);
  }

}

const mapStateToProps = (state) => ({
  sendPane: state.dashboard.sendPane,
  status: state.transactionState.success
});

Dashboard = connect(mapStateToProps)(Dashboard);

export default Dashboard;
