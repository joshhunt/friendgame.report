import { makePayloadAction } from './utils';

export const COUNT = 'count';
export const TIME = 'time';

export const FIRETEAM = 'fireteam';
export const BLUEBERRIES = 'blueberries';

const SET_SORT_MODE = 'Set sort mode';
const SET_LIST_MODE = 'Set list mode';

const INITIAL_STATE = {
  sortMode: COUNT,
  listMode: FIRETEAM
};

export default function appReducer(state = INITIAL_STATE, { type, payload }) {
  switch (type) {
    case SET_SORT_MODE:
      return {
        ...state,
        sortMode: payload
      };

    case SET_LIST_MODE:
      return {
        ...state,
        listMode: payload
      };

    default:
      return state;
  }
}

export const setSortMode = makePayloadAction(SET_SORT_MODE);
export const setListMode = makePayloadAction(SET_LIST_MODE);
