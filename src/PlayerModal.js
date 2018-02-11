import React from 'react';
import { format, formatDistanceStrict, formatRelative } from 'date-fns';

import './PlayerModal.css';

const DEBUG = window.location.search.includes('debug');

export default function PlayerModal(props) {
  const { player, activities, activityModeDefs, activityDefs } = props;
  const { displayName, iconPath } = player.destinyUserInfo;

  if (!activityModeDefs || !activityDefs) {
    return (
      <div className="playerModal">
        <div className="loading" style={{ textAlign: 'center' }}>
          Loading...
        </div>
      </div>
    );
  }

  const first = activities[activities.length - 1];
  const firstMode = activityModeDefs[first.activityDetails.mode];
  const firstActivityDef = activityDefs[first.activityDetails.referenceId];

  return (
    <div className="playerModal">
      <div className="playerModalHeader">
        <div className="playerModalHeaderTop">
          <img
            className="playerIcon"
            src={`https://bungie.net${iconPath}`}
            alt=""
          />

          <div className="playerInfo">
            <div className="playerName">{displayName}</div>
            <div className="playerSub">{player.$count} matches together</div>
          </div>
        </div>

        <div className="playerHeaderExtraInfo">
          First met{' '}
          <span>
            {formatDistanceStrict(new Date(first.period), new Date(), {
              addSuffix: true,
            })}
          </span>{' '}
          in <span>{firstMode.displayProperties.name}</span> -{' '}
          <span>{firstActivityDef.displayProperties.name}</span>
        </div>
      </div>

      <div className="activityList">
        <h2 className="modalHeading">Mutual matches</h2>
        {activities.map(activity => {
          const mode = activityModeDefs[activity.activityDetails.mode];
          const activityDef =
            activityDefs[activity.activityDetails.referenceId];
          return (
            <div>
              <div
                className="activity"
                key={activity.activityDetails.instanceId}
              >
                <a
                  href={`https://destinytracker.com/d2/pgcr/${
                    activity.activityDetails.instanceId
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="activityIconWrapper">
                    <img
                      alt=""
                      className="activityIcon"
                      src={`https://bungie.net${mode.displayProperties.icon}`}
                    />
                  </div>
                  <div className="activityInfo">
                    <div className="activityName">
                      {mode.displayProperties.name}
                    </div>
                    <div className="activityLocation">
                      {activityDef.displayProperties.name}
                    </div>
                  </div>
                  <div className="activityExtra">
                    {formatRelative(new Date(activity.period), new Date())}
                  </div>
                </a>
              </div>

              {DEBUG && (
                <table style={{ marginBottom: 30 }}>
                  <thead>
                    <tr>
                      <td>Name</td>
                      <td>Fireteam ID</td>
                      <td>Same Fireteam?</td>
                    </tr>
                  </thead>

                  <tbody>
                    {activity.$pgcr.entries.map(entry => {
                      return (
                        <tr
                          style={{
                            fontWeight:
                              activity.$myFireteamId ===
                              entry.values.fireteamId.basic.value
                                ? 600
                                : 400,
                          }}
                        >
                          <td>{entry.player.destinyUserInfo.displayName}</td>
                          <td>{entry.values.fireteamId.basic.value}</td>
                          <td>
                            {activity.$myFireteamId ===
                            entry.values.fireteamId.basic.value
                              ? 'Yes'
                              : 'No'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
