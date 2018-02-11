import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { format as fmtDate } from 'date-fns';

import Player from './Player';

import './PlayerList.css';

function List({ players, onPlayerClick }) {
  if (!players.length) {
    return (
      <p style={{ textAlign: 'center' }}>
        <em>No players to show</em>
      </p>
    );
  }

  return players.map((player, index) => (
    <Player
      onClick={onPlayerClick}
      index={index + 1}
      player={player}
      key={player.destinyUserInfo.membershipId}
    />
  ));
}

export default function PlayerList(props) {
  const {
    title,
    onPlayerClick,
    data: { fireteamPlayers, matchmadePlayers, activities },
  } = props;

  const first = activities[activities.length - 1];
  const last = activities[0];

  return (
    <div className="playerCount">
      <div className="playerListContent">
        <Tabs selectedTabClassName="playerListTabActive">
          <div className="playerListHeader">
            <h2 className="playerListTitle playerListSectionTitle">{title}</h2>
            {first &&
              last && (
                <div className="playerListSectionInfo">
                  {activities.length} activities <span>from</span>{' '}
                  {fmtDate(new Date(first.period), 'Do MMM')} <span>to</span>{' '}
                  {fmtDate(new Date(last.period), 'Do MMM')}
                </div>
              )}
            <TabList className="playerListTabList">
              <Tab className="playerListTab">Fireteam</Tab>
              <Tab className="playerListTab">Matchmade</Tab>
            </TabList>
          </div>

          <TabPanel>
            <h3 className="playerListTitle">Fireteam</h3>
            <List players={fireteamPlayers} onPlayerClick={onPlayerClick} />
          </TabPanel>

          <TabPanel>
            <h3 className="playerListTitle">Matchmade</h3>
            <List players={matchmadePlayers} onPlayerClick={onPlayerClick} />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}
