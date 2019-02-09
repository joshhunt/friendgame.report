import React, { Component } from 'react';
import { connect } from 'react-redux';

import s from './styles.styl';

class App extends Component {
  render() {
    return (
      <div className={s.root}>
        <p style={{ textAlign: 'center', marginTop: 50 }}>
          Find the people you play with the most in Destiny 2
        </p>
        <p style={{ textAlign: 'center', marginBottom: 50 }}>
          Type in a gamertag above to start
        </p>
      </div>
    );
  }
}

function mapStateToProps(state) {}

const mapDispatchToActions = {};

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(App);
