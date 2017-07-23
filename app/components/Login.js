import React from 'react';
import { connect } from 'react-redux';
import { login, setBalance, resetPrice } from '../actions/index.js';
import { Link } from 'react-router';
import CreateWallet from './CreateWallet.js'
import { getBlockByIndex } from '../wallet/api.js';

let input_wif;

const onWifChange = (dispatch, loggedIn) => {
  // lookup wif address to check whether it is valid and enable login
  dispatch(login(input_wif.value));
  if (loggedIn)
    dispatch(resetPrice());
};

let Login = ({ dispatch, loggedIn, wif }) => {
  return (
    <div id="loginPage">
      <div className="login">
        <input type="text" placeholder="Enter your private key here (WIF)" onChange={onWifChange.bind(this, dispatch, loggedIn)} ref={node => {input_wif = node;}} />
        <div className="loginButtons">
          {loggedIn ? <button><Link to="/dashboard">Login</Link></button> : <button disabled="true">Login</button>}
          <button><Link to="/create">New Wallet</Link></button>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  loggedIn: state.account.loggedIn,
  wif: state.account.wif
});

Login = connect(mapStateToProps)(Login);

export default Login;
