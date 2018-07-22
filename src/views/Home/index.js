import React, { Component } from 'react';
import { Link } from 'react-router';
import { get } from 'lodash';
import { connect } from 'react-redux';

import BungieImage from 'src/components/BungieImage';

import s from './styles.styl';

const k = (...args) => args.join('|');

class App extends Component {
  render() {
    const { memberships } = this.props;
    return (
      <div className={s.root}>
        <h2>Choose platform</h2>
        {memberships.map(ship => (
          <Link
            to={`/${ship.membershipType}/${ship.membershipId}`}
            key={k(ship.membershipId, ship.membershipType)}
            className={s.platformLink}
          >
            <BungieImage className={s.platformIcon} src={ship.iconPath} />{' '}
            {ship.displayName}
          </Link>
        ))}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    memberships: get(state, 'auth.membership.destinyMemberships', [])
  };
}

const mapDispatchToActions = {};

export default connect(mapStateToProps, mapDispatchToActions)(App);
