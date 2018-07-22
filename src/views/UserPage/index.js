import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { getClansForUser } from 'src/store/clan';

import s from './styles.styl';

class UserPage extends Component {
  componentDidMount() {
    this.props.getClansForUser(this.props.routeParams);
  }

  renderName() {
    return <span>{this.props.routeParams.membshipId}</span>;
  }

  render() {
    const clans = this.props.clans || [];

    return (
      <div className={s.root}>
        <h2>Clans for {this.renderName()}</h2>

        {clans.map(clan => (
          <p key={clan.group.groupId}>
            <Link to={`/clan/${clan.group.groupId}`}>{clan.group.name}</Link>
          </p>
        ))}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    clans: state.clan.clanResults
  };
}

const mapDispatchToActions = { getClansForUser };

export default connect(mapStateToProps, mapDispatchToActions)(UserPage);
