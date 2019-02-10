import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { getRecentProfiles } from 'src/lib/ls';
import { PlatformIcon } from 'src/components/Icon';
import { pKey } from 'src/lib/destinyUtils';

import s from './styles.styl';

class App extends Component {
  state = { recentProfiles: [] };

  componentDidMount() {
    this.setState({
      recentProfiles: getRecentProfiles()
    });
  }

  render() {
    const { recentProfiles } = this.state;

    return (
      <div className={s.root}>
        <p style={{ marginTop: 50 }}>
          Find the people you play with the most in Destiny 2
        </p>
        <p style={{ marginBottom: 50 }}>Type in a gamertag above to start</p>

        {recentProfiles.length > 0 && (
          <div>
            <h3>Recent profiles</h3>
            <div className={s.recents}>
              {recentProfiles.map((profile, index) => {
                return (
                  <Link
                    className={s.recentProfile}
                    key={index}
                    to={`/${pKey(profile)}`}
                  >
                    <PlatformIcon membershipType={profile.membershipType} />{' '}
                    {profile.displayName}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

const mapDispatchToActions = {};

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(App);
