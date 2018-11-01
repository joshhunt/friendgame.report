/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from "react";
import { Link } from "react-router";
import { connect } from "react-redux";
import { memoize } from "lodash";
import { AllHtmlEntities } from "html-entities";
import "react-table/react-table.css";

import { profileHasCompletedTriumph } from "src/lib/destinyUtils";

import {
  getClanDetails,
  getClanMembers,
  getProfile,
  getRecentActivitiesForAccount
} from "src/store/clan";

import { setBulkDefinitions } from "src/store/definitions";

import PrettyDate from "src/components/Date";
import Table from "src/components/Table";

import s from "./styles.styl";

const entities = new AllHtmlEntities();
const decode = memoize(string => entities.decode(string));

const TITLES = [
  { title: "Gambit", hash: 3798931976 },
  { title: "Crucible", hash: 3369119720 },
  { title: "Lore", hash: 1754983323 },
  { title: "Raids", hash: 2182090828 },
  { title: "The Dreaming City", hash: 1693645129 },
  { title: "Destinations", hash: 2757681677 },
  { title: "Last Wish: Raid First", hash: 1754815776 }
];

const getCurrentActivity = memoize(profile => {
  const found =
    profile.characterActivities.data &&
    Object.values(profile.characterActivities.data).find(character => {
      return character.currentActivityHash !== 0;
    });

  return found;
});

const baseSort = sortFn => member =>
  member.profile ? sortFn(member) : -99999999;

const maxLight = member =>
  member.profile &&
  Math.max(...Object.values(member.profile.characters.data).map(c => c.light));

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join("/");

class ClanPage extends Component {
  componentDidMount() {
    fetch("https://destiny.plumbing/en/raw/DestinyActivityDefinition.json")
      .then(r => r.json())
      .then(defs => this.props.setBulkDefinitions({ activityDefs: defs }));

    fetch("https://destiny.plumbing/en/raw/DestinyActivityModeDefinition.json")
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
        name: "gamertag",
        cell: d => (
          <Link
            className={s.link}
            to={`/${d.destinyUserInfo.membershipType}/${
              d.destinyUserInfo.membershipId
            }`}
          >
            {d.destinyUserInfo.displayName}
          </Link>
        )
      },
      {
        name: "date joined",
        sortValue: baseSort(member => member.joinDate),
        cell: member => <PrettyDate date={member.joinDate} />
      },
      {
        name: "current light",
        sortValue: baseSort(d => maxLight(d)),
        cell: d => maxLight(d)
      },
      {
        name: "triumph score",
        sortValue: baseSort(
          d =>
            d.profile.profileRecords.data && d.profile.profileRecords.data.score
        ),
        cell: d =>
          d.profile &&
          d.profile.profileRecords.data &&
          d.profile.profileRecords.data.score
      },
      {
        name: "seals",
        cell: d => {
          return TITLES.filter(({ hash }) =>
            profileHasCompletedTriumph(d.profile, hash)
          )
            .map(({ title }) => title)
            .join(", ");
        }
      },
      {
        name: "current activity",
        sortValue: baseSort(member => {
          const currentActivity =
            member.profile && getCurrentActivity(member.profile);

          return currentActivity
            ? currentActivity.dateActivityStarted
            : member.profile.profile.data.dateLastPlayed;
        }),
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
                  {currentActivityModeDef &&
                    `${currentActivityModeDef.displayProperties.name}: `}
                  {currentActivityDef.displayProperties.name}{" "}
                  <span className={s.started}>
                    (Started{" "}
                    <PrettyDate date={currentActivity.dateActivityStarted} />)
                  </span>
                </span>
              )}

              {!currentActivityDef &&
                profile &&
                profile.profile.data && (
                  <span className={s.lastPlayed}>
                    Last played{" "}
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

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(ClanPage);
