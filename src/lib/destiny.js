import { has } from 'lodash';
import { queue } from 'async';
import Dexie from 'dexie';
import { getDisplayNameCache, addToDisplayNameCache } from 'src/lib/ls';

const log = require('src/lib/log')('http');

export const db = new Dexie('requestCache');

const CACHE_EVERYTHING = false;

const GET_CONCURRENCY = 10;
db.version(1).stores({
  requests: '&url, response, date'
});

function getWorker({ url, opts }, cb) {
  fetch(url, opts)
    .then(res => res.json())
    .then(result => {
      cb(null, result);
    })
    .catch(err => cb(err));
}

const getQueue = queue(getWorker, GET_CONCURRENCY);

export function get(url, opts) {
  return new Promise((resolve, reject) => {
    getQueue.push({ url, opts }, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  });
}

export function getDestiny(_pathname, opts = {}, postBody) {
  if (CACHE_EVERYTHING && !opts._fromCachedRequest) {
    console.log('routing through cache: ', _pathname, opts);
    return getCacheableDestiny(_pathname, opts);
  }

  const host = opts.host || 'https://www.bungie.net';
  let url = `${host}/Platform${_pathname}`;
  url = url.replace('/Platform/Platform/', '/Platform/');

  const { pathname } = new URL(url);

  opts.headers = opts.headers || {};
  opts.headers['x-api-key'] = process.env.REACT_APP_API_KEY;

  if (opts.accessToken) {
    opts.headers['Authorization'] = `Bearer ${opts.accessToken}`;
  }

  if (postBody) {
    opts.method = 'POST';
    if (typeof postBody === 'string') {
      opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      opts.body = postBody;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(postBody);
    }
  }

  log(`REQUEST: ${pathname}`, opts);

  return get(url, opts).then(resp => {
    log(`RESPONSE: ${pathname}`, resp);

    if (resp.ErrorStatus === 'DestinyAccountNotFound') {
      return null;
    }

    if (has(resp, 'ErrorCode') && resp.ErrorCode !== 1) {
      const cleanedUrl = url.replace(/\/\d+\//g, '/_/');
      const err = new Error(
        'Bungie API Error ' +
          resp.ErrorStatus +
          ' - ' +
          resp.Message +
          '\nURL: ' +
          cleanedUrl
      );

      err.data = resp;
      throw err;
    }

    const result = resp.Response || resp;

    return result;
  });
}

export function getCacheableDestiny(pathname, opts) {
  return db.requests.get(pathname).then(result => {
    if (result) {
      return result.response;
    }

    return getDestiny(pathname, { ...opts, _fromCachedRequest: true }).then(
      data => {
        db.requests.put({ url: pathname, response: data, date: new Date() });
        return data;
      }
    );
  });
}

export function getCurrentMembership(accessToken) {
  return getDestiny('/User/GetMembershipsForCurrentUser/', { accessToken });
}

const GROUP_TYPE_CLAN = 1;
const GROUP_FILTER_ALL = 0;
export function getClansForUser({ membershipType, membershipId }, accessToken) {
  return getDestiny(
    `/GroupV2/User/${membershipType}/${membershipId}/${GROUP_FILTER_ALL}/${GROUP_TYPE_CLAN}/`,
    { accessToken }
  );
}

export function getClan(groupId, accessToken) {
  return getDestiny(`/GroupV2/${groupId}/`, { accessToken });
}

export function getClanMembers(groupId, accessToken) {
  return getDestiny(`/GroupV2/${groupId}/Members/`, { accessToken });
}

function resolveDisplayName(membershipType, displayName) {
  const key = [membershipType, displayName].join('/');
  const membershipLookupCache = getDisplayNameCache();

  console.log({
    key,
    membershipLookupCache
  });

  if (membershipLookupCache[key]) {
    return Promise.resolve(membershipLookupCache[key]);
  }

  return getCacheableSearch(displayName, membershipType).then(([player]) => {
    if (!player) {
      throw new Error('Unable to find user');
    }

    const { membershipId } = player;
    addToDisplayNameCache(key, membershipId);
    return membershipId;
  });
}

const FRIENDLY_MEMBERSHIP_TYPES = {
  xb: 1,
  ps: 2,
  bn: 4
};

// https://www.bungie.net/Platform/Destiny2/2/Profile/4611686018469271298/
export function getProfile({ membershipType, membershipId }, accessToken) {
  const realMembershipType =
    FRIENDLY_MEMBERSHIP_TYPES[membershipType] || membershipType;
  console.log('getProfile', {
    membershipType,
    realMembershipType,
    membershipId
  });

  if (!Number(membershipId)) {
    return resolveDisplayName(realMembershipType, membershipId).then(
      resolvedMembershipId => {
        return getProfile(
          {
            membershipType: realMembershipType,
            membershipId: resolvedMembershipId
          },
          accessToken
        );
      }
    );
  }

  return getDestiny(
    `/Destiny2/${realMembershipType}/Profile/${membershipId}/?components=100,200,204,900`,
    {
      accessToken
    }
  );
}

const ACTIVITY_LIMIT = 1;
export function getRecentActivities(
  { membershipType, membershipId, characterId },
  accessToken
) {
  return getDestiny(
    `/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?mode=0&count=${ACTIVITY_LIMIT}`,
    {
      accessToken
    }
  );
}

const COUNT = 250;
const MAX_PAGE = 1000;
export function getCharacterPGCRHistory(
  { membershipType, membershipId, characterId },
  page = 0,
  acc = []
) {
  // https://www.bungie.net/Platform/Destiny2/2/Account/4611686018469271298/Character/2305843009269703481/Stats/Activities/?mode=None&count=200&page=0

  return getDestiny(
    `/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?mode=None&count=${COUNT}&page=${page}`
  ).then(data => {
    if (data.activities) {
      const newAcc = [...acc, ...data.activities];
      const newPage = page + 1;

      if (page > MAX_PAGE) {
        return newAcc;
      }

      return getCharacterPGCRHistory(
        {
          membershipType,
          membershipId,
          characterId
        },
        newPage,
        newAcc
      );
    }

    return acc;
  });
}

export function getCacheablePGCRDetails(pgcrId) {
  return getCacheableDestiny(
    `/Destiny2/Stats/PostGameCarnageReport/${pgcrId}/`,
    {
      host: 'https://stats.bungie.net'
    }
  );
}

export function getCacheableSearch(searchTerm, membershipType = '-1') {
  return getDestiny(
    `/Destiny2/SearchDestinyPlayer/${membershipType}/${encodeURIComponent(
      searchTerm
    )}/`
  );
}

export function getPlayerSearchAutoComplete(searchTerm, membershipType = '0') {
  return get(
    `https://elastic.destinytrialsreport.com/players/${membershipType}/${searchTerm}`
  );
}

window.getCacheablePGCRDetails = getCacheablePGCRDetails;
