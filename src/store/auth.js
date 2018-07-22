import { makePayloadAction } from './utils';
import * as destiny from 'src/lib/destiny';

export const SET_AUTH = 'Auth - Set Auth';

export const GET_MEMBERSHIP_SUCCESS = 'Auth - Get membership - success';
export const GET_MEMBERSHIP_ERROR = 'Auth - Get membership - error';

export default function authReducer(state = {}, { type, payload }) {
  switch (type) {
    case SET_AUTH: {
      if (!payload.result.isFinal) {
        return state;
      }

      return {
        ...state,
        ...payload.result
      };
    }

    case GET_MEMBERSHIP_SUCCESS: {
      return {
        ...state,
        membership: payload,
        error: null
      };
    }

    case GET_MEMBERSHIP_ERROR: {
      return {
        ...state,
        membership: null,
        error: payload
      };
    }

    default:
      return state;
  }
}

export const setAuth = makePayloadAction(SET_AUTH);

export const getMembershipSuccess = makePayloadAction(GET_MEMBERSHIP_SUCCESS);
export const getMembershipError = makePayloadAction(GET_MEMBERSHIP_ERROR);

export function getMembership() {
  console.log('getMembership action');
  return (dispatch, getState) => {
    const state = getState();

    return destiny
      .getCurrentMembership(state.auth.accessToken)
      .then(arg => dispatch(getMembershipSuccess(arg)))
      .catch(arg => dispatch(getMembershipError(arg)));
  };
}
