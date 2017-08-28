import React, { Component } from 'react';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';
import FaArrowUpward from 'react-icons/lib/fa/arrow-circle-up';
import { NetworkSwitch } from '../components/NetworkSwitch';
import WalletInfo from '../components/WalletInfo';
import TransactionHistory from '../components/TransactionHistory';
import Logout from '../components/Logout';
import Send from '../components/Send';
import { togglePane } from '../modules/dashboard';
import { version } from '../../package.json'

const logo = require('../images/neon-logo2.png');

const TransactionStatus = ({status, statusMessage}) => {
  let message = null;
  if (status === true){
    message = (<div className="statusMessage success">
    {statusMessage}
    </div>);
  }
  else if (status === false){
    message = <div className="statusMessage fail">{statusMessage}</div>;
  }
  return message;
};

class Dashboard extends Component {

  render = () => {
    let sendPaneClosed, statusPaneSize;
    if (this.props.sendPane == true){
      sendPaneClosed = "0%";
    } else {

      // send confirmation prompt
      if (this.props.confirmPane == false){

        // add space for the "Send Asset" button to go to the next line if the window is reduced
        if((window.innerWidth <= 770) || (window.innerHeight <= 680)) {
            sendPaneClosed = "180px";
        }
        else {
			sendPaneClosed = "21%";
		}

      }

      // initial opening of send pane
      else {

        // add space for the "Send Asset" button to go to the next line if the window is reduced
        if((window.innerWidth <= 770) || (window.innerHeight <= 680)) {
          sendPaneClosed = "150px";
        }
        else {
			sendPaneClosed = "100px"; //"15%";
        }

      }
    }
    if (this.props.status !== null){
      statusPaneSize = "30px";
    } else {
      statusPaneSize = "0px";
    }

    return (<div id="dashboard">
        <SplitPane className="statusSplit" split="horizontal" size={statusPaneSize} allowResize={false}>
          <TransactionStatus status={this.props.status} statusMessage={this.props.statusMessage}/>
          <SplitPane className="navSplit" split="horizontal" size="40px" allowResize={false}>
            <div id="navBar">
              <div id="title"><img src={logo} width="60px"/></div>
              <div id="version"><span className="grey">Version</span><span className="darker">{version}</span></div>
              <div id="height"><span className="grey">Block</span><span className="darker">{this.props.blockHeight}</span></div>
              <NetworkSwitch />
              <Logout />
            </div>
            <SplitPane split="vertical" size="50%" allowResize={false}>
              <SplitPane className="leftSplit" split="horizontal" size="55px" allowResize={false}>
                <div id="send" onClick={() => this.props.dispatch(togglePane("sendPane"))}>
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
  confirmPane: state.dashboard.confirmPane,
  status: state.transactions.success,
  statusMessage: state.transactions.message,
  blockHeight: state.metadata.blockHeight
});

Dashboard = connect(mapStateToProps)(Dashboard);

export default Dashboard;
