import * as destiny from 'src/lib/destiny';
import { pKey } from 'src/lib/destinyUtils';
import immer from 'immer';
import { makePayloadAction } from './utils';

const GET_PLAYER_PGCR_HISTORY_SUCCESS = 'Get player PGCR history - success';
const GET_PLAYER_PGCR_HISTORY_ERROR = 'Get player PGCR history - error';

const GET_PGCR_DETAILS_SUCCESS = 'Get PGCR details - success';
const GET_PGCR_DETAILS_ERROR = 'Get PGCR details - error';
const BULK_PGCR_DETAILS = 'Bulk PGCR Details';

const defaultState = {
  histories: {},
  pgcr: {}
};

export default function pgcrReducer(state = defaultState, { type, payload }) {
  return immer(state, draft => {
    switch (type) {
      case GET_PLAYER_PGCR_HISTORY_SUCCESS:
        draft.histories[payload.key] = draft.histories[payload.key] || {};
        draft.histories[payload.key][payload.characterId] = payload.data;

        return draft;

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

const getCharacterPGCRHistoryError = makePayloadAction(
  GET_PLAYER_PGCR_HISTORY_ERROR
);

const getPGCRDetailsSuccess = makePayloadAction(GET_PGCR_DETAILS_SUCCESS);
const getPGCRDetailsError = makePayloadAction(GET_PGCR_DETAILS_ERROR);

let pgcrBatchStore = [];
let timeoutId = null;
const DISPATCH_INTERVAL = 500;

function bulkDispatch(dispatch) {
  console.log('DISPATCHING BULK PGCRS!', pgcrBatchStore.length);
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
        console.log('  queueing pgcr...');
        pgcrBatchStore.push({ pgcrId, data });

        if (shouldMakeNewOne) {
          console.log('** no timeout, making one **');
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
        dispatch(getCharacterPGCRHistoryError(err));
      });
  };
}
