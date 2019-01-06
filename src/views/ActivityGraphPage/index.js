import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { getClansForUser, getProfile } from 'src/store/clan';
import { getCharacterPGCRHistory } from 'src/store/pgcr';
import tableStyles from 'app/components/Table/styles.styl';
import Graph from './Graph';

import s from './styles.styl';

const getFireteamId = member => member.values.fireteamId.basic.value;

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join('/');

const MemberLine = ({ member }) => (
  <tr>
    <td>{member.player.destinyUserInfo.displayName} </td>
    <td>{member.isInOurFireteam ? 'member' : 'stranger'}</td>
    <td>
      <code>{member.values.fireteamId.basic.value}</code>
    </td>
    <td>
      <code>{member.values.fireteamId.basic.displayValue}</code>
    </td>
  </tr>
);

class ActivityGraphPage extends Component {
  constructor(...args) {
    super(...args);
    this.calledProfiles = [];
    this.state = { calledProfiles: [] };
  }

  componentDidMount() {
    console.log('this is the new, good one');
    this.props.getClansForUser(this.props.routeParams);

    this.props.getProfile(this.props.routeParams).then(profile => {
      Object.keys(profile.characters.data).forEach(characterId => {
        this.props.getCharacterPGCRHistory(
          this.props.routeParams,
          characterId,
          { fetchPGCRDetails: true }
        );
      });
    });
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
    const { pgcrs, pgcrDetailsForPlayer } = this.props;

    return (
      <div className={s.root}>
        <h2>Activity graph for {this.renderName()}</h2>
        <ul>
          <li>Loaded {Object.keys(pgcrs).length} PGCRs</li>
        </ul>

        <Graph />
      </div>
    );
  }
}

function playerPairs(thisPlayer, members) {
  var res = [],
    l = members.length;

  for (var i = 0; i < l; ++i)
    for (var j = i + 1; j < l; ++j) {
      const memberA = members[i];
      const memberB = members[j];

      if (
        memberA.player.destinyUserInfo.membershipId >
        memberB.player.destinyUserInfo.membershipId
      ) {
        res.push([memberA, memberB]);
      } else {
        res.push([memberB, memberA]);
      }
    }

  return res;
}

function mapStateToProps(state, ownProps) {
  const { membershipId } = ownProps.routeParams;
  const membershipType = Number(ownProps.routeParams.membershipType);

  const pgcrDetailsForPlayer = []
    .concat(
      ...Object.values(state.pgcr.histories[k(ownProps.routeParams)] || {})
    )
    // .slice(0, 50)
    .map(a => state.pgcr.pgcr[a.activityDetails.instanceId])
    .filter(
      activity =>
        activity &&
        activity.entries[0].player.destinyUserInfo.membershipType !== 0
    )
    .map(activity => {
      const thisPlayer = activity.entries.find(
        entry =>
          entry.player.destinyUserInfo.membershipId === membershipId &&
          entry.player.destinyUserInfo.membershipType === membershipType
      );

      const thisPlayerFireteamId = thisPlayer && getFireteamId(thisPlayer);

      return {
        activity,
        link: `https://destinytracker.com/d2/pgcr/${
          activity.activityDetails.instanceId
        }`,
        players: activity.entries.map(entry => {
          return {
            player: entry.player,
            values: entry.values,
            isInOurFireteam:
              getFireteamId(entry) !== 0 &&
              getFireteamId(entry) === thisPlayerFireteamId
          };
        })
      };
    });

  const rawNodes = pgcrDetailsForPlayer.map(activity => {
    const ourFireteam = activity.players
      .filter(player => player.isInOurFireteam)
      .map(p => ({ ...p, link: activity.link }));

    return playerPairs(null, ourFireteam).filter(
      ([memberA, memberB]) =>
        memberA.player.destinyUserInfo.membershipId !==
        memberB.player.destinyUserInfo.membershipId
    );
  });

  const groupedNodes = Object.entries(
    _.groupBy(_.flatMap(rawNodes), ([memberA, memberB]) => {
      return `${k(memberA.player.destinyUserInfo)}|${k(
        memberB.player.destinyUserInfo
      )}`;
    })
  ).map(([relationshipKey, activityPairs]) => {
    return {
      relationshipKey,
      members: activityPairs[0].map(member => member.player.destinyUserInfo),
      activityCount: activityPairs.length
    };
  });

  window.__groupedNodes = groupedNodes;
  window.__rawNodes = rawNodes;

  return {
    isAuthenticated: state.auth.isAuthenticated,
    clans: state.clan.clanResults,
    profiles: state.clan.profiles,
    pgcrs: state.pgcr.pgcr,
    pgcrDetailsForPlayer,
    rawNodes,
    groupedNodes
  };
}

const mapDispatchToActions = {
  getClansForUser,
  getProfile,
  getCharacterPGCRHistory
};

export default connect(mapStateToProps, mapDispatchToActions)(
  ActivityGraphPage
);
