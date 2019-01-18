import React, { Component } from 'react';
import { memoize, mapValues, groupBy, sortBy, throttle } from 'lodash';
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
    const { playerCountsForModes } = this.props;

    return (
      <div className={s.root}>
        <h2>player report for {this.renderName()}</h2>

        <div className={s.split}>
          {Object.entries(playerCountsForModes).map(([mode, groupedPlayers]) => (
            <div>
              <h3>{MODE_NAMES[mode] || mode}</h3>
              <PlayerList
                players={groupedPlayers[FIRETEAM]}
              />
            </div>
            ))}
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

  const payload = {
    [FIRETEAM]: sortByLength(Object.values(players[FIRETEAM])),
    [BLURBERRY]: sortByLength(Object.values(players[BLURBERRY])),
  }

  return payload;
};

function filterGamesByMode(pgcrs, mode) {
  return pgcrs.filter(p => {
    return p.activityDetails.modes.includes(mode);
  })
}

const CRUCIBLE = 5;
const PVE = 7;
const PVE_COMPETITIVE = 64;
const RAID = 4;

const MODE_NAMES = {
  [CRUCIBLE]: 'Crucible',
  [PVE]: 'PvE',
  [PVE_COMPETITIVE]: 'Gambit',
  [RAID]: 'Raids',
}

function topLevelGetPlayerCounts(pgcrs, playerKey) {
  return {
    all: cachedGetPlayerCounts(pgcrs, playerKey),
    [CRUCIBLE]: cachedGetPlayerCounts(filterGamesByMode(pgcrs, CRUCIBLE), playerKey),
    [PVE]: cachedGetPlayerCounts(filterGamesByMode(pgcrs, PVE), playerKey),
    [PVE_COMPETITIVE]: cachedGetPlayerCounts(filterGamesByMode(pgcrs, PVE_COMPETITIVE), playerKey),
    [RAID]: cachedGetPlayerCounts(filterGamesByMode(pgcrs, RAID), playerKey),
  }
}

const pgcrPlusKeyCacheResolver = (pgcrs, userKey) => {
  return `${pgcrs.map(p => p.activityDetails.instanceId).join(',')}|${userKey}}`
}

const cachedGetPlayerCounts = memoize(getPlayerCounts, pgcrPlusKeyCacheResolver)

const cachedTopLevelGetPlayerCounts = memoize(topLevelGetPlayerCounts, pgcrPlusKeyCacheResolver);

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

    console.time('getPlayerCounts');
    const playerCountsForModes = cachedTopLevelGetPlayerCounts(pgcrDetails, key);
    console.timeEnd('getPlayerCounts');

    return {
      isAuthenticated: state.auth.isAuthenticated,
      profiles: state.profiles.profiles,
      pgcrDetails,
      playerCountsForModes,
      profile: profileSelector(state, ownProps),
      slug: key
    };
  };
}

const mapDispatchToActions = {
  getDeepProfile
};

export default connect(mapStateToProps, mapDispatchToActions)(UserPage);
