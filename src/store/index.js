import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import app from './app';
import auth from './auth';
import clan from './clan';
import definitions, { SET_BULK_DEFINITIONS } from './definitions';

const rootReducer = combineReducers({
  app,
  auth,
  clan,
  definitions
});

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        actionsBlacklist: [SET_BULK_DEFINITIONS],
        stateSanitizer: state => ({
          ...state,
          definitions: state.definitions ? '[hidden]' : state.definitions
        })
      })
    : compose;

const enhancer = composeEnhancers(applyMiddleware(thunk));

const store = createStore(rootReducer, enhancer);
window.__store = store;

export default store;
