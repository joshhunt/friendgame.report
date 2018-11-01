import { memoize } from "lodash";
import React, { Component } from "react";
import { connect } from "react-redux";

import { getClansForUser, getProfile } from "src/store/clan";
import { getCharacterPGCRHistory } from "src/store/pgcr";
import { profileHasCompletedTriumph } from "src/lib/destinyUtils";

import s from "./styles.styl";

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join("/");

class CrawlPage extends Component {
  constructor(...args) {
    super(...args);
    this.calledProfiles = [];
    this.state = { calledProfiles: [] };
  }

  componentDidMount() {
    this.props.getClansForUser(this.props.routeParams);
    this.props.getProfile(this.props.routeParams).then(profile => {
      Object.keys(profile.characters.data).forEach(characterId => {
        this.props.getCharacterPGCRHistory(
          this.props.routeParams,
          characterId,
          { fetchPGCRDetails: true }
        );
      });
    });

    this.interval = window.setInterval(() => {
      this.setState({ calledProfiles: this.calledProfiles });
    }, 500);
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  componentDidUpdate() {
    Object.values(this.props.pgcrs).forEach(pgcr => {
      pgcr.entries.forEach(pgcrPlayer => {
        const key = k(pgcrPlayer.player.destinyUserInfo);

        if (this.calledProfiles.includes(key)) {
          return null;
        }

        this.calledProfiles.push(key);
        this.props.getProfile(pgcrPlayer.player.destinyUserInfo);
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
    const { pgcrs, profiles, results } = this.props;
    const { calledProfiles } = this.state;

    return (
      <div className={s.root}>
        <h2>Crawl for {this.renderName()}</h2>
        <ul>
          <li>Loaded {Object.keys(pgcrs).length} PGCRs</li>
          <li>Queued {calledProfiles.length} profiles</li>
          <li>Loaded {Object.keys(profiles).length} profiles</li>
        </ul>

        <ul>
          <li>{results.hasMalfeasance.length} have Malfeasance</li>
          <li>{results.hasLunasHowl.length} have Luna's Howl</li>

          <li>
            {results.doneRelicRumble.length} have done the 'Relic Rumble' secret
            triumph
          </li>

          <li>
            {results.doneRiddleMeThis.length} have done the 'Riddle Me This'
            triumph
          </li>
        </ul>
      </div>
    );
  }
}

const MALFEASANCE_TRIUMPH_HASH = 723502823;
const RELIC_RUMBLE_HASH = 3641166665;
const RIDDLE_ME_THIS_TRIUMPH = 1498253977;
const LUNAS_HOWL_TRIUMPH = 2362939119;

function hasCompletedTriumph(profiles, triumphHash) {
  return profiles.filter(profile => {
    return profileHasCompletedTriumph(profile, triumphHash);
  });
}

const stateForPlayers = memoize(_profiles => {
  const profiles = Object.values(_profiles);

  return {
    hasMalfeasance: hasCompletedTriumph(profiles, MALFEASANCE_TRIUMPH_HASH),
    doneRelicRumble: hasCompletedTriumph(profiles, RELIC_RUMBLE_HASH),
    doneRiddleMeThis: hasCompletedTriumph(profiles, RIDDLE_ME_THIS_TRIUMPH),
    hasLunasHowl: hasCompletedTriumph(profiles, LUNAS_HOWL_TRIUMPH)
  };
});

function mapStateToProps(state, ownProps) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    clans: state.clan.clanResults,
    profiles: state.clan.profiles,
    pgcrs: state.pgcr.pgcr,
    results: stateForPlayers(state.clan.profiles)
  };
}

const mapDispatchToActions = {
  getClansForUser,
  getProfile,
  getCharacterPGCRHistory
};

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(CrawlPage);
