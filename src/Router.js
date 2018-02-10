import React, { Component } from 'react';

import './App.css';

import { BrowserRouter, Route } from 'react-router-dom';

import FrontPage from './FrontPage';
import PlayerList from './PlayerList';

export default function Router() {
  return (
    <BrowserRouter>
      <div>
        <Route exact path="/" component={FrontPage} />
        <Route
          exact
          path="/:membershipType/:membershipId"
          component={PlayerList}
        />
      </div>
    </BrowserRouter>
  );
}
