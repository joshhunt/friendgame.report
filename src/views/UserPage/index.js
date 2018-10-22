import { orderBy } from 'lodash';
import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { getClansForUser, getProfile } from 'src/store/clan';
import { getCharacterPGCRHistory } from 'src/store/pgcr';
import GamesTable from 'app/components/GamesTable';

import s from './styles.styl';

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join('/');

class UserPage extends Component {
  componentDidMount() {
    this.props.getClansForUser(this.props.routeParams);
    this.props.getProfile(this.props.routeParams).then(profile => {
      Object.keys(profile.characters.data).forEach(characterId => {
        this.props.getCharacterPGCRHistory(this.props.routeParams, characterId);
      });
    });
  }

  getProfile() {
    const key = k(this.props.routeParams);
    const profile = this.props.profiles[key];
    return { profile, key };
  }

  renderName() {
    const { profile, key } = this.getProfile();
    return profile ? profile.profile.data.userInfo.displayName : key;
  }

  render() {
    const games = this.props.gameHistory;
    const clans = this.props.clans || [];

    return (
      <div className={s.root}>
        <h2>Clans for {this.renderName()}</h2>

        {clans.map(clan => (
          <p key={clan.group.groupId}>
            <Link to={`/clan/${clan.group.groupId}`}>{clan.group.name}</Link>
          </p>
        ))}

        <GamesTable games={games} />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const key = `${ownProps.routeParams.membershipType}/${
    ownProps.routeParams.membershipId
  }`;

  const byCharacter = Object.values(state.pgcr.histories[key] || {});
  const allGames = [].concat(...byCharacter);
  const gameHistory = orderBy(allGames, g => new Date(g.period), ['desc']);

  return {
    isAuthenticated: state.auth.isAuthenticated,
    clans: state.clan.clanResults,
    profiles: state.clan.profiles,
    gameHistory
  };
}

const mapDispatchToActions = {
  getClansForUser,
  getProfile,
  getCharacterPGCRHistory
};

export default connect(mapStateToProps, mapDispatchToActions)(UserPage);
