/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { memoize } from 'lodash';
import { AllHtmlEntities } from 'html-entities';
import 'react-table/react-table.css';

import {
  getClanDetails,
  getClanMembers,
  getProfile,
  getRecentActivitiesForAccount
} from 'src/store/clan';
import { bungieUrl } from 'src/lib/destinyUtils';

import { setBulkDefinitions } from 'src/store/definitions';

import PrettyDate from 'src/components/Date';
import Table from 'src/components/Table';

import s from './styles.styl';

const entities = new AllHtmlEntities();
const decode = memoize(string => entities.decode(string));

const getCurrentActivity = memoize(profile => {
  const found =
    profile.characterActivities.data &&
    Object.values(profile.characterActivities.data).find(character => {
      return character.currentActivityHash !== 0;
    });

  return found;
});

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join(':');

class ClanPage extends Component {
  componentDidMount() {
    fetch('https://destiny.plumbing/en/raw/DestinyActivityDefinition.json')
      .then(r => r.json())
      .then(defs => this.props.setBulkDefinitions({ activityDefs: defs }));

    fetch('https://destiny.plumbing/en/raw/DestinyActivityModeDefinition.json')
      .then(r => r.json())
      .then(defs => this.props.setBulkDefinitions({ activityModeDefs: defs }));

    this.props.getClanDetails(this.props.routeParams.groupId);

    this.props.getClanMembers(this.props.routeParams.groupId).then(data => {
      data.results.forEach(member => {
        this.props.getProfile(member.destinyUserInfo).then(profile => {
          // this.props.getRecentActivitiesForAccount(profile.profile);
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

    return members.map(member => {
      return {
        ...member,
        profile: profiles[k(member.destinyUserInfo)]
      };
    });
  }

  renderName() {
    const clanDetails = this.getClanDetails();

    if (clanDetails) {
      return decode(clanDetails.detail.name);
    }

    return <span>{this.props.routeParams.groupId}</span>;
  }

  render() {
    const members = this.getClanMembers();
    const clan = this.getClanDetails();
    const { profiles, activityDefs, activityModeDefs } = this.props;
    const data = members.map(m => ({
      ...m,
      profile: profiles[k(m.destinyUserInfo)]
    }));

    const columns = [
      {
        name: 'gamertag',
        cell: d => d.destinyUserInfo.displayName
      },
      {
        name: 'date joined',
        sortValue: member => member.joinDate,
        cell: member => <PrettyDate date={member.joinDate} />
      },
      {
        name: 'current light',
        cell: d =>
          d.profile &&
          Math.max(
            ...Object.values(d.profile.characters.data).map(c => c.light)
          )
      },
      {
        name: 'current activity',
        sortValue: member => {
          const currentActivity =
            member.profile && getCurrentActivity(member.profile);
          return currentActivity && currentActivity.currentActivityHash;
        },
        cell: member => {
          const profile = member.profile;
          const currentActivity =
            member.profile && getCurrentActivity(member.profile);

          let currentActivityDef =
            activityDefs &&
            currentActivity &&
            activityDefs[currentActivity.currentActivityHash];

          const currentActivityModeDef =
            activityModeDefs &&
            currentActivity &&
            activityModeDefs[currentActivity.currentActivityModeHash];

          return (
            <span>
              {currentActivityDef && (
                <span>
                  {currentActivityDef.displayProperties.icon && (
                    <span>
                      <span
                        style={{
                          WebkitMask: `url(${bungieUrl(
                            currentActivityDef.displayProperties.icon
                          )}) center / cover`
                        }}
                        className={s.activityIcon}
                      />{' '}
                    </span>
                  )}
                  {currentActivityModeDef &&
                    `${currentActivityModeDef.displayProperties.name}: `}
                  {currentActivityDef.displayProperties.name}{' '}
                  <span className={s.started}>
                    (Started{' '}
                    <PrettyDate date={currentActivity.dateActivityStarted} />
                    )
                  </span>
                </span>
              )}

              {!currentActivityDef &&
                profile &&
                profile.profile.data && (
                  <span className={s.lastPlayed}>
                    Last played{' '}
                    <PrettyDate date={profile.profile.data.dateLastPlayed} />
                  </span>
                )}
            </span>
          );
        }
      }
    ];

    return (
      <div className={s.root}>
        <h2>Clan {this.renderName()}</h2>
        {clan && (
          <div className={s.details}>
            <p>
              <em>{decode(clan.detail.motto)}</em>
            </p>
            <p>{decode(clan.detail.about)}</p>
          </div>
        )}

        <div className={s.tableWrapper}>
          {members.length > 0 && (
            <Table
              data={data}
              columns={columns}
              defaultSortField="current activity"
            />
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    activityDefs: state.definitions.activityDefs,
    activityModeDefs: state.definitions.activityModeDefs,
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
