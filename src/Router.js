import React from 'react';

import './App.css';

import { BrowserRouter, Route } from 'react-router-dom';

import FrontPage from './FrontPage';
import PlayerList from './PlayerList';
import App from './App';

export default function Router() {
  return (
    <BrowserRouter>
      <App>
        <Route exact path="/" component={FrontPage} />
        <Route
          exact
          path="/:membershipType/:membershipId"
          component={PlayerList}
        />
      </App>
    </BrowserRouter>
  );
}
