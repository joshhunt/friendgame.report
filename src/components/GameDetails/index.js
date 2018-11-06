import React from 'react';
import { groupBy } from 'lodash';

import s from './styles.styl';

import tableStyles from 'app/components/Table/styles.styl';

function percent(fraction) {
  if (isNaN(fraction)) {
    return '-';
  }
  return `${Math.round(fraction * 100)}%`;
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
    <div>
      {team && <h4>{team.teamName}</h4>}
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <td>player</td>
            <td>motes collected</td>
            <td>motes lost</td>
            <td>motes denied</td>
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
                <td>
                  {stats.motesPickedUp &&
                    stats.motesPickedUp.basic.displayValue}
                </td>
                <td>{stats.motesLost && stats.motesLost.basic.displayValue}</td>
                <td>
                  {stats.motesDenied && stats.motesDenied.basic.displayValue}
                </td>
                <td>
                  {stats.primevalDamage
                    ? percent(
                        stats.primevalDamage.basic.value / totalPrimevalDamage
                      )
                    : null}
                </td>

                <td>
                  {stats.smallBlockersSent &&
                    stats.smallBlockersSent.basic.displayValue}
                  {' / '}
                  {stats.mediumBlockersSent &&
                    stats.mediumBlockersSent.basic.displayValue}
                  {' / '}
                  {stats.largeBlockersSent &&
                    stats.largeBlockersSent.basic.displayValue}
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
