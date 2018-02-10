import React, { Component } from 'react';

import { format as fmtDate } from 'date-fns';

import Player from './Player';
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
      players,
    } = this.state;

    return (
      <div className="playerListRoot">
        <div className="split">
          <div className="playerCount">
            <h2 className="playerListSectionTitle">All players</h2>
            {players &&
              players.map((player, index) => (
                <Player
                  index={index + 1}
                  player={player}
                  key={player.destinyUserInfo.membershipId}
                />
              ))}
          </div>

          <div className="playerCount">
            <h2 className="playerListSectionTitle">Matchmade players</h2>
            {matchmadePlayers &&
              matchmadePlayers.map((player, index) => (
                <Player
                  index={index + 1}
                  player={player}
                  key={player.destinyUserInfo.membershipId}
                />
              ))}
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
