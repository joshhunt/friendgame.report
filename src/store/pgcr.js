import * as destiny from 'src/lib/destiny';
import immer from 'immer';
import { makePayloadAction } from './utils';

const GET_PLAYER_PGCR_HISTORY_SUCCESS = 'Get player PGCR history - success';
const GET_PLAYER_PGCR_HISTORY_ERROR = 'Get player PGCR history - error';

const GET_PGCR_DETAILS_SUCCESS = 'Get PGCR details - success';
const GET_PGCR_DETAILS_ERROR = 'Get PGCR details - error';

const TOGGLE_VIEW_PGCR_DETAILS = 'View PGCR Details';

const defaultState = {
  histories: {},
  pgcr: {},
  viewDetails: {}
};

export default function pgcrReducer(state = defaultState, { type, payload }) {
  return immer(state, draft => {
    switch (type) {
      case TOGGLE_VIEW_PGCR_DETAILS:
        draft.viewDetails[payload] = !draft.viewDetails[payload];
        return draft;

      case GET_PLAYER_PGCR_HISTORY_SUCCESS:
        draft.histories[payload.key] = draft.histories[payload.key] || {};
        draft.histories[payload.key][payload.characterId] =
          payload.data.activities;

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
  { membershipType, membershipId, characterId },
  data
) => {
  return {
    type: GET_PLAYER_PGCR_HISTORY_SUCCESS,
    payload: { key: `${membershipType}/${membershipId}`, characterId, data }
  };
};

const getCharacterPGCRHistoryError = makePayloadAction(
  GET_PLAYER_PGCR_HISTORY_ERROR
);

const getPGCRDetailsSuccess = makePayloadAction(GET_PGCR_DETAILS_SUCCESS);
const getPGCRDetailsError = makePayloadAction(GET_PGCR_DETAILS_ERROR);

export const toggleViewPGCRDetails = makePayloadAction(
  TOGGLE_VIEW_PGCR_DETAILS
);

export function getPGCRDetails(pgcrId) {
  return (dispatch, getState) => {
    const state = getState();

    if (state.pgcr.pgcr[pgcrId]) {
      return;
    }

    return destiny
      .getCacheablePGCRDetails(pgcrId)
      .then(data => dispatch(getPGCRDetailsSuccess({ pgcrId, data })))
      .catch(err => dispatch(getPGCRDetailsError(err)));
  };
}

export function getCharacterPGCRHistory(
  { membershipType, membershipId },
  characterId,
  opts = {}
) {
  return dispatch => {
    return destiny
      .getCharacterPGCRHistory({ membershipType, membershipId, characterId })
      .then(data => {
        dispatch(
          getCharacterPGCRHistorySuccess(
            { membershipType, membershipId, characterId },
            data
          )
        );

        if (opts.fetchPGCRDetails) {
          console.log('fetchPGCRDetails', data);

          data.activities.forEach(activity => {
            dispatch(getPGCRDetails(activity.activityDetails.instanceId));
          });
        }
      })
      .catch(err => dispatch(getCharacterPGCRHistoryError(err)));
  };
}
