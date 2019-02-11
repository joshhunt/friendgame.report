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

export function Player({
  className,
  userInfo,
  children,
  parentPlayer,
  isSkeleton
}) {
  const Element = isSkeleton ? 'div' : Link;
  const secondPlayerUrlName =
    userInfo.membershipType === 4
      ? userInfo.membershipId
      : userInfo.displayName;

  return (
    <Element
      to={!isSkeleton && `/${pKey(parentPlayer)}/${secondPlayerUrlName}`}
      className={cx(className, s.player, { [s.isSkeleton]: isSkeleton })}
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
    </Element>
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
      small,
      playerClassName,
      playerChildren,
      className
    } = this.props;

    const list =
      players && players.length
        ? players
        : new Array(idealLength).fill().map((i, n) => skeletonPlayer(n));

    return (
      <div className={cx(className, s.root, { [s.small]: small })}>
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
                className={playerClassName}
              >
                <PlayerChildren
                  childrenOverride={playerChildren}
                  isSkeleton={player.isSkeleton}
                  activeSortMode={activeSortMode}
                  numOfMatches={player && player.pgcrs && player.pgcrs.length}
                  timePlayed={player.timePlayedTogether}
                />
              </Player>
            </li>
          ))}
        </FlipMove>
      </div>
    );
  }
}

function PlayerChildren({
  isSkeleton,
  childrenOverride,
  activeSortMode,
  numOfMatches,
  timePlayed
}) {
  if (isSkeleton) {
    return null;
  }

  if (childrenOverride) {
    return childrenOverride;
  }

  return activeSortMode === COUNT
    ? `${numOfMatches} matches`
    : formatDuration(timePlayed);
}
