import React, { Component } from 'react';
import { debounce } from 'lodash';
import Autosuggest from 'react-autosuggest';

import './App.css';

import { format as fmtDate } from 'date-fns';

import getData, { searchForPlayer } from './getPGCRs.js';

function getSuggestionValue(player) {
  return player.displayName;
}

function renderSuggestion(player) {
  return <div>{player.displayName}</div>;
}

class App extends Component {
  state = {
    activities: [],
    players: [],
    matchmadePlayers: [],
    pgcrsLoaded: 1,
    totalActivities: 1,

    playerSearchSuggestions: [],
    playerSearchValue: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      activities: [],
      players: [],
      matchmadePlayers: [],
      pgcrsLoaded: 0,
      totalActivities: 0,
      characters: [],

      playerSearchSuggestions: [],
      playerSearchValue: '',
    };

    this.loadSuggestions = debounce(this._loadSuggestions, 200, {
      leading: true,
    });
  }

  // componentDidMount() {
  // }

  onChange = (event, { newValue }) => {
    this.setState({
      playerSearchValue: newValue,
    });
  };

  _loadSuggestions = ({ value }) => {
    searchForPlayer(value, 2).then(results => {
      this.setState({
        playerSearchSuggestions: results,
      });
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      playerSearchSuggestions: [],
    });
  };

  onSuggestionSelected = (ev, { suggestion }) => {
    console.log('selected:', suggestion);
    this.setState({
      selectedPlayer: suggestion,
    });

    getData(suggestion, ({ ...rest }) => this.setState({ ...rest }));
  };

  render() {
    const {
      pgcrsLoaded,
      totalActivities,
      matchmadePlayers,
      lastPgcrDate,

      playerSearchValue,
      playerSearchSuggestions,
      characters,
    } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Search for player',
      value: playerSearchValue,
      onChange: this.onChange,
    };

    return (
      <div className="App">
        <div className="playerSearch">
          <Autosuggest
            suggestions={playerSearchSuggestions}
            onSuggestionsFetchRequested={this.loadSuggestions}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
            inputProps={inputProps}
          />
        </div>

        <div className="split">
          <div className="playerCount">
            <h2>All players</h2>
            <ol>
              {this.state.players &&
                this.state.players.map(player => (
                  <li
                    key={player.destinyUserInfo.membershipId}
                    style={{ opacity: player.$count > 1 ? 1 : 0.5 }}
                  >
                    {player.destinyUserInfo.displayName} - {player.$count}
                  </li>
                ))}
            </ol>
          </div>

          <div className="playerCount">
            <h2>Match made players</h2>
            <ol>
              {matchmadePlayers &&
                matchmadePlayers.map(player => (
                  <li
                    key={player.destinyUserInfo.membershipId}
                    style={{ opacity: player.$count > 1 ? 1 : 0.5 }}
                  >
                    {player.destinyUserInfo.displayName} - {player.$count}
                  </li>
                ))}
            </ol>
          </div>

          <div className="appStats">
            <p>
              Characters: {characters.length}
              <br />
              Activities: {totalActivities}
              <br />
              PGCRs loaded:{' '}
              {pgcrsLoaded
                ? Math.floor(pgcrsLoaded / totalActivities * 100)
                : 0}% ({pgcrsLoaded})
              <br />
              Last activity:{' '}
              {lastPgcrDate &&
                fmtDate(new Date(lastPgcrDate), 'ddd Do MMM, h:mma')}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
