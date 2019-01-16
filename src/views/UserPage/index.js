import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { pKey } from 'src/lib/destinyUtils';

import { getDeepProfile } from 'src/store/profiles';

import s from './styles.styl';

class UserPage extends Component {
  componentDidMount() {
    this.props.getDeepProfile(this.props.routeParams);
  }

  renderName() {
    const { profile, key, pgcrDetails } = this.props;
    return profile ? profile.profile.data.userInfo.displayName : key;
  }

  render() {
    return (
      <div className={s.root}>
        <h2>Clans for {this.renderName()}</h2>

        <ul>
          {this.props.pgcrDetails.map(pgcr => (
            <li>{pgcr.activityDetails.instanceId} / {pgcr.period}</li>
            ))}
        </ul>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const key = pKey(ownProps.routeParams);
  const profile = state.profiles.profiles[key];

  const pgcrDetails = [].concat(...Object.values(state.pgcr.histories[key] || {})).map(pgcrSummary => {
    const pgcrId = pgcrSummary.activityDetails.instanceId;

    return state.pgcr.pgcr[pgcrId]
  }).filter(Boolean)

  return {
    isAuthenticated: state.auth.isAuthenticated,
    profiles: state.profiles.profiles,
    pgcrDetails,
    profile,
    key
  };
}

const mapDispatchToActions = {
  getDeepProfile
};

export default connect(mapStateToProps, mapDispatchToActions)(UserPage);
