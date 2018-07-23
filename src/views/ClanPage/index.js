import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  getClanDetails,
  getClanMembers,
  getProfile,
  getRecentActivitiesForAccount
} from 'src/store/clan';
import { bungieUrl } from 'src/lib/destinyUtils';

import { setBulkDefinitions } from 'src/store/definitions';

import PrettyDate from 'src/components/Date';
import Icon from 'src/components/Icon';
import BungieImage from 'src/components/BungieImage';

import s from './styles.styl';

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join(':');

class ClanPage extends Component {
  componentDidMount() {
    fetch('https://destiny.plumbing/en/raw/DestinyActivityDefinition.json')
      .then(r => r.json())
      .then(defs => this.props.setBulkDefinitions({ activityDefs: defs }));

    this.props.getClanDetails(this.props.routeParams.groupId);

    this.props.getClanMembers(this.props.routeParams.groupId).then(data => {
      data.results.forEach(member => {
        this.props.getProfile(member.destinyUserInfo).then(profile => {
          this.props.getRecentActivitiesForAccount(profile.profile);
        });
      });
    });
  }

  getClanDetails() {
    const membersQuery = this.props.clanDetails[this.props.routeParams.groupId];
    return membersQuery;
  }

  getClanMembers() {
    const { clanMembers, profiles } = this.props;
    const membersQuery = clanMembers[this.props.routeParams.groupId];
    const members = membersQuery ? membersQuery.results : [];

    return members.sort((a, b) => {
      const playerA = profiles[k(a.destinyUserInfo)];
      const playerB = profiles[k(b.destinyUserInfo)];

      if (playerA && !playerB) {
        return -1;
      } else if (!playerA && playerB) {
        return 1;
      } else if (!playerA && !playerB) {
        return 0;
      }

      return (
        new Date(playerB.data.dateLastPlayed) -
        new Date(playerA.data.dateLastPlayed)
      );
    });
  }

  renderName() {
    const clanDetails = this.getClanDetails();

    if (clanDetails) {
      return clanDetails.detail.name;
    }

    return <span>{this.props.routeParams.groupId}</span>;
  }

  render() {
    const members = this.getClanMembers();
    const clan = this.getClanDetails();
    const { profiles, recentActivities, activityDefs } = this.props;

    return (
      <div className={s.root}>
        <h2>Clan {this.renderName()}</h2>
        {clan && (
          <div className={s.details}>
            <p>
              <em>{clan.detail.motto}</em>
            </p>
            <p>{clan.detail.about}</p>
          </div>
        )}

        {members.length > 0 && (
          <table className={s.table}>
            <thead>
              <tr>
                <td>#</td>
                <td>gamertag</td>
                <td>date joined</td>
                <td>last played</td>
                {/*<td>Last activity</td>*/}
              </tr>
            </thead>

            <tbody>
              {members.map((member, index) => {
                const key = k(member.destinyUserInfo);
                const profile = profiles[key];
                const lastActivity =
                  recentActivities[key] && recentActivities[key][0];

                let lastActivityDef;

                if (activityDefs && lastActivity) {
                  lastActivityDef =
                    activityDefs[lastActivity.activityDetails.referenceId];
                }

                return (
                  <tr key={key}>
                    <td className={s.smallCell}>{index + 1}</td>
                    <td>{member.destinyUserInfo.displayName}</td>
                    <td>
                      <PrettyDate date={member.joinDate} />
                    </td>
                    <td>
                      {profile &&
                        profile.data && (
                          <PrettyDate date={profile.data.dateLastPlayed} />
                        )}{' '}
                      {/*lastActivity && (
                        <a
                          href={`https://destinytracker.com/d2/pgcr/${
                            lastActivity.activityDetails.instanceId
                          }`}
                          target="_blank"
                        >
                          <Icon name="external-link-square-alt" />
                        </a>
                      )*/}
                      {lastActivityDef && (
                        <a
                          href={`https://destinytracker.com/d2/pgcr/${
                            lastActivity.activityDetails.instanceId
                          }`}
                          target="_blank"
                          style={{
                            webkitMask: `url(${bungieUrl(
                              lastActivityDef.displayProperties.icon
                            )}) center / cover`
                          }}
                          className={s.activityIcon}
                        />
                      )}
                    </td>
                    {/*<td>
                      {lastActivityDef &&
                        lastActivityDef.displayProperties.name}
                    </td>*/}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    activityDefs: state.definitions.activityDefs,
    isAuthenticated: state.auth.isAuthenticated,
    clanMembers: state.clan.clanMembers,
    clanDetails: state.clan.clanDetails,
    profiles: state.clan.profiles,
    recentActivities: state.clan.recentActivities
  };
}

const mapDispatchToActions = {
  setBulkDefinitions,
  getClanDetails,
  getClanMembers,
  getProfile,
  getRecentActivitiesForAccount
};

export default connect(mapStateToProps, mapDispatchToActions)(ClanPage);
