import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getClanDetails, getClanMembers, getProfile } from 'src/store/clan';
import PrettyDate from 'src/components/Date';

import s from './styles.styl';

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join(':');

class ClanPage extends Component {
  componentDidMount() {
    this.props.getClanDetails(this.props.routeParams.groupId);

    this.props.getClanMembers(this.props.routeParams.groupId).then(data => {
      data.results.forEach(member => {
        this.props.getProfile(member.destinyUserInfo);
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

    return (
      <div className={s.root}>
        <h2>Clan {this.renderName()}</h2>

        {members.length > 0 && (
          <table className={s.table}>
            <thead>
              <tr>
                <td>#</td>
                <td>gamertag</td>
                <td>Date joined</td>
                <td>Last played</td>
              </tr>
            </thead>

            <tbody>
              {members.map((member, index) => {
                const profile = this.props.profiles[k(member.destinyUserInfo)];
                return (
                  <tr key={member.destinyUserInfo.membershipId}>
                    <td className={s.smallCell}>{index + 1}</td>
                    <td>{member.destinyUserInfo.displayName}</td>
                    <td>
                      <PrettyDate date={member.joinDate} />
                    </td>
                    <td>
                      {profile &&
                        profile.data && (
                          <PrettyDate date={profile.data.dateLastPlayed} />
                        )}
                    </td>
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
    isAuthenticated: state.auth.isAuthenticated,
    clanMembers: state.clan.clanMembers,
    clanDetails: state.clan.clanDetails,
    profiles: state.clan.profiles
  };
}

const mapDispatchToActions = { getClanDetails, getClanMembers, getProfile };

export default connect(mapStateToProps, mapDispatchToActions)(ClanPage);
