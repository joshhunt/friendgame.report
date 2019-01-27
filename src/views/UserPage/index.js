import React, { Component } from 'react';
import { sortBy } from 'lodash';
import { connect } from 'react-redux';
import timeOverlap from 'time-overlap';

import { pKey } from 'src/lib/destinyUtils';
import { getDeepProfile } from 'src/store/profiles';
import { profileSelector } from './selectors';

import s from './styles.styl';
import tableStyles from 'src/components/Table/styles.styl';

const sortByLength = players =>
  sortBy(players, p => -p.pgcrs.length).filter(p => p.pgcrs.length > 1);

const percent = (v, t) => {
  const p = v / t;
  return isNaN(p) ? 0 : Math.floor(p * 100);
};

function PlayerList({ players }) {
  return (
    <ul>
      {players.map(player => (
        <li key={player.player.destinyUserInfo.displayName}>
          {player.player.destinyUserInfo.displayName}: {player.pgcrs.length}
        </li>
      ))}
    </ul>
  );
}

function PGCRTimeline({ pgcr }) {
  const gameStartTime = new Date(pgcr.period);

  return (
    <div>
      <strong>
        <a href={`https://raid.report/pgcr/${pgcr.activityDetails.instanceId}`}>
          {pgcr.activityDetails.instanceId}
        </a>
      </strong>
      <br />
      time: {gameStartTime.toLocaleString()} <br />
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <td>player</td>
            <td>activityDuration</td>
            <td>start</td>
            <td>timePlayed</td>
            <td>start time</td>
            <td>end time</td>
          </tr>
        </thead>

        <tbody>
          {pgcr.entries.map(entry => {
            const playerStartTime = new Date(gameStartTime);
            playerStartTime.setSeconds(
              playerStartTime.getSeconds() +
                entry.values.startSeconds.basic.value
            );
            const playerEndTime = new Date(playerStartTime);
            playerEndTime.setSeconds(
              playerEndTime.getSeconds() +
                entry.values.timePlayedSeconds.basic.value
            );

            return (
              <tr>
                <td>{entry.player.destinyUserInfo.displayName}</td>
                <td>{entry.values.activityDurationSeconds.basic.value}</td>
                <td>{entry.values.startSeconds.basic.value}</td>
                <td>{entry.values.timePlayedSeconds.basic.value}</td>
                <td>{playerStartTime.toLocaleTimeString()}</td>
                <td>{playerEndTime.toLocaleTimeString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <br />
    </div>
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
    const {
      playerCountsForModes,
      totalGames,
      loadedGames,
      callouts,
      timelineGames
    } = this.props;

    return (
      <div className={s.root}>
        <h2>player report for {this.renderName()}</h2>
        <p>
          {loadedGames} / {totalGames}
          <br />
          {percent(loadedGames, totalGames)}%<br />
        </p>

        {/* {timelineGames.map(pgcr => <PGCRTimeline pgcr={pgcr} />)} */}

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

        <PlayerList players={callouts.newFriends} />

        <div className={s.split}>
          {Object.entries(playerCountsForModes).map(
            ([mode, groupedPlayers]) => (
              <div key={mode}>
                <h3>{MODE_NAMES[mode] || mode}</h3>
                <PlayerList players={groupedPlayers[FIRETEAM]} />
              </div>
            )
          )}
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
    players[type][playerKey] = { pgcrs: [] };
  }

  players[type][playerKey].player = entry.player;
  players[type][playerKey].pgcrs.push(entry);
};

const getSingleStartEndTimes = (playerEntry, pgcr) => {
  const gameStartTime = new Date(pgcr.period);

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

const getStartEndTimes = (playerEntry, pgcr) => {
  const base = getSingleStartEndTimes(playerEntry, pgcr);

  return pgcr.entries.reduce((acc, entry) => {
    if (
      entry.player.destinyUserInfo.membershipId !==
      playerEntry.player.destinyUserInfo.membershipId
    ) {
      return acc;
    }

    const comp = getSingleStartEndTimes(entry, pgcr);
    if (comp.startTime < acc.startTime) {
      acc.startTime = comp.startTime;
    }

    if (comp.endTime > acc.endTime) {
      acc.endTime = comp.endTime;
    }

    return acc;
  }, base);
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
      const listType = isInFireteam ? FIRETEAM : BLURBERRY;
      // const { startTime, endTime } = getStartEndTimes(entry, pgcr);

      addPlayer(players, listType, key, {
        player: entry.player,
        // startTime,
        // endTime,
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

const MODE_NAMES = {
  [CRUCIBLE]: 'Crucible',
  [PVE]: 'PvE',
  [PVE_COMPETITIVE]: 'Gambit',
  [RAID]: 'Raids'
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
    const playerCountsForModes = topLevelGetPlayerCounts(pgcrDetails, key);
    console.timeEnd('getPlayerCounts');

    const timelineGames = pgcrDetails.filter(pgcr => {
      return (
        pgcr.activityDetails.modes.includes(RAID) && pgcr.entries.length > 6
      );
    });

    const NEW_FRIEND_CUTOFF = new Date();
    const NEW_FRIEND_GAME_THRESHOLD = 3;
    NEW_FRIEND_CUTOFF.setMonth(NEW_FRIEND_CUTOFF.getMonth() - 1);

    const newFriends = playerCountsForModes.all[FIRETEAM].filter(player => {
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
      bestFriend: playerCountsForModes.all[0],
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
      timelineGames,
      totalGames: pgcrKeysForPlayer.length,
      loadedGames: allPgcrDetails.length,
      callouts
    };
  };
}

const mapDispatchToActions = {
  getDeepProfile
};

export default connect(mapStateToProps, mapDispatchToActions)(UserPage);
