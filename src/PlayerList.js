import React, { Component } from 'react';

import { format as fmtDate } from 'date-fns';

import getData from './getPGCRs.js';

import './PlayerList.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activities: [],
      players: [],
      matchmadePlayers: [],
      pgcrsLoaded: 0,
      totalActivities: 0,
      characters: [],
    };
  }

  componentDidMount() {
    const { membershipType, membershipId } = this.props.match.params;
    getData({ membershipType, membershipId }, ({ ...rest }) =>
      this.setState({ ...rest }),
    );
  }

  render() {
    const {
      pgcrsLoaded,
      totalActivities,
      matchmadePlayers,
      lastPgcrDate,
      characters,
    } = this.state;

    return (
      <div className="playerListRoot">
        <div className="split">
          <div className="playerCount">
            <h2 className="playerListSectionTitle">All players</h2>
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

          {/* <div className="appStats">
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
          </div> */}
        </div>
      </div>
    );
  }
}

export default App;
