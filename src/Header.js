import React, { Component } from 'react';
import { uniqBy, debounce } from 'lodash';
import Autosuggest from 'react-autosuggest';
import { withRouter } from 'react-router-dom';

import '@fortawesome/fontawesome';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

import { searchBungiePlayer } from './destiny';
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
  return (
    <div style={{ fontWeight: player.bungieResult ? 600 : 400 }}>
      <FontAwesomeIcon
        className="suggestPlatformIcon"
        icon={PLATFORM_ICON[player.membershipType]}
      />{' '}
      {player.displayName}
    </div>
  );
}

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      membershipType: DEFAULT_MEMBERSHIP_TYPE,
      playerSearchSuggestions: [],
      playerSearchValue: '',
    };

    this.loadSuggestions = debounce(this.loadSuggestions, 500, {
      leading: true,
    });
  }

  componentDidMount() {
    this.mounted = true;

    this.intervalId = setInterval(() => {
      if (window.__THIS_PLAYER) {
        this.setState({ thisPlayer: window.__THIS_PLAYER });
      }
    }, 500);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.clearInterval(this.intervalId);
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

    let trialsReportResults = [];
    let bungieResults = [];

    searchForPlayer(value, this.state.membershipType).then(results => {
      trialsReportResults = results;
      const suggestions = uniqBy(
        [...bungieResults, ...trialsReportResults],
        player => {
          return `${player.membershipType}:${player.membershipId}`;
        },
      );
      this.setState({
        playerSearchSuggestions: suggestions,
      });
    });

    searchBungiePlayer(value).then(results => {
      bungieResults = results;
      const suggestions = uniqBy(
        [...bungieResults, ...trialsReportResults],
        player => {
          return `${player.membershipType}:${player.membershipId}`;
        },
      );
      this.setState({
        playerSearchSuggestions: suggestions,
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
      thisPlayer,
    } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Search for player',
      value: playerSearchValue || (thisPlayer ? thisPlayer.displayName : ''),
      onChange: this.onChange,
    };

    return (
      <div className="header">
        <div className="headerContent">
          <div className="headerTop">
            <div className="headerLogoish">
              <i className="fal fa-users headerIcon" />
              <h1 className="siteName">
                fri<span>endgame</span>.report
              </h1>
            </div>

            <div className="headerMain">
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
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(Header);
