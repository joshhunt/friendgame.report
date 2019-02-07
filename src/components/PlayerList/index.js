import React, { Component } from 'react';
import { Link } from 'react-router';
import FlipMove from 'react-flip-move';

import { pKey } from 'src/lib/destinyUtils';
import BungieImage from 'src/components/BungieImage';
import { COUNT } from 'src/store/app';

import s from './styles.styl';

function formatDuration(ms) {
  var sec_num = ms / 1000;
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor((sec_num - hours * 3600) / 60);

  return [hours > 0 && `${hours}h`, minutes > 0 && `${minutes}m`]
    .filter(Boolean)
    .join(' ');
}

function Player({ userInfo, children, parentPlayer }) {
  // <Link to={`/${pKey(parentPlayer)}+${userInfo.displayName}`} className={s.player}>
  return (
    <div className={s.player}>
      <div className={s.playerWell}>
        <BungieImage className={s.playerIcon} src={userInfo.iconPath} />
      </div>
      <div className={s.playerMain}>
        <div className={s.playerName}>{userInfo.displayName}</div>
        <div className={s.playerAlt}>{children}</div>
      </div>
    </div>
  );
}

export default class PlayerList extends Component {
  render() {
    const { players, title, parentPlayer, activeSortMode } = this.props;

    return (
      <div className={s.root}>
        <div className={s.top}>
          <h3 className={s.title}>{title}</h3>
        </div>

        <FlipMove
          typeName="ol"
          enterAnimation="fade"
          leaveAnimation="fade"
          className={s.list}
        >
          {players &&
            players.map(player => (
              <li
                className={s.listItem}
                key={player.player.destinyUserInfo.displayName}
              >
                <Player
                  userInfo={player.player.destinyUserInfo}
                  parentPlayer={parentPlayer}
                >
                  {activeSortMode === COUNT
                    ? `${player.pgcrs.length} matches`
                    : formatDuration(player.timePlayedTogether)}
                </Player>
              </li>
            ))}
        </FlipMove>

        {/* {players.length !== sorted.length && ( */}
        {/*   <div className={s.showAll}>Show all {players.length} players</div> */}
        {/* )} */}
      </div>
    );
  }
}
