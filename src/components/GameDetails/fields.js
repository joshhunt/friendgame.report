import React from 'react';
import { memoize } from 'lodash';

import Item from 'app/components/Item';
import Medal from 'app/components/Medal';

import s from './styles.styl';

const getTotalPrimevalDamage = memoize(teamMembers => {
  return teamMembers.reduce((acc, teamMember) => {
    return (
      acc +
      (teamMember.extended.values.primevalDamage
        ? teamMember.extended.values.primevalDamage.basic.value
        : 0)
    );
  }, 0);
});

function percent(fraction) {
  if (isNaN(fraction)) {
    return '-';
  }
  return `${Math.round(fraction * 100)}%`;
}

export function stat(stats, statName) {
  return stats[statName] && stats[statName].basic.displayValue;
}

const field = (label, statKey) => ({ label, stat: statKey });

const WEAPONS_FIELD = field('weapons', (stats, teamMember) => {
  return (
    teamMember.extended.weapons &&
    teamMember.extended.weapons.map(weapon => {
      return <Item className={s.item} hash={weapon.referenceId} />;
    })
  );
});

const MEDALS_FIELD = field(
  'medals',
  (
    stats,
    teamMember,
    teamMembers,
    pgcr,
    teamId,
    DestinyHistoricalStatsDefinition
  ) => {
    return Object.entries(stats)
      .map(([statId, stat]) => {
        const statDef = DestinyHistoricalStatsDefinition[statId];
        return { statId, stat, statDef };
      })
      .filter(({ statDef }) => {
        return statDef && statDef.medalTierHash;
      })
      .map(({ statDef, stat }) => (
        <Medal className={s.item} statDef={statDef} count={stat.basic.value} />
      ));
  }
);

const GAMBIT_FIELDS = [
  field('most deposited', 'motesDeposited'),
  field('picked up', 'motesPickedUp'),
  field('lost', 'motesLost'),
  field('denied', 'motesDenied'),
  field('degraded', 'motesDegraded'),
  field('invasions', 'invasions'),
  field('invader deaths', 'invaderDeaths'),
  field('invaders killed', 'invaderKills'),
  field('invasion kills', 'invasionKills'),
  field('primeval damage', (stats, teamMember, teamMembers) => {
    return stats.primevalDamage
      ? percent(
          stats.primevalDamage.basic.value / getTotalPrimevalDamage(teamMembers)
        )
      : null;
  }),
  field('blockers', stats => {
    return [
      `${stat(stats, 'smallBlockersSent')}`,
      `${stat(stats, 'mediumBlockersSent')}`,
      `${stat(stats, 'largeBlockersSent')}`
    ].join(' / ');
  }),
  WEAPONS_FIELD,
  MEDALS_FIELD
];

const FALLBACK_FIELDS = [WEAPONS_FIELD];

export default [
  {
    test: pgcr => pgcr.activityDetails.directorActivityHash === 3577607128,
    fields: GAMBIT_FIELDS
  },

  {
    test: pgcr => pgcr.activityDetails.modes.includes(5),
    fields: [WEAPONS_FIELD, MEDALS_FIELD]
  },

  { test: () => true, fields: FALLBACK_FIELDS }
];
