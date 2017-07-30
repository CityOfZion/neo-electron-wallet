import React from 'react';
import { connect } from 'react-redux';
import { login, setBalance, resetPrice, getAccounts } from '../actions/index.js';
import { Link } from 'react-router';
import CreateWallet from './CreateWallet.js'
import { getBlockByIndex } from '../wallet/api.js';
import { addAccountToLocalStorage, clearLocalStorage, getWIFFromPrivateKey } from '../wallet/index.js'
import SavedWallets from './SavedWallets.js'

let input_wif;

const onWifChange = (dispatch) => {
  // lookup wif address to check whether it is valid and enable login
  // if (input_wif.value.length === 64) {
  //   const getWif = getWIFFromPrivateKey(input_wif.value);
  //   console.log(getWif);
  //   dispatch(login(getWif));
  // } else {
    // TODO: changed back to only WIF login for now, getting weird errors with private key hex login
    dispatch(login(input_wif.value));
  // }
};

let Login = ({ dispatch, loggedIn, wif }) =>
  <div id="loginPage">
    <div className="login">
      <input type="text" placeholder="Enter your private key here (WIF)" onChange={() => onWifChange(dispatch)} ref={node => {input_wif = node;}} />
      <div className="loginButtons">
        {loggedIn ? <button><Link to="/dashboard">Login</Link></button> : <button disabled="true">Login</button>}
        <button><Link to="/create">New Wallet</Link></button>
        <button onClick={()=> clearLocalStorage()}>Clear Storage</button>
        <SavedWallets />
      </div>
    </div>
  </div>;

const mapStateToProps = (state) => ({
  loggedIn: state.account.loggedIn,
  wif: state.account.wif
});

Login = connect(mapStateToProps)(Login);

export default Login;
