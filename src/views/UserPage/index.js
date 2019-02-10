import React, { Component } from 'react';
import { connect } from 'react-redux';
import timeOverlap from 'time-overlap';
import { sortBy, mapValues, isEqual, get, pickBy } from 'lodash';
import memoizeOne from 'memoize-one';
import { addRecentProfile } from 'src/lib/ls';

import PlayerList from 'src/components/PlayerList';
import LoadingProgress from 'src/components/LoadingProgress';
import PrettyDate from 'src/components/Date';

import { pKey } from 'src/lib/destinyUtils';
import { getDeepProfile } from 'src/store/profiles';
import { COUNT } from 'src/store/app';
import { profileSelector } from './selectors';

import s from './styles.styl';

const filterPlayers = players => players.filter(p => p.pgcrs.length > 1);

const BIG_LIST = 14;
const SMALL_LIST = 6;

class UserPage extends Component {
  componentDidMount() {
    this.props.getDeepProfile(this.props.routeParams);
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.routeParams, prevProps.routeParams)) {
      this.props.getDeepProfile(this.props.routeParams);
    }

    if (
      this.props.profile &&
      !isEqual(
        get(this.props, 'profile.profile.data.userInfo'),
        get(prevProps, 'profile.profile.data.userInfo')
      )
    ) {
      addRecentProfile(this.props.profile.profile.data.userInfo);
    }
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
      profile,
      sortMode,
      numOfCharacters,
      numOfLoadedHistories
    } = this.props;

    const { all: allPlayers, ...restPlayerCounts } = playerCountsForModes;
    const characterProgress = numOfLoadedHistories / numOfCharacters;
    const gamesProgress = loadedGames / totalGames;

    const totalProgress = characterProgress * 0.25 + gamesProgress * 0.75;

    let loadingMessage;
    if (!profile) {
      loadingMessage = 'Loading profile';
    } else if (characterProgress < 1) {
      loadingMessage = `Loading character histories ${numOfLoadedHistories} / ${numOfCharacters}`;
    } else if (gamesProgress < 1) {
      loadingMessage = `Loading game details ${loadedGames} / ${totalGames} (this might take a while)`;
    } else {
      loadingMessage = `Loaded ${loadedGames} games`;
    }

    const newFriendFirstPlayDate =
      callouts.newFriend &&
      callouts.newFriend.pgcrs[callouts.newFriend.pgcrs.length - 1].pgcr.period;

    return (
      <div className={s.root}>
        <LoadingProgress progress={totalProgress} />

        <div className={s.inner}>
          <div className={s.topBit}>
            <h2 className={s.name}>{this.renderName()}</h2>
            <div className={s.loading}>{loadingMessage}</div>
          </div>

          <div className={s.callouts}>
            {callouts.newFriend && (
              <PlayerList
                className={s.newFriendList}
                title="New friend"
                activeSortMode={sortMode}
                idealLength={1}
                players={[callouts.newFriend]}
                parentPlayer={profile && profile.profile.data.userInfo}
                playerClassName={s.noListPlayer}
                playerChildren={
                  <span>
                    {callouts.newFriend.pgcrs.length} matches, first played with{' '}
                    <PrettyDate date={newFriendFirstPlayDate} />
                  </span>
                }
              />
            )}

            {callouts.crimsonDaysPlayer && (
              <PlayerList
                className={s.crimsonDaysList}
                title="Crimson Doubles Partner"
                activeSortMode={sortMode}
                idealLength={1}
                players={[callouts.crimsonDaysPlayer]}
                parentPlayer={profile && profile.profile.data.userInfo}
                playerClassName={s.noListPlayer}
              />
            )}
          </div>

          <div className={s.grandLayout}>
            <div className={s.main}>
              <PlayerList
                parentPlayer={profile && profile.profile.data.userInfo}
                players={allPlayers[FIRETEAM]}
                title={MODE_NAMES['all'] || 'all'}
                activeSortMode={sortMode}
                highlightFirst
                idealLength={BIG_LIST}
              />
            </div>

            <div className={s.rest}>
              {Object.entries(restPlayerCounts).map(
                ([mode, groupedPlayers]) => (
                  <PlayerList
                    key={mode}
                    parentPlayer={profile && profile.profile.data.userInfo}
                    players={groupedPlayers[FIRETEAM]}
                    title={MODE_NAMES[mode] || mode}
                    activeSortMode={sortMode}
                    idealLength={SMALL_LIST}
                    small
                  />
                )
              )}
            </div>
          </div>
        </div>
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
    [FIRETEAM]: filterPlayers(Object.values(players[FIRETEAM])),
    [BLURBERRY]: filterPlayers(Object.values(players[BLURBERRY]))
  };

  return payload;
};

