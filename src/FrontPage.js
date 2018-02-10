import React, { Component } from 'react';
import { debounce } from 'lodash';
import Autosuggest from 'react-autosuggest';
import { withRouter } from 'react-router-dom';

import { searchForPlayer } from './getPGCRs.js';

import './App.css';

const DEFAULT_MEMBERSHIP_TYPE = 2;

function getSuggestionValue(player) {
  return player.displayName;
}

function renderSuggestion(player) {
  return <div>{player.displayName}</div>;
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      membershipType: DEFAULT_MEMBERSHIP_TYPE,
      playerSearchSuggestions: [],
      playerSearchValue: '',
    };

    this.loadSuggestions = debounce(this._loadSuggestions, 200, {
      leading: true,
    });
  }

  onChange = (event, { newValue }) => {
    this.setState({
      playerSearchValue: newValue,
    });
  };

  _loadSuggestions = ({ value }) => {
    searchForPlayer(value, this.state.membershipType).then(results => {
      this.setState({
        playerSearchSuggestions: results,
      });
    });
  };

  clearSuggestions = () => {
    this.setState({
      playerSearchSuggestions: [],
    });
  };

  onSuggestionSelected = (ev, { suggestion }) => {
    const { membershipType, membershipId } = suggestion;
    this.props.history.push(`/${membershipType}/${membershipId}`);
  };

  onMembershipTypeChange = ev => {
    console.log(ev.target.value);
    this.setState({
      membershipType: ev.target.value,
    });
  };

  render() {
    const {
      membershipType,

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
        <h1>friendgame.report</h1>
        <div className="playerSearch">
          <select value={membershipType} onChange={this.onMembershipTypeChange}>
            <option value={2}>Playstation</option>
            <option value={1}>Xbox</option>
            <option value={4}>Battle.net</option>
          </select>

          <Autosuggest
            suggestions={playerSearchSuggestions}
            onSuggestionsFetchRequested={this.loadSuggestions}
            onSuggestionsClearRequested={this.clearSuggestions}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
            inputProps={inputProps}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(App);
