import { flatMap } from 'lodash';

import * as destiny from 'src/lib/destiny';
import { makePayloadAction } from './utils';

export const CLANS_FOR_USER_SUCCESS = 'Clans for user - success';
export const CLANS_FOR_USER_ERROR = 'Clans for user - error';

export const GET_CLAN_DETAILS_SUCCESS = 'Clain details - success';
export const GET_CLAN_DETAILS_ERROR = 'Clain details - error';

export const GET_CLAN_MEMBERS_SUCCESS = 'Clain members - success';
export const GET_CLAN_MEMBERS_ERROR = 'Clain members - error';

export const GET_PROFILE_SUCCESS = 'Get profile - success';
export const GET_PROFILE_ERROR = 'Get profile - error';

export const PROFILE_RECENT_ACTIVITIES_SUCCESS =
  'Get profile recent activities - success';
export const PROFILE_RECENT_ACTIVITIES_ERROR =
  'Get profile recent activities - error';

const INITIAL_STATE = {
  clanDetails: {},
  clanMembers: {},
  profiles: {},
  recentActivities: {}
};

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join('/');

export default function clanReducer(state = INITIAL_STATE, { type, payload }) {
  switch (type) {
    case GET_CLAN_DETAILS_SUCCESS: {
      return {
        ...state,
        clanDetails: {
          ...state.clanDetails,
          [payload.detail.groupId]: payload
        }
      };
    }

    case GET_CLAN_MEMBERS_SUCCESS: {
      return {
        ...state,
        clanMembers: {
          ...state.clanMembers,
          [payload.$groupId]: payload
        }
      };
    }

    case GET_PROFILE_SUCCESS: {
      return {
        ...state,
        profiles: {
          ...state.profiles,
          [k(payload.profile.data.userInfo)]: payload
        }
      };
    }

    case PROFILE_RECENT_ACTIVITIES_SUCCESS: {
      return {
        ...state,
        recentActivities: {
          ...state.recentActivities,
          [payload.$player]: payload.activities
        }
      };
    }

    case CLANS_FOR_USER_SUCCESS: {
      return {
        ...state,
        clanResults: payload.results,
        error: null
      };
    }

    case CLANS_FOR_USER_ERROR: {
      return {
        ...state,
        clanResults: null,
        error: payload
      };
    }

    default:
      return state;
  }
}

export const clansForUserSuccess = makePayloadAction(CLANS_FOR_USER_SUCCESS);
export const clansForUserError = makePayloadAction(CLANS_FOR_USER_ERROR);

export function getClansForUser({ membershipType, membershipId }) {
  return (dispatch, getState) => {
    const state = getState();

    return destiny
      .getClansForUser({ membershipType, membershipId }, state.auth.accessToken)
      .then(arg => dispatch(clansForUserSuccess(arg)))
      .catch(arg => dispatch(clansForUserError(arg)));
  };
}

export const getClanDetailsSuccess = makePayloadAction(
  GET_CLAN_DETAILS_SUCCESS
);
export const getClanDetailsError = makePayloadAction(GET_CLAN_DETAILS_ERROR);

export function getClanDetails(groupId) {
  return (dispatch, getState) => {
    const state = getState();

    return destiny
      .getClan(groupId, state.auth.accessToken)
      .then(arg => dispatch(getClanDetailsSuccess(arg)))
      .catch(arg => dispatch(getClanDetailsError(arg)));
  };
}

export const getClanMembersSuccess = makePayloadAction(
  GET_CLAN_MEMBERS_SUCCESS
);
export const getClanMembersError = makePayloadAction(GET_CLAN_MEMBERS_ERROR);

export function getClanMembers(groupId) {
  return (dispatch, getState) => {
    const state = getState();

    return destiny
      .getClanMembers(groupId, state.auth.accessToken)
      .then(data => {
        dispatch(getClanMembersSuccess({ ...data, $groupId: groupId }));
        return data;
      })
      .catch(err => dispatch(getClanMembersError(err)));
  };
}

export const getProfileSuccess = makePayloadAction(GET_PROFILE_SUCCESS);
export const getProfileError = makePayloadAction(GET_PROFILE_ERROR);

export function getProfile({ membershipType, membershipId }) {
  return (dispatch, getState) => {
    const state = getState();
    const prevProfile =
      state.clan.profiles[k({ membershipType, membershipId })];

    if (prevProfile) {
      console.log('already have profile data');
      return Promise.resolve({ profile: prevProfile });
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

export const getRecentActivitiesForAccountSuccess = makePayloadAction(
  PROFILE_RECENT_ACTIVITIES_SUCCESS
);
export const getRecentActivitiesForAccountError = makePayloadAction(
  PROFILE_RECENT_ACTIVITIES_ERROR
);

export function getRecentActivitiesForAccount(profile) {
  return (dispatch, getState) => {
    const {
      characterIds,
      userInfo: { membershipType, membershipId }
    } = profile.data;

    const promises = characterIds.map(characterId => {
      return destiny.getRecentActivities({
        membershipType,
        membershipId,
        characterId
      });
    });

    Promise.all(promises)
      .then(results => {
        const activities = flatMap(results, r => r.activities)
          .filter(Boolean)
          .sort((a, b) => {
            return new Date(b.period) - new Date(a.period);
          });

        dispatch(
          getRecentActivitiesForAccountSuccess({
            activities,
            $player: k(profile.data.userInfo)
          })
        );
      })
      .catch(err => dispatch(getRecentActivitiesForAccountError(err)));
  };
}
