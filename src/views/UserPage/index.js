import React, { Component } from 'react';
import { connect } from 'react-redux';
import timeOverlap from 'time-overlap';
import { sortBy, mapValues } from 'lodash';
import memoizeOne from 'memoize-one';

import PlayerList from 'src/components/PlayerList';

import { pKey } from 'src/lib/destinyUtils';
import { getDeepProfile } from 'src/store/profiles';
import { COUNT } from 'src/store/app';
import { profileSelector } from './selectors';

import s from './styles.styl';

const sortByLength = players => players.filter(p => p.pgcrs.length > 1);

const percent = (v, t) => {
  const p = v / t;
  return isNaN(p) ? 0 : Math.floor(p * 100);
};

class UserPage extends Component {
  componentDidMount() {
    this.props.getDeepProfile(this.props.routeParams);
  }

  renderName() {
    const { profile, slug } = this.props;
    return profile ? profile.profile.data.userInfo.displayName : slug;
  }

  render() {
    const {
      playerCountsForModes,
      totalGames,
      loadedGames,
      callouts,
      profile
    } = this.props;

    return (
      <div className={s.root}>
        <h2>player report for {this.renderName()}</h2>
        <p>
          {loadedGames} / {totalGames}
          <br />
          {percent(loadedGames, totalGames)}%<br />
        </p>

        {callouts.bestFriend && (
          <p>
            best friend:{' '}
            {callouts.bestFriend.player.destinyUserInfo.displayName}
          </p>
        )}

        {callouts.newFriend && (
          <p>
            new friend: {callouts.newFriend.player.destinyUserInfo.displayName}
          </p>
        )}

        <div className={s.split}>
          {Object.entries(playerCountsForModes).map(
            ([mode, groupedPlayers]) => (
              <div key={mode}>
                <PlayerList
                  parentPlayer={profile && profile.profile.data.userInfo}
                  players={groupedPlayers[FIRETEAM]}
                  title={MODE_NAMES[mode] || mode}
                />
              </div>
            )
          )}
        </div>

        <PlayerList
          players={callouts.newFriends}
          title="New friends"
          parentPlayer={profile && profile.profile.data.userInfo}
        />
      </div>
    );
  }
}

const FIRETEAM = 'FIRETEAM';
const BLURBERRY = 'BLURBERRY';

const getFireteamId = entry => entry.values.fireteamId.basic.value;

const addPlayer = (players, type, playerKey, entry) => {
  if (!players[type][playerKey]) {
    players[type][playerKey] = { pgcrs: [], timePlayedTogether: 0 };
  }

  players[type][playerKey].player = entry.player;
  if (entry.timePlayedTogether) {
    players[type][playerKey].timePlayedTogether += entry.timePlayedTogether;
  }
  players[type][playerKey].pgcrs.push(entry);
};

const getSingleStartEndTimes = (playerEntry, gameStartTime) => {
  const startTime = new Date(gameStartTime);
  startTime.setSeconds(
    startTime.getSeconds() + playerEntry.values.startSeconds.basic.value
  );
  const endTime = new Date(startTime);
  endTime.setSeconds(
    endTime.getSeconds() + playerEntry.values.timePlayedSeconds.basic.value
  );

  return { startTime, endTime };
};

const getStartEndTimes = (playerEntry, pgcr, gameStartTime) => {
  return getSingleStartEndTimes(playerEntry, gameStartTime);
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
    const seenPlayers = [];

    const gameStartTime = new Date(pgcr.period);
    const thisPlayerTimes = getStartEndTimes(
      thisPlayersEntry,
      pgcr,
      gameStartTime
    );

    const thisPlayerTimeRange = [
      thisPlayerTimes.startTime.getTime(),
      thisPlayerTimes.endTime.getTime()
    ];

    pgcr.entries.forEach(entry => {
      const key = pKey(entry.player.destinyUserInfo);

      // Ignore ourself
      if (thisPlayerKey === key) {
        return;
      }

      // Ignore dupe players in same pgcr (if they swap character)
      if (seenPlayers.includes(key)) {
        return;
      }

      seenPlayers.push(key);

      const fireteamId = getFireteamId(entry);
      const isInFireteam = fireteamId === thisPlayersFireteamId;

      if (!isInFireteam) {
        return;
      }

      const listType = isInFireteam ? FIRETEAM : BLURBERRY;

      const { startTime, endTime } = getStartEndTimes(
        entry,
        pgcr,
        gameStartTime
      );

      const [startOverlap, endOverlap] = timeOverlap.cross(
        thisPlayerTimeRange,
        [startTime.getTime(), endTime.getTime()]
      );

      const timePlayedTogether =
        endOverlap && startOverlap && endOverlap - startOverlap;

      addPlayer(players, listType, key, {
        player: entry.player,
        timePlayedTogether,
        pgcr,
        pgcrId: pgcr.activityDetails.instanceId
      });
    });
  });

  const payload = {
    [FIRETEAM]: sortByLength(Object.values(players[FIRETEAM])),
    [BLURBERRY]: sortByLength(Object.values(players[BLURBERRY]))
  };

  return payload;
};

