import React, { Component } from 'react';
import { memoize, mapValues, groupBy, sortBy } from 'lodash';
import { connect } from 'react-redux';

import { pKey } from 'src/lib/destinyUtils';
import { getDeepProfile } from 'src/store/profiles';
import { profileSelector } from './selectors';

import s from './styles.styl';

const sortByLength = players =>
  sortBy(players, p => -p.length).filter(p => p.length > 1);

function PlayerList({ players }) {
  return (
    <ul>
      {players.map(entries => (
        <li>
          {entries[0].player.destinyUserInfo.displayName}: {entries.length}
        </li>
      ))}
    </ul>
  );
}

class UserPage extends Component {
  componentDidMount() {
    this.props.getDeepProfile(this.props.routeParams);
  }

  renderName() {
    const { profile, slug } = this.props;
    return profile ? profile.profile.data.userInfo.displayName : slug;
  }

  render() {
    return (
      <div className={s.root}>
        <h2>player report for {this.renderName()}</h2>

        <div className={s.split}>
          <div>
            <h3>Fireteam members</h3>
            <PlayerList
              players={sortByLength(
                Object.values(this.props.playerCounts[FIRETEAM])
              )}
            />
          </div>

          <div>
            <h3>Blueberries</h3>
            <PlayerList
              players={sortByLength(
                Object.values(this.props.playerCounts[BLURBERRY])
              )}
            />
          </div>
        </div>
      </div>
    );
  }
}

const FIRETEAM = Symbol('fireteam');
const BLURBERRY = Symbol('blueberry');

const getFireteamId = entry => entry.values.fireteamId.basic.value;

const addPlayer = (players, type, playerKey, entry) => {
  if (!players[type][playerKey]) {
    players[type][playerKey] = [];
  }

  players[type][playerKey].push(entry);
};

const getPlayerCounts = (pgcrList, thisPlayerKey) => {
  console.time('getPlayerCounts');
  const players = {
    [FIRETEAM]: {},
    [BLURBERRY]: {}
  };

  pgcrList.forEach(pgcr => {
    const thisPlayersEntry = pgcr.entries.find(
      entry => thisPlayerKey === pKey(entry.player.destinyUserInfo)
    );
    const thisPlayersFireteamId = getFireteamId(thisPlayersEntry);

    pgcr.entries.forEach(entry => {
      const key = pKey(entry.player.destinyUserInfo);

      // Ignore ourself
      if (thisPlayerKey === key) {
        return;
      }

      const fireteamId = getFireteamId(entry);
      const isInFireteam = fireteamId === thisPlayersFireteamId;
      const listType = isInFireteam ? FIRETEAM : BLURBERRY;

      addPlayer(players, listType, key, {
        player: entry.player,
        pgcrId: pgcr.activityDetails.instanceId
      });
    });
  });

  console.timeEnd('getPlayerCounts');

  return players;
};

function mapStateToProps() {
  return (state, ownProps) => {
    const key = pKey(ownProps.routeParams);

    const pgcrDetails = []
      .concat(...Object.values(state.pgcr.histories[key] || {}))
      .map(pgcrSummary => {
        const pgcrId = pgcrSummary.activityDetails.instanceId;
        const pgcrDetails = state.pgcr.pgcr[pgcrId];

        return pgcrDetails;
      })
      .filter(pgcr => {
        return (
          pgcr && pgcr.entries[0].player.destinyUserInfo.membershipType !== 0
        );
      });

    const playerCounts = getPlayerCounts(pgcrDetails, key);

    return {
      isAuthenticated: state.auth.isAuthenticated,
      profiles: state.profiles.profiles,
      pgcrDetails,
      playerCounts,
      profile: profileSelector(state, ownProps),
      slug: key
    };
  };
}

const mapDispatchToActions = {
  getDeepProfile
};

export default connect(mapStateToProps, mapDispatchToActions)(UserPage);
