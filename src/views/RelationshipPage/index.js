import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

import GameList from 'src/components/GameList';

import { pKey } from 'src/lib/destinyUtils';
import { getDeepProfile, getProfile } from 'src/store/profiles';

import s from './styles.styl';

const secondPlayerProps = props => ({
  membershipId: props.routeParams.secondPlayerId,
  membershipType: props.routeParams.membershipType
});

class UserPage extends Component {
  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.routeParams, prevProps.routeParams)) {
      this.fetch();
    }
  }

  fetch() {
    this.props.getDeepProfile(this.props.routeParams);
    this.props.getProfile(secondPlayerProps(this.props));
  }

  renderName() {
    const { profile, profileKey } = this.props;
    return profile ? profile.profile.data.userInfo.displayName : profileKey;
  }

  renderSecondName() {
    const { secondProfile, secondProfileKey } = this.props;
    return secondProfile
      ? secondProfile.profile.data.userInfo.displayName
      : secondProfileKey;
  }

  render() {
    const { sessions, profile } = this.props;
    const firstGame = sessions[sessions.length - 1];

    return (
      <div className={s.root}>
        <div className={s.inner}>
          <div className={s.topBit}>
            <h2 className={s.name}>
              {this.renderName()} + {this.renderSecondName()}
            </h2>
          </div>

          <br />

          {firstGame && (
            <GameList
              className={s.firstMetList}
              title="First met"
              sessions={[firstGame]}
              ownProfile={profile}
            />
          )}
          <GameList sessions={sessions} ownProfile={profile} />
        </div>
      </div>
    );
  }
}

function mapStateToProps() {
  return (state, ownProps) => {
    const profileKey = pKey(ownProps.routeParams);
    const profile = state.profiles.profiles[profileKey];

    const secondProfileKey = pKey(secondPlayerProps(ownProps));
    const secondProfile = state.profiles.profiles[secondProfileKey];

    const histories = state.pgcr.histories[profileKey] || {};

    const sessions = []
      .concat(...Object.values(histories))
      .filter(pgcrSummary => {
        const pgcrId = pgcrSummary.activityDetails.instanceId;
        const pgcr = state.pgcr.pgcr[pgcrId];

        if (!pgcr) {
          return false;
        }

        const isSocialInstance =
          pgcr.entries[0].player.destinyUserInfo.membershipType === 0;

        if (isSocialInstance) {
          return false;
        }

        const containsSecondPlayer = !!pgcr.entries.find(entry => {
          return (
            entry.player.destinyUserInfo.membershipId ===
            (secondProfile && secondProfile.profile.data.userInfo.membershipId)
          );
        });

        return containsSecondPlayer;
      })
      .sort((a, b) => {
        return (
          Number(b.activityDetails.instanceId) -
          Number(a.activityDetails.instanceId)
        );
      });

    return {
      profile,
      profileKey,

      secondProfile,
      secondProfileKey,

      sessions
    };
  };
}

const mapDispatchToActions = {
  getDeepProfile,
  getProfile
};

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(UserPage);
