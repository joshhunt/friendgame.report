import _ from 'lodash';
import async from 'async';
import querystring from 'querystring';

import { get, getDestiny, getProfile } from './destiny';
import * as db from './db';

export function searchForPlayer(name, membershipType) {
  const url = `https://elastic.destinytrialsreport.com/players/${membershipType}/${name}`;
  return get(url);
}

window.searchForPlayer = searchForPlayer;

const pgcrConcurrency = 15;

const pgcrWorker = async.queue((job, cb) => {
  getPGCR(job)
    .then(data => cb(null, data))
    .catch(err => cb(err));
}, pgcrConcurrency);

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

function fmtPlayers(players, membershipId) {
  return _(players)
    .groupBy(player => player.destinyUserInfo.membershipId)
    .toPairs()
    .filter(([blah, players]) => blah !== membershipId && players.length > 1)
    .map(([blah, players]) => {
      return {
        ...players[0],
        $players: players,
        $count: players.length,
      };
    })
    .sortBy(players => players.$count)
    .reverse()
    .value();
}

export default function getData(player, cb) {
  console.log('player:', player);
  const params = {
    mode: 'None',
    count: 200,
    page: 0,
  };

  let allActivities = [];
  let players = [];
  let matchmadePlayers = [];
  let pgcrsLoaded = 0;
  let lastPgcrDate = new Date();

  const { membershipType, membershipId } = player;

  getProfile(player).then(profile => {
    // TODO: check privacy!
    const characters = Object.values(profile.characters.data);

    if (characters.length > 2) {
      params.count = 100;
    }

    cb({ characters });

    Object.values(characters).forEach(character => {
      const { characterId } = character;
      const paramsString = querystring.stringify(params);
      const url = `/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?${paramsString}`;

      getDestiny(url).then(data => {
        let { activities } = data;
        allActivities = allActivities.concat(activities);

        cb({
          activities: allActivities,
          totalActivities: allActivities.length,
        });

        activities.forEach(activity => {
          const date = new Date(activity.period);

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
              players.push(entry.player);

              if (
                activity.$myFireteamId !== entry.values.fireteamId.basic.value
              ) {
                matchmadePlayers.push(entry.player);
              }
            });

            pgcrsLoaded += 1;

            cb({
              pgcrsLoaded,
              lastPgcrDate,
              players: fmtPlayers(players, membershipId),
              matchmadePlayers: fmtPlayers(matchmadePlayers, membershipId),
            });
          });
        });
      });
    });
  });
}
