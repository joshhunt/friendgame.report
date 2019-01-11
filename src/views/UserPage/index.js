import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { getProfile } from 'src/store/profiles';

import s from './styles.styl';

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join('/');

class UserPage extends Component {
  componentDidMount() {
    this.props.getProfile(this.props.routeParams)
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
    return (
      <div className={s.root}>
        <h2>Clans for {this.renderName()}</h2>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    profiles: state.profiles.profiles,
  };
}

const mapDispatchToActions = {
  getProfile,
};

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(UserPage);
