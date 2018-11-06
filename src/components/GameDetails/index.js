import React, { Fragment } from 'react';
import { isString, groupBy } from 'lodash';

import tableStyles from 'app/components/Table/styles.styl';
import s from './styles.styl';
import GAME_MODE_FIELDS, { stat } from './fields';

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
