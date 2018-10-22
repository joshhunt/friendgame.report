import * as destiny from 'src/lib/destiny';
import immer from 'immer';
import { makePayloadAction } from './utils';

const GET_PLAYER_PGCR_HISTORY_SUCCESS = 'Get player PGCR history - success';
const GET_PLAYER_PGCR_HISTORY_ERROR = 'Get player PGCR history - error';

const defaultState = {
  histories: {},
  games: {}
};

export default function pgcrReducer(state = defaultState, { type, payload }) {
  switch (type) {
    case GET_PLAYER_PGCR_HISTORY_SUCCESS:
      return immer(state, draft => {
        draft.histories[payload.key] = draft.histories[payload.key] || {};
        draft.histories[payload.key][payload.characterId] =
          payload.data.activities;
      });

    default:
      return state;
  }
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

export function getCharacterPGCRHistory(
  { membershipType, membershipId },
  characterId
) {
  return (dispatch, getState) => {
    return destiny
      .getCharacterPGCRHistory({ membershipType, membershipId, characterId })
      .then(data => {
        dispatch(
          getCharacterPGCRHistorySuccess(
            { membershipType, membershipId, characterId },
            data
          )
        );
      })
      .catch(err => dispatch(getCharacterPGCRHistoryError(err)));
  };
}
