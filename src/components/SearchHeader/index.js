import React, { Component } from 'react';
import { debounce, uniqBy } from 'lodash';
import { Link } from 'react-router';
import { pKey } from 'src/lib/destinyUtils';
import { PlatformIcon } from 'src/components/Icon';

import { COUNT, TIME } from 'src/store/app';
import {
  getCacheableSearch,
  getPlayerSearchAutoComplete
} from 'src/lib/destiny';

import s from './styles.styl';

const debouncedInput = debounce(cb => {
  cb();
}, 200);

const ANIMATION_TIME = 1.5 * 1000;

export default class SearchHeader extends Component {
  // state = {
  //   loading: false,
  //   searchResults: [
  //     {
  //       blizzardName: null,
  //       bnetId: 5949996,
  //       displayName: 'thisjoshthat',
  //       lastPlayed: '2017-09-09T16:18:16Z',
  //       locale: null,
  //       membershipId: '4611686018469271298',
  //       membershipType: '2'
  //     },
  //     {
  //       blizzardName: null,
  //       bnetId: 5949996,
  //       displayName: 'thisjoshthat',
  //       lastPlayed: '2017-04-02T05:17:03Z',
  //       locale: 'en',
  //       membershipId: '4611686018432128055',
  //       membershipType: '1'
  //     }
  //   ]
  // };

  state = {};

  onInputChange = ev => {
    const { value } = ev.target;
    debouncedInput(() => {
      const endAnimation = this.animate();

      let trialsReportResults = [];
      let bungieResults = [];

      const setResults = () => {
        this.setState({
          searchResults: uniqBy(
            [...bungieResults, ...trialsReportResults],
            r => r.membershipId
          )
        });
      };

      const trialsPromise = getPlayerSearchAutoComplete(value);
      const bungiePromise = getCacheableSearch(value);

      trialsPromise.then(results => {
        trialsReportResults = results;
        setResults();
      });

      bungiePromise.then(results => {
        bungieResults = results.map(r => ({ ...r, bungieResult: true }));
        setResults();
      });

      Promise.all([trialsPromise, bungiePromise])
        .then(() => {
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

  onFocus = () => {
    this.setState({ isFocused: true });
  };

  onBlur = () => {
    setTimeout(() => {
      this.setState({ isFocused: false });
    }, 250);
  };

  render() {
    const { setSortMode, sortMode } = this.props;
    const { searchResults, isFocused } = this.state;

    return (
      <div className={s.header}>
        <div className={s.headerInner}>
          <div className={s.headerName}>
            <h1 className={s.siteName}>
              fri<span>endgame</span>.report
            </h1>
          </div>
          <div className={s.headerMain}>
            <div className={s.inputWrapper}>
              <input
                className={s.searchInput}
                placeholder="Search for player"
                type="text"
                onChange={this.onInputChange}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
              />

              {isFocused && searchResults && searchResults.length > 0 && (
                <div className={s.resultsDropdown}>
                  {searchResults.map(result => (
                    <Link className={s.result} to={`/${pKey(result)}`}>
                      <PlatformIcon membershipType={result.membershipType} />{' '}
                      {result.displayName}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className={s.radioStack}>
              Sort by:
              <div className={s.radio}>
                <label>
                  <input
                    value={COUNT}
                    type="radio"
                    name="sort"
                    checked={sortMode === COUNT}
                    onChange={ev => setSortMode(ev.target.value)}
                  />
                  <div className={s.radioBg} />
                  <div className={s.radioLabel}>Matches</div>
                </label>
              </div>
              <div className={s.radio}>
                <label>
                  <input
                    value={TIME}
                    type="radio"
                    name="sort"
                    checked={sortMode === TIME}
                    onChange={ev => setSortMode(ev.target.value)}
                  />
                  <div className={s.radioBg} />
                  <div className={s.radioLabel}>Duration</div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
