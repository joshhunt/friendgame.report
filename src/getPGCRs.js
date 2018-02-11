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

window.searchForPlayer = searchForPlayer;

const pgcrConcurrency = 15;

const PVP = 5;
// const PVE = 7;

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

export default function getData(player, cb) {
  const params = {
    mode: 'None',
    count: 200,
    page: 0,
  };

  let loadedCharactersActivity = 0;
  let allActivities = [];
  let pgcrsLoaded = 0;
  let lastPgcrDate = new Date();

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

  const { membershipType, membershipId } = player;

  getProfile(player).then(profile => {
    const characters = Object.values(profile.characters.data);

    if (characters.length > 2) {
      params.count = 100;
    }

    cb({ characters });

    Object.values(characters).forEach(character => {
      const { characterId } = character;
      const paramsString = querystring.stringify(params);
      const url = `/Platform/Destiny2/${membershipType}/Account/${
        membershipId
      }/Character/${characterId}/Stats/Activities/?${paramsString}`;

      getDestiny(url).then(data => {
        const { activities } = data;
        loadedCharactersActivity += 1;

        allActivities = allActivities.concat(activities);

        cb({
          loadedCharactersActivity,
          activities: allActivities,
          totalActivities: allActivities.length,
        });

        activities.forEach(activity => {
          const isPvP = activity.activityDetails.modes.includes(PVP);
          const date = new Date(activity.period);

          isPvP
            ? pvpData.activities.push(activity)
            : pveData.activities.push(activity);

          pgcrWorker.push(activity.activityDetails.instanceId, (err, pgcr) => {
            if (date.getTime() < lastPgcrDate.getTime()) {
              lastPgcrDate = date;
            }

            const myEntry = pgcr.entries.find(
              e => e.characterId === characterId,
            );

            activity.$character = character;
            activity.$pgcr = pgcr;
            activity.$myFireteamId = myEntry.values.fireteamId.basic.value;
            activity.$myEntry = myEntry;

            pgcr.entries.forEach(entry => {
              isPvP
                ? pvpData.fireteamPlayers.push(entry.player)
                : pveData.fireteamPlayers.push(entry.player);

              if (
                activity.$myFireteamId !== entry.values.fireteamId.basic.value
              ) {
                isPvP
                  ? pvpData.matchmadePlayers.push(entry.player)
                  : pveData.matchmadePlayers.push(entry.player);
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
            });
          });
        });
      });
    });
  });
}
