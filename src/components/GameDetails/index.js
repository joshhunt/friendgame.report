import React, { Fragment } from 'react';
import cx from 'classnames';
import { isString, groupBy, memoize } from 'lodash';

import s from './styles.styl';

import tableStyles from 'app/components/Table/styles.styl';

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

const field = (label, statKey) => ({ label, stat: statKey });

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
  })
];

const GAME_MODE_FIELDS = [
  {
    test: pgcr => pgcr.activityDetails.directorActivityHash === 3577607128,
    fields: GAMBIT_FIELDS
  }
];

function percent(fraction) {
  if (isNaN(fraction)) {
    return '-';
  }
  return `${Math.round(fraction * 100)}%`;
}

function stat(stats, statName) {
  return stats[statName] && stats[statName].basic.displayValue;
}

function TeamTable({ pgcr, teamId, teamMembers }) {
  const team = pgcr.teams.find(
    t => t.teamId === teamId || t.teamId === parseInt(teamId, 10)
  );

  const fieldSet = GAME_MODE_FIELDS.find(gmf => gmf.test(pgcr));

  return (
    <Fragment>
      <thead>
        {team && (
          <tr>
            <td className={s.team} colSpan={(fieldSet.fields.length || 0) + 1}>
              {team.teamName}
            </td>
          </tr>
        )}
        <tr>
          <td>player</td>

          {fieldSet && fieldSet.fields.map(f => <td>{f.label}</td>)}
        </tr>
      </thead>

      <tbody>
        {teamMembers.map(teamMember => {
          const stats = teamMember.extended.values || {};
          return (
            <tr>
              <td>{teamMember.player.destinyUserInfo.displayName}</td>

              {fieldSet &&
                fieldSet.fields.map(f => {
                  return (
                    <td>
                      {isString(f.stat)
                        ? stat(stats, f.stat)
                        : f.stat(stats, teamMember, teamMembers, pgcr, teamId)}
                    </td>
                  );
                })}

              <td />
            </tr>
          );
        })}
      </tbody>
    </Fragment>
  );
}

export default function GameDetails({ pgcr }) {
  if (!pgcr) {
    return 'Loading...';
  }

  const playersPerTeam = Object.entries(
    groupBy(
      pgcr.entries,
      entry => entry.values.team && entry.values.team.basic.value
    )
  );

  return (
    <div className={s.root}>
      <table className={tableStyles.table}>
        {playersPerTeam.map(([teamId, teamMembers], index) => (
          <TeamTable
            key={index}
            pgcr={pgcr}
            teamMembers={teamMembers}
            teamId={teamId}
          />
        ))}
      </table>
    </div>
  );
}
