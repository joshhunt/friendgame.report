import React, { Component } from 'react';
import { Link } from 'react-router';
import FlipMove from 'react-flip-move';
import cx from 'classnames';

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

function Player({ userInfo, children, parentPlayer, isSkeleton }) {
  return (
    <Link
      to={!isSkeleton && `/${pKey(parentPlayer)}/${userInfo.displayName}`}
      className={cx(s.player, { [s.isSkeleton]: isSkeleton })}
    >
      <div className={s.playerWell}>
        {isSkeleton ? (
          <div className={s.skeletonIcon} />
        ) : (
          <BungieImage className={s.playerIcon} src={userInfo.iconPath} />
        )}
      </div>
      <div className={s.playerMain}>
        <div className={s.playerName}>{userInfo.displayName}</div>
        <div className={s.playerAlt}>{children}</div>
      </div>
    </Link>
  );
}

const skeletonPlayer = index => ({
  isSkeleton: true,
  player: {
    destinyUserInfo: {
      displayName: `dummy player ${index}`
    }
  }
});

export default class PlayerList extends Component {
  render() {
    const {
      players,
      title,
      parentPlayer,
      activeSortMode,
      idealLength,
      small
    } = this.props;

    const list =
      players && players.length
        ? players
        : new Array(idealLength).fill().map((i, n) => skeletonPlayer(n));

    return (
      <div className={cx(s.root, { [s.small]: small })}>
        <div className={s.top}>
          <h3 className={s.title}>{title}</h3>
        </div>

        <FlipMove
          typeName="ol"
          enterAnimation="fade"
          leaveAnimation="fade"
          className={s.list}
        >
          {list.map(player => (
            <li
              className={s.listItem}
              key={player.player.destinyUserInfo.displayName}
            >
              <Player
                isSkeleton={player.isSkeleton}
                userInfo={player.player.destinyUserInfo}
                parentPlayer={parentPlayer}
              >
                {!player.isSkeleton &&
                  (activeSortMode === COUNT
                    ? `${player.pgcrs.length} matches`
                    : formatDuration(player.timePlayedTogether))}
              </Player>
            </li>
          ))}
        </FlipMove>
      </div>
    );
  }
}