const CRIMSON_DAYS_CUTOFF = new Date(2019, 0, 1);
function filterGamesByMode(pgcrs, mode) {
  return pgcrs.filter(p => {
    if (mode === CRIMSON_DOUBLES) {
      const date = new Date(p.period);
      return (
        p.activityDetails.modes.includes(mode) && date > CRIMSON_DAYS_CUTOFF
      );
    }

    return p.activityDetails.modes.includes(mode);
  });
}

const CRUCIBLE = 5;
const PVE = 7;
const PVE_COMPETITIVE = 64;
const RAID = 4;
const ALL = 'all';
const CRIMSON_DOUBLES = 15;

const MODE_NAMES = {
  [CRIMSON_DOUBLES]: 'Crimson Doubles',
  [CRUCIBLE]: 'Crucible',
  [PVE]: 'PvE',
  [PVE_COMPETITIVE]: 'Gambit',
  [RAID]: 'Raids',
  [ALL]: 'All activities'
};

const LIST_LENGTHS = {
  [CRUCIBLE]: SMALL_LIST,
  [PVE]: SMALL_LIST,
  [PVE_COMPETITIVE]: SMALL_LIST,
  [RAID]: SMALL_LIST,
  [ALL]: BIG_LIST
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
    [CRIMSON_DOUBLES]: getPlayerCounts(
      filterGamesByMode(pgcrs, CRIMSON_DOUBLES),
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
    const historiesForProfile = state.pgcr.histories[key] || {};
    const pgcrKeysForPlayer = [].concat(...Object.values(historiesForProfile));

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

    const topPlayersFromAll = sortBy(
      playerCountsForModes.all[FIRETEAM],
      player => -player.pgcrs.length
    );

    const crimsonDaysPlayer =
      playerCountsForModes[CRIMSON_DOUBLES][FIRETEAM][0];

    // modifying the values in this because im naughty
    playerCountsForModes = mapValues(
      playerCountsForModes,
      (playerSet, mode) => {
        const limit = LIST_LENGTHS[mode] || SMALL_LIST;

        return mapValues(playerSet, playerList => {
          return sortBy(playerList, player => {
            return state.app.sortMode === COUNT
              ? -player.pgcrs.length
              : -player.timePlayedTogether;
          }).slice(0, limit);
        });
      }
    );

    playerCountsForModes = pickBy(playerCountsForModes, (value, key) => {
      return Number(key) !== CRIMSON_DOUBLES;
    });

    const NEW_FRIEND_GAME_THRESHOLD = 3;
    const NEW_FRIEND_CUTOFF = new Date();
    const NEW_GAME_MONTHS_CUTOFF = 1;
    NEW_FRIEND_CUTOFF.setMonth(
      NEW_FRIEND_CUTOFF.getMonth() - NEW_GAME_MONTHS_CUTOFF
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
      crimsonDaysPlayer,
      newFriend: newFriend,
      newFriends
    };

    const profile = profileSelector(state, ownProps);
    const numOfCharacters = profile && profile.profile.data.characterIds.length;
    const numOfLoadedHistories = Object.keys(historiesForProfile).length;

    return {
      sortMode: state.app.sortMode,
      isAuthenticated: state.auth.isAuthenticated,
      profiles: state.profiles.profiles,
      numOfCharacters,
      numOfLoadedHistories,
      pgcrDetails,
      playerCountsForModes,
      profile,
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
