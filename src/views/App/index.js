import React, { Component } from 'react';
import { connect } from 'react-redux';

import destinyAuth from 'src/lib/destinyAuth';
import { setAuth, getMembership } from 'src/store/auth';

import s from './styles.styl';

const CLIENT_ID = process.env.REACT_APP_BUNGIE_CLIENT_ID;
const AUTH_URL = `https://www.bungie.net/en/OAuth/Authorize?client_id=${CLIENT_ID}&response_type=code`;

class App extends Component {
  componentDidMount() {
    destinyAuth((err, result) => {
      console.log('auth ==>', { err, result });
      this.props.setAuth({ err, result });

      if (result.isFinal && result.isAuthenticated) {
        console.log('fetching membership');
        this.props.getMembership();
      }
    });
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.header}>
          <h1>clan.report</h1>
        </div>

        {this.props.isAuthenticated ? (
          this.props.children
        ) : (
          <a href={AUTH_URL}>Login with Bungie.net to continue</a>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated
  };
}

const mapDispatchToActions = { setAuth, getMembership };

export default connect(mapStateToProps, mapDispatchToActions)(App);
