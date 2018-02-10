import React, { Component } from 'react';

import PlayerList from './PlayerList';
import getData from './getPGCRs.js';

import './Details.css';

const INITIAL_STATE = {
  activities: [],
  pgcrsLoaded: 0,
  totalActivities: 0,
  characters: [],
  pvpData: {
    fireteamPlayers: [],
    matchmadePlayers: [],
  },
  pveData: {
    fireteamPlayers: [],
    matchmadePlayers: [],
  },
};

class Details extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    this.getStats();
  }

  componentWillUpdate(props) {
    if (props !== this.props) {
      this.getStats(props);
    }
  }

  getStats = (props = this.props) => {
    this.setState({ ...INITIAL_STATE });
    const { membershipType, membershipId } = props.match.params;
    getData({ membershipType, membershipId }, ({ ...rest }) =>
      this.setState({ ...rest }),
    );
  };

  render() {
    const {
      pvpData,
      pveData,
      pgcrsLoaded,
      totalActivities,
      characters,
      loadedCharactersActivity,
    } = this.state;
    const percentLoaded = Math.floor(pgcrsLoaded / totalActivities * 100);

    let loading;

    if (!characters) {
      loading = 'Loading profile...';
    } else if (loadedCharactersActivity !== characters.length) {
      loading = 'Loading characters...';
    } else if (percentLoaded !== 100)
      loading = `Loading matches... ${percentLoaded}% complete`;

    return (
      <div className="playerListRoot">
        {loading && <p className="playerListLoading">{loading}</p>}

        <div className="split">
          <PlayerList title="PvP" data={pvpData} />

          <PlayerList title="PvE" data={pveData} />
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

export default Details;
