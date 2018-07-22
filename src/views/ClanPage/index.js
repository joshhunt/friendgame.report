import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getClanDetails, getClanMembers } from 'src/store/clan';
import PrettyDate from 'src/components/Date';

import s from './styles.styl';

class ClanPage extends Component {
  componentDidMount() {
    this.props.getClanDetails(this.props.routeParams.groupId);
    this.props.getClanMembers(this.props.routeParams.groupId);
  }

  getClanDetails() {
    const membersQuery = this.props.clanDetails[this.props.routeParams.groupId];
    return membersQuery;
  }

  getClanMembers() {
    const membersQuery = this.props.clanMembers[this.props.routeParams.groupId];
    return membersQuery ? membersQuery.results : [];
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
                <td>Date Joined</td>
              </tr>
            </thead>

            <tbody>
              {members.map((member, index) => (
                <tr key={member.destinyUserInfo.membershipId}>
                  <td className={s.smallCell}>{index + 1}</td>
                  <td>{member.destinyUserInfo.displayName}</td>
                  <td>
                    <PrettyDate date={member.joinDate} />
                  </td>
                </tr>
              ))}
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
    clanDetails: state.clan.clanDetails
  };
}

const mapDispatchToActions = { getClanDetails, getClanMembers };

export default connect(mapStateToProps, mapDispatchToActions)(ClanPage);