function filterGamesByMode(pgcrs, mode) {
  return pgcrs.filter(p => {
    return p.activityDetails.modes.includes(mode);
  });
}

const CRUCIBLE = 5;
const PVE = 7;
const PVE_COMPETITIVE = 64;
const RAID = 4;
const ALL = 'all';

const MODE_NAMES = {
  [CRUCIBLE]: 'Crucible',
  [PVE]: 'PvE',
  [PVE_COMPETITIVE]: 'Gambit',
  [RAID]: 'Raids',
  [ALL]: 'All activities'
};

function topLevelGetPlayerCounts(pgcrs, playerKey) {
  return {
    all: getPlayerCounts(pgcrs, playerKey),
    [CRUCIBLE]: getPlayerCounts(filterGamesByMode(pgcrs, CRUCIBLE), playerKey),
    [PVE]: getPlayerCounts(filterGamesByMode(pgcrs, PVE), playerKey),
    [PVE_COMPETITIVE]: getPlayerCounts(
      filterGamesByMode(pgcrs, PVE_COMPETITIVE),
      playerKey
    ),
    [RAID]: getPlayerCounts(filterGamesByMode(pgcrs, RAID), playerKey)
  };
}

const makeMemoizeKey = (pgcrs, playerKey) => {
  const ids = pgcrs.map(p => p.activityDetails.instanceId).join('');
  return ids + playerKey;
};

const memoizedTopLevelGetPlayerCounts = memoizeOne(
  topLevelGetPlayerCounts,
  (newArgs, oldArgs) => {
    return makeMemoizeKey(...newArgs) === makeMemoizeKey(...oldArgs);
  }
);

function mapStateToProps() {
  return (state, ownProps) => {
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
      return pgcr.entries[0].player.destinyUserInfo.membershipType !== 0;
    });

    console.time('getPlayerCounts');
    let playerCountsForModes = memoizedTopLevelGetPlayerCounts(
      pgcrDetails,
      key
    );
    console.timeEnd('getPlayerCounts');

    // modifying the values in this because im naughty
    playerCountsForModes = mapValues(
      playerCountsForModes,
      (playerSet, mode) => {
        const limit = mode === ALL ? 20 : 10;
        return mapValues(playerSet, playerList => {
          return sortBy(playerList, player => {
            return state.app.sortMode === COUNT
              ? -player.pgcrs.length
              : -player.timePlayedTogether;
          }).slice(0, limit);
        });
      }
    );

    const NEW_FRIEND_CUTOFF = new Date();
    const NEW_FRIEND_GAME_THRESHOLD = 3;
    NEW_FRIEND_CUTOFF.setMonth(NEW_FRIEND_CUTOFF.getMonth() - 1);

    const topPlayersFromAll = sortBy(
      playerCountsForModes.all[FIRETEAM],
      player => -player.pgcrs.length
    );

    const newFriends = topPlayersFromAll.filter(player => {
      const didPlayBeforeCutoff = player.pgcrs.find(entry => {
        const date = new Date(entry.pgcr.period);
        return date < NEW_FRIEND_CUTOFF;
      });

      return !didPlayBeforeCutoff;
    });

    const newFriendsPlayedLots = newFriends.filter(player => {
      return player.pgcrs.length >= NEW_FRIEND_GAME_THRESHOLD;
    });

    const newFriend = newFriendsPlayedLots.length
      ? newFriendsPlayedLots[0]
      : newFriends[0];

    const callouts = {
      bestFriend: topPlayersFromAll[0],
      newFriend: newFriend,
      newFriends
    };

    return {
      isAuthenticated: state.auth.isAuthenticated,
      profiles: state.profiles.profiles,
      pgcrDetails,
      playerCountsForModes,
      profile: profileSelector(state, ownProps),
      slug: key,
      totalGames: pgcrKeysForPlayer.length,
      loadedGames: allPgcrDetails.length,
      callouts
    };
  };
}

const mapDispatchToActions = {
  getDeepProfile
};

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(UserPage);
