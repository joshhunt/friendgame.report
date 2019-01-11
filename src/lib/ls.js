// eslint-disable-next-line
const keys = {
  AUTH: 'auth',
  recentProfiles: 'recentProfiles',
  displayNameCache: 'displayNameCache',
};

let LOCAL_STORAGE;

// Set up a default 'in memory' reimplementation of localStorage
const localStoragePolyfill = {
  _data: {},
  getItem(key) {
    return this._data.hasOwnProperty(key) ? this._data[key] : null;
  },

  setItem(key, value) {
    this._data[key] = value;
  },

  removeItem(key) {
    delete this._data[key];
  },

  clear() {
    this._data = {};
  }
};

function init() {
  const testKey = '_testKey';

  // We can't reliably feature detect for localStorage, the only
  // way is just to try to use it and see what happens
  try {
    window.localStorage.setItem(testKey, 1);
    window.localStorage.removeItem(testKey);
    LOCAL_STORAGE = window.localStorage;
  } catch (e) {
    console.log('Local storage unavailable, using fallback');
    LOCAL_STORAGE = localStoragePolyfill;
  }
}

init();

export function get(key, defaultValue) {
  const lsValue = LOCAL_STORAGE.getItem(key);

  if (!lsValue) {
    return defaultValue;
  }

  try {
    return JSON.parse(lsValue) || defaultValue;
  } catch (err) {
    console.error(`Unable to retrieve ${key} from local storage as JSON:`);
    console.error(err);

    return defaultValue;
  }
}

export function set(key, value) {
  const jason = JSON.stringify(value);

  try {
    LOCAL_STORAGE.setItem(key, jason);
  } catch (err) {
    console.error(
      `Error writing ${key} to localStorage. Falling back to polyfill`
    );
    console.error(err);
    LOCAL_STORAGE = localStoragePolyfill;
    LOCAL_STORAGE.setItem(key, jason);
  }
}

export function setAuth(authData) {
  set(keys.AUTH, authData);
}

export function getAuth() {
  return get(keys.AUTH);
}

export function getDisplayNameCache() {
  return get(keys.displayNameCache, {});
}

export function addToDisplayNameCache(key, value) {
  const cache = getDisplayNameCache();
  cache[key] = value;

  return set(keys.displayNameCache, cache);
}

export function addRecentProfile(profile) {
  const recentProfiles = getRecentProfiles([]);
  const found = recentProfiles.find(
    r => r.membershipId === profile.membershipId
  );

  if (!found) {
    recentProfiles.push(profile);
  }

  set(keys.recentProfiles, recentProfiles);
}

export function getRecentProfiles(defaultValue) {
  return get(keys.recentProfiles, defaultValue);
}

export function removeAuth() {
  localStorage.removeItem(keys.AUTH);
}
