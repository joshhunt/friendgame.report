import React from 'react';

import { connect } from 'react-redux';

import PrettyDate from 'src/components/Date';

import s from './styles.styl';

const STANDING = {
  0: s.standingVictory,
  1: s.standingDefeat,
  undefined: s.standing
};

function GameRow({ game, modeDef, activityDef }) {
  return (
    <tr>
      <td>
        <div
          className={
            STANDING[game.values.standing && game.values.standing.basic.value]
          }
        />
        <div className={s.activityIconWrapper}>
          <img
            alt=""
            className={s.activityIcon}
            src={`https://bungie.net${modeDef.displayProperties.icon}`}
          />
        </div>
        <div className={s.mode}>
          {modeDef && modeDef.displayProperties.name}
        </div>
        <div className={s.activity}>
          {activityDef && activityDef.displayProperties.name}
        </div>
      </td>

      <td>
      <div className={s.statSet}>
        <div className={s.stat}>
          <div className={s.statName}>
            score
          </div>
          <div className={s.statValue}>
            {game.values.score && game.values.score.basic.displayValue}
          </div>
        </div>
      </div>

      </td>

      <td>
        {game.values.timePlayedSeconds &&
          game.values.timePlayedSeconds.basic.displayValue}
      </td>

      <td>
        <PrettyDate date={game.period} />
      </td>

      <td>
        <a
          href={`https://destinytracker.com/d2/pgcr/${
            game.activityDetails.instanceId
          }`}
        >
          DTR
        </a>
      </td>

      <td>{game.activityDetails.instanceId}</td>
    </tr>
  );
}

function mapStateToProps(state, { game }) {
  const {
    DestinyActivityModeDefinition,
    DestinyActivityDefinition
  } = state.definitions;

  if (!(DestinyActivityModeDefinition && DestinyActivityDefinition)) {
    return {};
  }

  const modeDef = Object.values(DestinyActivityModeDefinition).find(
    d => d.modeType === game.activityDetails.mode
  );

  const activityDef =
    DestinyActivityDefinition[game.activityDetails.referenceId];

  return {
    modeDef,
    activityDef
  };
}

export default connect(mapStateToProps)(GameRow);
