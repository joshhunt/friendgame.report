import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import './App.css';

import FrontPage from './FrontPage';
import Details from './Details';
import App from './App';

export default function Router() {
  return (
    <BrowserRouter>
      <App>
        <Route exact path="/" component={FrontPage} />
        <Route
          exact
          path="/:membershipType/:membershipId"
          component={Details}
        />
      </App>
    </BrowserRouter>
  );
}
