import { makePayloadAction } from './utils';

export const COUNT = 'count';
export const TIME = 'time';

const SET_SORT_MODE = 'Set sort mode';

const INITIAL_STATE = {
  sortMode: COUNT
};

export default function appReducer(state = INITIAL_STATE, { type, payload }) {
  switch (type) {
    case SET_SORT_MODE:
      return {
        ...state,
        sortMode: payload
      };

    default:
      return state;
  }
}

export const setSortMode = makePayloadAction(SET_SORT_MODE);
