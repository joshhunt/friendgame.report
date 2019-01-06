// eslint-disable no-console
import React, { Component } from 'react';
import { isString } from 'lodash';
import { Router, Route, browserHistory } from 'react-router';
import { Provider } from 'react-redux';

import store from './store';
import App from './views/App';
import Home from './views/Home';
import UserPage from './views/UserPage';
import ClanPage from './views/ClanPage';
import CrawlPage from './views/CrawlPage';
import TriumphReport from './views/TriumphReport';
import CompareTriumphs from './views/CompareTriumphs';
import NewCollections from './views/NewCollections';
import ActivityGraphPage from './views/ActivityGraphPage';

export default class AppRouter extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router history={browserHistory}>
          <Route component={App}>
            <Route path="/" component={Home} />
            <Route path="/clan/:groupId" component={ClanPage} />
            <Route path="/triumph-report" component={TriumphReport} />
            <route path="/compare-triumphs" component={CompareTriumphs} />
            <route path="/new-collections" component={NewCollections} />
            <Route path="/:membershipType/:membershipId" component={UserPage} />
            <Route
              path="/:membershipType/:membershipId/crawl"
              component={CrawlPage}
            />
            <Route
              path="/:membershipType/:membershipId/activity-graph"
              component={ActivityGraphPage}
            />
          </Route>
        </Router>
      </Provider>
    );
  }
}

/**
 * Warning from React Router, caused by react-hot-loader.
 * The warning can be safely ignored, so filter it from the console.
 * Otherwise you'll see it every time something changes.
 * See https://github.com/gaearon/react-hot-loader/issues/298
 */
if (module.hot) {
  const orgError = console.error;
  console.error = (...args) => {
    if (
      args &&
      args.length === 1 &&
      isString(args[0]) &&
      args[0].indexOf('You cannot change <Router routes>;') > -1
    ) {
      // React route changed
    } else {
      // Log the error as normally
      orgError.apply(console, args);
    }
  };
}
