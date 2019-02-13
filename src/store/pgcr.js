import { get } from 'lodash';
import immer from 'immer';

import * as destiny from 'src/lib/destiny';
import { pKey } from 'src/lib/destinyUtils';
import { makePayloadAction } from './utils';

const GET_PLAYER_PGCR_HISTORY_SUCCESS = 'Get player PGCR history - success';
const GET_PLAYER_PGCR_HISTORY_ERROR = 'Get player PGCR history - error';

const GET_PGCR_DETAILS_SUCCESS = 'Get PGCR details - success';
const GET_PGCR_DETAILS_ERROR = 'Get PGCR details - error';
const BULK_PGCR_DETAILS = 'Bulk PGCR Details';

const defaultState = {
  history: {},
  pgcr: {}
};

const ensureCharacterHistory = (draftState, payload, cb) => {
  draftState.history[payload.key] = draftState.history[payload.key] || {};

  draftState.history[payload.key][payload.characterId] = draftState.history[
    payload.key
  ][payload.characterId] || { history: [], errorMessage: null };

  cb(draftState.history[payload.key][payload.characterId]);

  return draftState;
};

export default function pgcrReducer(state = defaultState, { type, payload }) {
  return immer(state, draft => {
    switch (type) {
      case GET_PLAYER_PGCR_HISTORY_SUCCESS:
        return ensureCharacterHistory(draft, payload, character => {
          character.history = payload.data;
        });

      case GET_PLAYER_PGCR_HISTORY_ERROR:
        return ensureCharacterHistory(draft, payload, character => {
          character.errorMessage = payload.errorMessage;
        });

      case GET_PGCR_DETAILS_SUCCESS:
        draft.pgcr[payload.pgcrId] = payload.data;
        return draft;

      case BULK_PGCR_DETAILS:
        payload.forEach(eachPayload => {
          draft.pgcr[eachPayload.pgcrId] = eachPayload.data;
        });

        return draft;

      default:
        return draft;
    }
  });
}

const getCharacterPGCRHistorySuccess = (userCharacterInfo, data) => {
  return {
    type: GET_PLAYER_PGCR_HISTORY_SUCCESS,
    payload: {
      key: pKey(userCharacterInfo),
      characterId: userCharacterInfo.characterId,
      data
    }
  };
};

const getCharacterPGCRHistoryError = (userCharacterInfo, error) => {
  console.log({ userCharacterInfo, error });
  const apiMessage = get(error, 'data.Message');
  const messagePrefix = apiMessage
    ? 'Bungie API error - '
    : 'Unexpected error - ';
  const errorMessage = `${messagePrefix} ${apiMessage ||
    error.message ||
    `Really unexpected error - ${error.toString()}`}`;

  return {
    type: GET_PLAYER_PGCR_HISTORY_ERROR,
    payload: {
      key: pKey(userCharacterInfo),
      characterId: userCharacterInfo.characterId,
      error,
      errorMessage
    }
  };
};

const getPGCRDetailsSuccess = makePayloadAction(GET_PGCR_DETAILS_SUCCESS);
const getPGCRDetailsError = makePayloadAction(GET_PGCR_DETAILS_ERROR);

let pgcrBatchStore = [];
let timeoutId = null;
const DISPATCH_INTERVAL = 1000;

function bulkDispatch(dispatch) {
  dispatch({
    type: BULK_PGCR_DETAILS,
    payload: pgcrBatchStore
  });

  pgcrBatchStore = [];
  timeoutId = null;
}

export function getPGCRDetails(pgcrId, batch) {
  return (dispatch, getState) => {
    const state = getState();

    if (state.pgcr.pgcr[pgcrId]) {
      return;
    }

    return destiny
      .getCacheablePGCRDetails(pgcrId)
      .then(data => {
        if (!batch) {
          dispatch(getPGCRDetailsSuccess({ pgcrId, data }));
        }

        const shouldMakeNewOne = timeoutId === null;
        pgcrBatchStore.push({ pgcrId, data });

        if (shouldMakeNewOne) {
          timeoutId = window.setTimeout(
            bulkDispatch.bind(null, dispatch),
            DISPATCH_INTERVAL
          );
        }
      })
      .catch(err => dispatch(getPGCRDetailsError(err)));
  };
}

export function getCharacterPGCRHistory(userInfo, characterId, opts = {}) {
  const userCharacterInfo = { ...userInfo, characterId };

  return dispatch => {
    return destiny
      .getCharacterPGCRHistory(userCharacterInfo)
      .then(activities => {
        dispatch(getCharacterPGCRHistorySuccess(userCharacterInfo, activities));

        if (opts.fetchPGCRDetails) {
          activities.forEach(activity => {
            dispatch(getPGCRDetails(activity.activityDetails.instanceId, true));
          });
        }
      })
      .catch(err => {
        console.error('got error!', err);
        dispatch(getCharacterPGCRHistoryError(userCharacterInfo, err));
      });
  };
}
