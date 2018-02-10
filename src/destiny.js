const componentProfiles = 100;
const componentCharacters = 200;

const COMPONENTS = [componentProfiles, componentCharacters];

export function get(url, opts) {
  return fetch(url, opts).then(res => res.json());
}

export function getDestiny(_pathname, opts = {}, postBody) {
  const url = `https://www.bungie.net${_pathname}`;
  const { pathname } = new URL(url);

  const apiKey = process.env.REACT_APP_API_KEY;

  opts.headers = opts.headers || {};
  opts.headers['x-api-key'] = apiKey;

  if (postBody) {
    opts.method = 'POST';
    opts.headers['Content-Type'] = 'application/json';
    opts.body =
      typeof postBody === 'string' ? postBody : JSON.stringify(postBody);
  }

  return get(url, opts).then(resp => {
    if (resp.ErrorStatus === 'DestinyAccountNotFound') {
      return null;
    }

    if (resp.ErrorCode !== 1) {
      throw new Error(
        'Bungie API Error ' +
          resp.ErrorStatus +
          ' - ' +
          resp.Message +
          '\nURL: ' +
          url,
      );
    }

    const result = resp.Response || resp;

    return result;
  });
}

export function getProfile(
  { membershipType, membershipId },
  components = COMPONENTS,
) {
  return getDestiny(
    `/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components.join(
      ',',
    )}`,
  );
}
