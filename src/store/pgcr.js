import * as destiny from 'src/lib/destiny';
import { pKey } from 'src/lib/destinyUtils';
import immer from 'immer';
import { makePayloadAction } from './utils';

const GET_PLAYER_PGCR_HISTORY_SUCCESS = 'Get player PGCR history - success';
const GET_PLAYER_PGCR_HISTORY_ERROR = 'Get player PGCR history - error';

const GET_PGCR_DETAILS_SUCCESS = 'Get PGCR details - success';
const GET_PGCR_DETAILS_ERROR = 'Get PGCR details - error';

const defaultState = {
  histories: {},
  pgcr: {},
};

export default function pgcrReducer(state = defaultState, { type, payload }) {
  return immer(state, draft => {
    switch (type) {
      case GET_PLAYER_PGCR_HISTORY_SUCCESS:
        draft.histories[payload.key] = draft.histories[payload.key] || {};
        draft.histories[payload.key][payload.characterId] =
          payload.data;

        return draft;

      case GET_PGCR_DETAILS_SUCCESS:
        return {
          ...state,
          pgcr: {
            ...state.pgcr,
            [payload.pgcrId]: payload.data
          }
        };

      default:
        return state;
    }
  });
}

const getCharacterPGCRHistorySuccess = (
  userCharacterInfo,
  data
) => {
  return {
    type: GET_PLAYER_PGCR_HISTORY_SUCCESS,
    payload: { key: pKey(userCharacterInfo), characterId: userCharacterInfo.characterId, data }
  };
};

const getCharacterPGCRHistoryError = makePayloadAction(
  GET_PLAYER_PGCR_HISTORY_ERROR
);

const getPGCRDetailsSuccess = makePayloadAction(GET_PGCR_DETAILS_SUCCESS);
const getPGCRDetailsError = makePayloadAction(GET_PGCR_DETAILS_ERROR);

export function getPGCRDetails(pgcrId) {
  return (dispatch, getState) => {
    const state = getState();

    if (state.pgcr.pgcr[pgcrId]) {
      return;
    }

    return destiny
      .getCacheablePGCRDetails(pgcrId)
      .then(data => {
        dispatch(getPGCRDetailsSuccess({ pgcrId, data }))
      })
      .catch(err => dispatch(getPGCRDetailsError(err)));
  };
}

export function getCharacterPGCRHistory(
  userInfo,
  characterId,
  opts = {}
) {
  const userCharacterInfo = { ...userInfo, characterId };

  return dispatch => {
    return destiny
      .getCharacterPGCRHistory(userCharacterInfo)
      .then(activities => {
        dispatch(getCharacterPGCRHistorySuccess(userCharacterInfo, activities));

        if (opts.fetchPGCRDetails) {
          activities.forEach(activity => {
            dispatch(getPGCRDetails(activity.activityDetails.instanceId));
          });
        }
      })
      .catch(err => {
        console.error('got error!', err);
        dispatch(getCharacterPGCRHistoryError(err))
      });
  };
}
