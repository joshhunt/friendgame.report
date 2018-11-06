import React from 'react';
import cx from 'classnames';
import { groupBy } from 'lodash';

import s from './styles.styl';

import tableStyles from 'app/components/Table/styles.styl';

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

  const totalPrimevalDamage = teamMembers.reduce((acc, teamMember) => {
    return (
      acc +
      (teamMember.extended.values.primevalDamage
        ? teamMember.extended.values.primevalDamage.basic.value
        : 0)
    );
  }, 0);

  return (
    <div className={s.scrollable}>
      {team && <h4>{team.teamName}</h4>}
      <table className={cx(tableStyles.table, s.table)}>
        <thead>
          <tr>
            <td>player</td>
            <td colSpan={3}>motes banked / collected / lost</td>
            <td>motes denied</td>
            <td>motes degraded?</td>
            <td>invasions</td>
            <td>invader deaths</td>
            <td>invader kills</td>
            <td>invasion kills</td>
            <td>primeval damage</td>
            <td>blockers</td>
          </tr>
        </thead>

        <tbody>
          {teamMembers.map(teamMember => {
            const stats = teamMember.extended.values || {};
            return (
              <tr>
                <td>{teamMember.player.destinyUserInfo.displayName}</td>
                <td>{stat(stats, 'motesDeposited')}</td>
                <td>{stat(stats, 'motesPickedUp')}</td>
                <td>{stat(stats, 'motesLost')}</td>
                <td>{stat(stats, 'motesDenied')}</td>
                <td>{stat(stats, 'motesDegraded')}</td>

                <td>{stat(stats, 'invasions')}</td>
                <td>{stat(stats, 'invaderDeaths')}</td>
                <td>{stat(stats, 'invaderKills')}</td>
                <td>{stat(stats, 'invasionKills')}</td>

                <td>
                  {stats.primevalDamage
                    ? percent(
                        stats.primevalDamage.basic.value / totalPrimevalDamage
                      )
                    : null}
                </td>

                <td>
                  {stat(stats, 'smallBlockersSent')}
                  {' / '}
                  {stat(stats, 'mediumBlockersSent')}
                  {' / '}
                  {stat(stats, 'largeBlockersSent')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
      {playersPerTeam.map(([teamId, teamMembers], index) => (
        <TeamTable
          key={index}
          pgcr={pgcr}
          teamMembers={teamMembers}
          teamId={teamId}
        />
      ))}
    </div>
  );
}
