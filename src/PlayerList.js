import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Player from './Player';

import './PlayerList.css';

function List({ players }) {
  if (!players.length) {
    return (
      <p style={{ textAlign: 'center' }}>
        <em>No players to show</em>
      </p>
    );
  }

  return players.map((player, index) => (
    <Player
      index={index + 1}
      player={player}
      key={player.destinyUserInfo.membershipId}
    />
  ));
}

export default class PlayerList extends Component {
  hello() {}

  render() {
    const { data: { fireteamPlayers, matchmadePlayers }, title } = this.props;

    return (
      <div className="playerCount">
        <div className="playerListContent">
          <Tabs selectedTabClassName="playerListTabActive">
            <div className="playerListHeader">
              <h2 className="playerListTitle playerListSectionTitle">
                {title}
              </h2>
              <TabList className="playerListTabList">
                <Tab className="playerListTab">Fireteam</Tab>
                <Tab className="playerListTab">Matchmade</Tab>
              </TabList>
            </div>

            <TabPanel>
              <h3 className="playerListTitle">Fireteam</h3>
              <List players={fireteamPlayers} />
            </TabPanel>
            <TabPanel>
              <h3 className="playerListTitle">Matchmade</h3>
              <List players={matchmadePlayers} />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    );
  }
}
