/* eslint-disable no-param-reassign */
import _ from 'lodash';
import async from 'async';
import querystring from 'querystring';

import { get, getDestiny, getProfile } from './destiny';
import * as db from './db';

export function searchForPlayer(name, membershipType) {
  const url = `https://elastic.destinytrialsreport.com/players/${
    membershipType
  }/${name}`;
  return get(url);
}

const pgcrConcurrency = 15;

const PVP = 5;
// const PVE = 7;
const DOUBLES = 15; // actually, this is trials

function fetchPGCR(id) {
  const url = `/Platform/Destiny2/Stats/PostGameCarnageReport/${id}/`;
  return getDestiny(url).then(pgcr => {
    db.savePGCR(id, pgcr);
    return pgcr;
  });
}

export function getPGCR(id) {
  return db.getPGCR(id).then(pgcrData => {
    return (pgcrData && pgcrData.data) || fetchPGCR(id);
  });
}

const pgcrWorker = async.queue((job, cb) => {
  getPGCR(job)
    .then(data => cb(null, data))
    .catch(err => cb(err));
}, pgcrConcurrency);

function fmtPlayers(players, membershipId) {
  return _(players)
    .groupBy(player => player.destinyUserInfo.membershipId)
    .toPairs()
    .filter(([blah, p]) => blah !== membershipId && p.length > 1)
    .map(args => {
      const p = args[1];
      return {
        ...p[0],
        $players: p,
        $count: p.length,
      };
    })
    .sortBy(p => p.$count)
    .reverse()
    .value();
}

function getActivities(
  { membershipType, membershipId, characterId },
  page = 0,
  acc = [],
) {
  const params = {
    mode: 'None',
    count: 200,
    page,
  };

  const paramsString = querystring.stringify(params);
  const url = `/Platform/Destiny2/${membershipType}/Account/${
    membershipId
  }/Character/${characterId}/Stats/Activities/?${paramsString}`;

  return getDestiny(url).then(data => {
    if (data.activities) {
      const newAcc = [...acc, ...data.activities];
      const newPage = page + 1;
      return getActivities(
        { membershipType, membershipId, characterId },
        newPage,
        newAcc,
      );
    }

    return acc;
  });
}

export default function getData(player, cb) {
  let loadedCharactersActivity = 0;
  let allActivities = [];
  let pgcrsLoaded = 0;
  let lastPgcrDate = new Date();

  pgcrWorker.remove(() => true);

  const pvpData = {
    activities: [],
    fireteamPlayers: [],
    matchmadePlayers: [],
  };

  const pveData = {
    activities: [],
    fireteamPlayers: [],
    matchmadePlayers: [],
  };

  const doublesData = {
    activities: [],
    fireteamPlayers: [],
    matchmadePlayers: [],
  };

  const { membershipType, membershipId } = player;

  getProfile(player).then(profile => {
    const characters = Object.values(profile.characters.data);

    cb({ characters });

    Object.values(characters).forEach(character => {
      const { characterId } = character;

      getActivities({ membershipType, membershipId, characterId }).then(
        activities => {
          loadedCharactersActivity += 1;

          allActivities = allActivities.concat(activities);

          cb({
            loadedCharactersActivity,
            activities: allActivities,
            totalActivities: allActivities.length,
          });

          activities.forEach(activity => {
            const isPvP = activity.activityDetails.modes.includes(PVP);
            const isDoubles = activity.activityDetails.modes.includes(DOUBLES);
            const date = new Date(activity.period);

            pgcrWorker.push(
              activity.activityDetails.instanceId,
              (err, pgcr) => {
                if (date.getTime() < lastPgcrDate.getTime()) {
                  lastPgcrDate = date;
                }

                isPvP
                  ? pvpData.activities.push(activity)
                  : pveData.activities.push(activity);

                isDoubles && doublesData.activities.push(activity);

                const myEntry = pgcr.entries.find(
                  e => e.characterId === characterId,
                );

                activity.$character = character;
                activity.$pgcr = pgcr;
                activity.$myFireteamId = myEntry.values.fireteamId.basic.value;
                activity.$myEntry = myEntry;

                pgcr.entries.forEach(entry => {
                  if (
                    activity.$myFireteamId !==
                    entry.values.fireteamId.basic.value
                  ) {
                    isDoubles &&
                      doublesData.matchmadePlayers.push(entry.player);
                    isPvP
                      ? pvpData.matchmadePlayers.push(entry.player)
                      : pveData.matchmadePlayers.push(entry.player);
                  } else {
                    isDoubles && doublesData.fireteamPlayers.push(entry.player);

                    isPvP
                      ? pvpData.fireteamPlayers.push(entry.player)
                      : pveData.fireteamPlayers.push(entry.player);
                  }
                });

                pgcrsLoaded += 1;

                cb({
                  pgcrsLoaded,
                  lastPgcrDate,
                  pvpData: {
                    activities: _.sortBy(
                      pvpData.activities,
                      a => new Date(a.period),
                    ).reverse(),
                    fireteamPlayers: fmtPlayers(
                      pvpData.fireteamPlayers,
                      membershipId,
                    ),
                    matchmadePlayers: fmtPlayers(
                      pvpData.matchmadePlayers,
                      membershipId,
                    ),
                  },
                  pveData: {
                    activities: _.sortBy(
                      pveData.activities,
                      a => new Date(a.period),
                    ).reverse(),
                    fireteamPlayers: fmtPlayers(
                      pveData.fireteamPlayers,
                      membershipId,
                    ),
                    matchmadePlayers: fmtPlayers(
                      pveData.matchmadePlayers,
                      membershipId,
                    ),
                  },
                  doublesData: {
                    activities: _.sortBy(
                      doublesData.activities,
                      a => new Date(a.period),
                    ).reverse(),
                    fireteamPlayers: fmtPlayers(
                      doublesData.fireteamPlayers,
                      membershipId,
                    ),
                    matchmadePlayers: fmtPlayers(
                      doublesData.matchmadePlayers,
                      membershipId,
                    ),
                  },
                });
              },
            );
          });
        },
      );
    });
  });
}
