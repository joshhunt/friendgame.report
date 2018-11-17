import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'react-tippy';
import { memoize } from 'lodash';

import 'react-tippy/dist/tippy.css';

import BungieImage from 'src/components/BungieImage';
import s from './styles.styl';

const NO_ICON = '/img/misc/missing_icon_d2.png';

if (false) {
  const defs = {};

  Object.values(defs.DestinyHistoricalStatsDefinition)
    .map(statDef => ({
      statDef,
      records: Object.values(defs.DestinyRecordDefinition).filter(
        r => r.displayProperties.name === statDef.statName
      )
    }))
    .filter(({ records }) => records.length > 0)
    .reduce((acc, d) => {
      return {
        ...acc,
        [d.statDef.statId]: d.records.map(r => r.displayProperties.icon)
      };
    }, {});
}

function Medal({ statDef, count, className, fallbackIcons }) {
  const statId = statDef && statDef.statId;
  const icon =
    (statDef && statDef.iconImage) ||
    (fallbackIcons[statId] && fallbackIcons[statId][0]) ||
    NO_ICON;

  return (
    <Tooltip
      html={
        <Fragment>
          <div className={s.name}>{statDef.statName}</div>
          <div className={s.description}>{statDef.statDescription}</div>
        </Fragment>
      }
      position="top"
      arrow
      followCursor
    >
      <div className={s.root}>
        <BungieImage className={s.icon} src={icon} />

        {count > 1 && <div className={s.badge}>{count}</div>}
      </div>
    </Tooltip>
  );
}

const getFallbackIcons = memoize(defs => {
  return Object.values(defs.DestinyHistoricalStatsDefinition || {})
    .map(statDef => ({
      statDef,
      records: Object.values(defs.DestinyRecordDefinition || {}).filter(
        r => r.displayProperties.name === statDef.statName
      )
    }))
    .filter(({ records }) => records.length > 0)
    .reduce((acc, d) => {
      return {
        ...acc,
        [d.statDef.statId]: d.records.map(r => r.displayProperties.icon)
      };
    }, {});
});

const mapStateToProps = (state, ownProps) => ({
  fallbackIcons: getFallbackIcons(state.definitions)
});

export default connect(mapStateToProps)(Medal);
