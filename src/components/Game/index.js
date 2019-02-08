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

function Game({ className, pgcr, standing, modeDef, activityDef }) {
  return (
    <div className={cx(className, s.root)}>
      <div className={STANDING[standing]} />

      <div className={s.activityIconWrapper}>
        <img
          alt=""
          className={s.activityIcon}
          src={`https://bungie.net${modeDef && modeDef.displayProperties.icon}`}
        />
      </div>

      <div className={s.mode}>{modeDef && modeDef.displayProperties.name}</div>

      <div className={s.activity}>
        {activityDef && activityDef.displayProperties.name}
        <br />
        {makeTimeago(pgcr.period)}
      </div>
    </div>
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

  const ownEntry = pgcr.entries.find(
    entry =>
      entry.player.destinyUserInfo.membershipId ===
      (ownProfile && ownProfile.profile.data.userInfo.membershipId)
  );
  const standing = ownEntry ? ownEntry.standing : undefined;

  return {
    modeDef,
    standing,
    activityDef
  };
}

export default connect(mapStateToProps)(Game);
