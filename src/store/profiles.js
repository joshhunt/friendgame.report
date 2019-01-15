import * as destiny from 'src/lib/destiny';
import { makePayloadAction } from './utils';
import { pKey } from 'src/lib/destinyUtils';

export const GET_PROFILE_SUCCESS = 'Get profile - success';
export const GET_PROFILE_ERROR = 'Get profile - error';

const INITIAL_STATE = {
  profiles: {}
};

export default function profileReducer(
  state = INITIAL_STATE,
  { type, payload }
) {
  switch (type) {
    case GET_PROFILE_SUCCESS: {
      return {
        ...state,
        profiles: {
          ...state.profiles,
          [pKey(payload.profile.data.userInfo)]: payload
        }
      };
    }

    default:
      return state;
  }
}

export const getProfileSuccess = makePayloadAction(GET_PROFILE_SUCCESS);
export const getProfileError = makePayloadAction(GET_PROFILE_ERROR);

export function getProfile({ membershipType, membershipId }) {
  return (dispatch, getState) => {
    const state = getState();

    // TODO: if friendly stuff is passed in, we can't find these
    const prevProfile =
      state.profiles.profiles[pKey({ membershipType, membershipId })];

    if (prevProfile) {
      return Promise.resolve(prevProfile);
    }

    return destiny
      .getProfile({ membershipType, membershipId }, state.auth.access)
      .then(data => {
        dispatch(getProfileSuccess(data));
        return data;
      })
      .catch(err => dispatch(getProfileError(err)));
  };
}

export function getDeepProfile({ membershipType, membershipId }) {
  return (dispatch, getState) => {
    dispatch(getProfile({ membershipType, membershipId })).then(profile => {
      destiny.getDeepPGCRHistory(profile, {
        onSessionHistory(gameSession, character) {},
        onPGCRDetails(pgcrDetails) {}
      });
    });
  };
}
