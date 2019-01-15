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
    const { profile, key } = this.props;
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
  const key = pKey(ownProps.routeParams);
  const profile = state.profiles.profiles[key];

  return {
    isAuthenticated: state.auth.isAuthenticated,
    profiles: state.profiles.profiles,
    profile,
    key
  };
}

const mapDispatchToActions = {
  getDeepProfile
};

export default connect(mapStateToProps, mapDispatchToActions)(UserPage);
