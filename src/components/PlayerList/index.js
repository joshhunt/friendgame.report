import React, { Component } from 'react';
import { sortBy } from 'lodash';
import FlipMove from 'react-flip-move';

import BungieImage from 'src/components/BungieImage';

import s from './styles.styl';

function formatDuration(ms) {
  var sec_num = ms / 1000;
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor((sec_num - hours * 3600) / 60);

  return [hours > 0 && `${hours}h`, minutes > 0 && `${minutes}m`]
    .filter(Boolean)
    .join(' ');
}

function Player({ userInfo, children }) {
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

const COUNT = 'count';
const TIME = 'time';

export default class PlayerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: COUNT,
      radioGroupName: Math.round(Math.random() * 1000)
    };
  }

  static getDerivedStateFromProps(props, state) {
    return {
      sorted: sortBy(props.players, player => {
        return state.active === COUNT
          ? -player.pgcrs.length
          : -player.timePlayedTogether;
      })
    };
  }

  onChange = ev => {
    this.setState({ active: ev.target.value });
  };

  render() {
    const { players, title } = this.props;
    const { active, radioGroupName, sorted } = this.state;

    return (
      <div className={s.root}>
        <div className={s.top}>
          <h3 className={s.title}>{title}</h3>

          <div className={s.radioStack}>
            <div className={s.radio}>
              <label>
                <input
                  type="radio"
                  value={COUNT}
                  name={radioGroupName}
                  onChange={this.onChange}
                  checked={active === COUNT}
                />
                <div className={s.radioBg} />
                <div className={s.radioLabel}>Matches</div>
              </label>
            </div>

            <div className={s.radio}>
              <label>
                <input
                  type="radio"
                  value={TIME}
                  name={radioGroupName}
                  onChange={this.onChange}
                  checked={active === TIME}
                />
                <div className={s.radioBg} />
                <div className={s.radioLabel}>Duration</div>
              </label>
            </div>
          </div>
        </div>

        <FlipMove
          typeName="ol"
          enterAnimation="fade"
          leaveAnimation="fade"
          className={s.list}
        >
          {sorted.map(player => (
            <li
              className={s.listItem}
              key={player.player.destinyUserInfo.displayName}
            >
              <Player userInfo={player.player.destinyUserInfo}>
                {active === COUNT
                  ? `${player.pgcrs.length} matches`
                  : formatDuration(player.timePlayedTogether)}
              </Player>
            </li>
          ))}
        </FlipMove>
      </div>
    );
  }
}
