import React from 'react';
import { memoize } from 'lodash';
import { format } from 'date-fns';
import cx from 'classnames';
import { connect } from 'react-redux';

import s from './styles.styl';

const STANDING = {
  0: s.standingVictory,
  1: s.standingDefeat,
  undefined: s.standing
};

const makeTimeago = memoize(stamp => {
  const date = new Date(stamp);
  return format(date, 'd LLL Y, h:mm aaaa');
});

function Game({ className, pgcr, modeDef, activityDef }) {
  return (
    <a
      className={cx(className, s.root)}
      href={`https://destinytracker.com/d2/pgcr/${
        pgcr.activityDetails.instanceId
      }`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={s.accessory}>
        <div
          className={
            STANDING[pgcr.values.standing && pgcr.values.standing.basic.value]
          }
        />

        <div className={s.activityIconWrapper}>
          <img
            alt=""
            className={s.activityIcon}
            src={`https://bungie.net${modeDef &&
              modeDef.displayProperties.icon}`}
          />
        </div>
      </div>

      <div className={s.main}>
        <div className={s.mode}>
          {modeDef && modeDef.displayProperties.name}
        </div>

        <div className={s.sub}>
          {activityDef && activityDef.displayProperties.name}
        </div>
      </div>

      <div className={s.accessory}>
        <div className={s.sub}>{makeTimeago(pgcr.period)}</div>
      </div>
    </a>
  );
}

function mapStateToProps(state, { pgcr, ownProfile }) {
  const {
    DestinyActivityModeDefinition,
    DestinyActivityDefinition
  } = state.definitions;

  if (!(DestinyActivityModeDefinition && DestinyActivityDefinition)) {
    return {};
  }

  const modeDef = Object.values(DestinyActivityModeDefinition).find(
    d => d.modeType === pgcr.activityDetails.mode
  );

  const activityDef =
    DestinyActivityDefinition[pgcr.activityDetails.referenceId];

  return {
    modeDef,
    activityDef
  };
}

export default connect(mapStateToProps)(Game);
