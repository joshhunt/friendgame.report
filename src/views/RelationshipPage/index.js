import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEqual, sortBy } from 'lodash';

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
    const { pgcrDetails, profile } = this.props;

    return (
      <div className={s.root}>
        <div className={s.inner}>
          <div className={s.topBit}>
            <h2 className={s.name}>
              {this.renderName()} + {this.renderSecondName()}
            </h2>
          </div>

          <br />

          <GameList pgcrs={pgcrDetails} ownProfile={profile} />
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

    const key = pKey(ownProps.routeParams);
    const pgcrKeysForPlayer = [].concat(
      ...Object.values(state.pgcr.histories[key] || {})
    );

    const allPgcrDetails = pgcrKeysForPlayer.reduce((acc, pgcrSummary) => {
      const pgcrId = pgcrSummary.activityDetails.instanceId;
      const pgcrDetails = state.pgcr.pgcr[pgcrId];

      pgcrDetails && acc.push(pgcrDetails);

      return acc;
    }, []);

    const pgcrDetails = allPgcrDetails.filter(pgcr => {
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
    });

    return {
      profile,
      profileKey,

      secondProfile,
      secondProfileKey,

      pgcrDetails: sortBy(
        pgcrDetails,
        p => Number(p.activityDetails.instanceId) * -1
      )
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
