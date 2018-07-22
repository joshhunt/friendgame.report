import { makePayloadAction } from './utils';

export const SET_AUTH = 'Set Auth';

export default function definitionsReducer(state = {}, { type, payload }) {
  switch (type) {
    case SET_AUTH: {
      return {
        ...state,
        ...payload
      };
    }

    default:
      return state;
  }
}

export const setBulkDefinitions = makePayloadAction(SET_AUTH);
