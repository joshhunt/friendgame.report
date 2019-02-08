import React, { Component } from 'react';
import { debounce } from 'lodash';
import { Link } from 'react-router';

import { getCacheableSearch } from 'src/lib/destiny';
import { pKey } from 'src/lib/destinyUtils';
import { addRecentProfile, getRecentProfiles } from 'src/lib/ls';
import { PlatformIcon } from 'src/components/Icon';

import s from './styles.styl';

const debouncedInput = debounce(cb => {
  cb();
}, 200);

const ANIMATION_TIME = 1.5 * 1000;

function ProfileResultsList({
  results,
  compareTriumphsLink,
  saveRecentPlayer
}) {
  return (
    <div>
      {results.map(result => {
        const slug = pKey(result);
        const link = `/${slug}`;

        return (
          <Link
            className={s.resultPlayer}
            key={result.membershipId}
            to={link}
            onClick={() => saveRecentPlayer(result)}
          >
            <PlatformIcon
              className={s.platformIcon}
              membershipType={result.membershipType}
            />
            {result.displayName}
          </Link>
        );
      })}
    </div>
  );
}

export default class SearchForPlayer extends Component {
  state = {
    loading: false,
    recentProfiles: null
  };

  componentDidMount() {
    this.setState({
      recentProfiles: getRecentProfiles()
    });
  }

  onInputChange = ev => {
    const { value } = ev.target;
    debouncedInput(() => {
      const endAnimation = this.animate();

      getCacheableSearch(value)
        .then(results => {
          this.setState({ results });
          endAnimation();
        })
        .catch(() => {
          endAnimation();
        });
    });
  };

  animate = () => {
    if (this.animationStartTime) {
      this.animationStartTime = Date.now();
      return () => {};
    }

    this.animationStartTime = Date.now();

    this.setState({ loading: true });

    return () => {
      const finishedTime = Date.now();
      const duration = finishedTime - this.animationStartTime;

      if (duration > ANIMATION_TIME) {
        this.animationStartTime = null;
        this.setState({ loading: false });
      } else {
        const timeLeft = ANIMATION_TIME - duration;
        setTimeout(() => {
          this.animationStartTime = null;
          this.setState({ loading: false });
        }, timeLeft);
      }
    };
  };

  saveRecentPlayer = player => {
    addRecentProfile(player);
  };

  render() {
    const { className, compareTriumphsLink } = this.props;
    const { loading, results, recentProfiles } = this.state;

    return (
      <div className={className}>
        <h2>Search for player</h2>

        <div className={s.searchWrapper}>
          <input
            className={s.searchField}
            type="text"
            placeholder="Search for gamertag"
            onChange={this.onInputChange}
          />
          {loading && <div className={s.loadingBar} />}
        </div>

        {results && (
          <div className={s.results}>
            <h4>Results</h4>

            <ProfileResultsList
              results={results}
              compareTriumphsLink={compareTriumphsLink}
              saveRecentPlayer={this.saveRecentPlayer}
            />
          </div>
        )}

        {recentProfiles && (
          <div className={s.results}>
            <h4>Recent profiles</h4>

            <ProfileResultsList
              results={recentProfiles}
              compareTriumphsLink={compareTriumphsLink}
              saveRecentPlayer={this.saveRecentPlayer}
            />
          </div>
        )}
      </div>
    );
  }
}
