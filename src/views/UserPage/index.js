import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { getClansForUser, getProfile } from 'src/store/clan';
import Triumphs from 'src/components/Triumphs';

import s from './styles.styl';

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join('/');

const TRIUMPHS =
  window.location.href.includes('triumphs') ||
  window.location.href.includes('localhost');

class UserPage extends Component {
  componentDidMount() {
    this.props.getClansForUser(this.props.routeParams);
    this.props.getProfile(this.props.routeParams);
  }

  getProfile() {
    const key = k(this.props.routeParams);
    const profile = this.props.profiles[key];
    return { profile, key };
  }

  renderName() {
    const { profile, key } = this.getProfile();
    return profile ? profile.profile.data.userInfo.displayName : key;
  }

  render() {
    const clans = this.props.clans || [];
    const profile = this.getProfile();

    return (
      <div className={s.root}>
        <h2>Clans for {this.renderName()}</h2>

        {clans.map(clan => (
          <p key={clan.group.groupId}>
            <Link to={`/clan/${clan.group.groupId}`}>{clan.group.name}</Link>
          </p>
        ))}

        {TRIUMPHS && profile && <Triumphs profile={profile} />}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    clans: state.clan.clanResults,
    profiles: state.clan.profiles
  };
}

const mapDispatchToActions = { getClansForUser, getProfile };

export default connect(mapStateToProps, mapDispatchToActions)(UserPage);
