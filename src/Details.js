import React, { Component } from 'react';
import Modal from 'react-modal';

import PlayerList from './PlayerList';
import PlayerModal from './PlayerModal';
import CrimsonDays from './CrimsonDays';
import getData from './getPGCRs.js';

import { getActivityModeDefinitions, getActivityDefinitions } from './destiny';

import './Details.css';

import rose from './rose.js';
import './rose.css';

// const DISPLAY_CRIMSON = window.location.search.includes('crimson');
const DISPLAY_CRIMSON = true;

const INITIAL_STATE = {
  activities: [],
  pgcrsLoaded: 0,
  totalActivities: 0,
  characters: [],
  modal: null,
  pvpData: {
    fireteamPlayers: [],
    matchmadePlayers: [],
    activities: [],
  },
  pveData: {
    fireteamPlayers: [],
    matchmadePlayers: [],
    activities: [],
  },
  doublesData: {
    fireteamPlayers: [],
    matchmadePlayers: [],
    activities: [],
  },
};

const MODAL_STYLES = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    marginTop: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  content: {
    position: 'static',
    background: 'none',
    border: 'none',
    height: '100%',
  },
};

class Details extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    this.getStats();

    getActivityDefinitions().then(activityDefs => {
      this.activityDefs = activityDefs;
    });

    getActivityModeDefinitions().then(activityModeDefs => {
      this.activityModeDefs = activityModeDefs;
    });

    rose(document.body);
  }

  componentWillUpdate(props) {
    if (props !== this.props) {
      this.getStats(props);
    }
  }

  getStats = (props = this.props) => {
    this.setState({ ...INITIAL_STATE });
    const { membershipType, membershipId } = props.match.params;
    const cb = ({ ...rest }) =>
      this.setState({ ...rest }, () => {
        this.setModal();
      });
    getData({ membershipType, membershipId }, cb);
  };

  closeModal = () => {
    this.modalPlayer = null;
    this.setState({ modal: null });
  };

  setModal = () => {
    const { modalPlayer } = this;

    if (!modalPlayer) {
      return;
    }

    const mutualActivities = this.state.activities.filter(activity => {
      if (!activity.$pgcr) {
        return false;
      }

      for (let i = 0; i < activity.$pgcr.entries.length; i++) {
        const entry = activity.$pgcr.entries[i];
        if (
          entry.player.destinyUserInfo.membershipId ===
          modalPlayer.destinyUserInfo.membershipId
        ) {
          return true;
        }
      }

      return false;
    });

    this.setState({
      modal: {
        player: modalPlayer,
        activities: mutualActivities,
        activityModeDefs: this.activityModeDefs,
        activityDefs: this.activityDefs,
      },
    });
  };

  onPlayerClick = (ev, player) => {
    ev.preventDefault();
    this.modalPlayer = player;

    this.setModal();
  };

  render() {
    const {
      pvpData,
      pveData,
      doublesData,
      pgcrsLoaded,
      totalActivities,
      characters,
      loadedCharactersActivity,
      modal,
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

        {DISPLAY_CRIMSON && !loading && <CrimsonDays data={doublesData} />}

        <div className="split">
          <PlayerList
            title="PvP"
            data={pvpData}
            onPlayerClick={this.onPlayerClick}
          />

          <PlayerList
            title="PvE"
            data={pveData}
            onPlayerClick={this.onPlayerClick}
          />
        </div>

        <Modal
          isOpen={!!modal}
          onRequestClose={this.closeModal}
          contentLabel="Modal"
          style={MODAL_STYLES}
        >
          {modal && (
            <PlayerModal
              player={modal.player}
              activities={modal.activities}
              activityModeDefs={modal.activityModeDefs}
              activityDefs={modal.activityDefs}
            />
          )}
        </Modal>
      </div>
    );
  }
}

export default Details;
