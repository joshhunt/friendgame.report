import React, { Component } from 'react';
import { debounce } from 'lodash';
import Autosuggest from 'react-autosuggest';
import { withRouter } from 'react-router-dom';

import '@fortawesome/fontawesome';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

import { searchForPlayer } from './getPGCRs.js';

import './Header.css';

const DEFAULT_MEMBERSHIP_TYPE = 2;
const PLATFORM_ICON = {
  1: ['fab', 'xbox'],
  2: ['fab', 'playstation'],
  4: ['fab', 'windows'],
};

function getSuggestionValue(player) {
  return player.displayName;
}

function renderSuggestion(player) {
  return <div>{player.displayName}</div>;
}

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      membershipType: DEFAULT_MEMBERSHIP_TYPE,
      playerSearchSuggestions: [],
      playerSearchValue: '',
    };

    this.loadSuggestions = debounce(this.loadSuggestions, 200, {
      leading: true,
    });
  }

  onChange = (event, { newValue }) => {
    this.setState({
      playerSearchValue: newValue,
    });
  };

  loadSuggestions = ({ value }) => {
    if (!value || value.length === 1) {
      return;
    }

    searchForPlayer(value, this.state.membershipType).then(results => {
      this.setState({
        playerSearchSuggestions: results,
      });
    });
  };

  clearSuggestions = () => {
    this.setState({ playerSearchSuggestions: [] });
  };

  onSuggestionSelected = (ev, { suggestion }) => {
    const { membershipType, membershipId } = suggestion;
    this.props.history.push(`/${membershipType}/${membershipId}`);
  };

  onMembershipTypeChange = ev => {
    this.setState({ membershipType: ev.target.value });
  };

  render() {
    const {
      membershipType,
      playerSearchValue,
      playerSearchSuggestions,
    } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Search for player',
      value: playerSearchValue,
      onChange: this.onChange,
    };

    return (
      <div className="header">
        <div className="headerContent">
          <div className="headerTop">
            <i className="fal fa-users headerIcon" />
            <h1 className="siteName">
              fri<span>endgame</span>.report
            </h1>

            <div className="headerPlatform">
              <div className="headerPlatformIcon">
                <FontAwesomeIcon icon={PLATFORM_ICON[membershipType]} />
              </div>

              <div className="headerPlatformDropdown">
                <i className="fas fa-chevron-down" />
              </div>

              <select
                className="headerPlatformSelect"
                value={membershipType}
                onChange={this.onMembershipTypeChange}
              >
                <option value={2}>Playstation</option>
                <option value={1}>Xbox</option>
                <option value={4}>Battle.net</option>
              </select>
            </div>

            <Autosuggest
              theme={{
                container: 'headerInputContainer',
                input: 'headerInput',
                suggestionsContainer: 'headerSuggestions',
              }}
              suggestions={playerSearchSuggestions}
              onSuggestionsFetchRequested={this.loadSuggestions}
              onSuggestionsClearRequested={this.clearSuggestions}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              onSuggestionSelected={this.onSuggestionSelected}
              inputProps={inputProps}
              alwaysRenderSuggestions={true}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Header);
