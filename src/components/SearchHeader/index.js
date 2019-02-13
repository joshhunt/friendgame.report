import React, { Component } from 'react';
import cx from 'classnames';
import { debounce, uniqBy } from 'lodash';
import { Link } from 'react-router';
import { pKey } from 'src/lib/destinyUtils';
import { PlatformIcon } from 'src/components/Icon';
import Toggle from 'src/components/Toggle';

import { COUNT, TIME, FIRETEAM, BLUEBERRIES } from 'src/store/app';
import {
  getCacheableSearch,
  getPlayerSearchAutoComplete
} from 'src/lib/destiny';

import s from './styles.styl';

const debouncedInput = debounce(cb => {
  cb();
}, 200);

const ANIMATION_TIME = 1.5 * 1000;

const TITLE = [
  ...'fri'.split(''),
  ...'endgame'.split('').map(l => [l, true]),
  ...'.report'.split('')
];

export default class SearchHeader extends Component {
  s;
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
    const { setSortMode, sortMode, listMode, setListMode } = this.props;
    const { searchResults, isFocused } = this.state;

    return (
      <div className={s.header}>
        <div className={s.headerInner}>
          <div className={s.headerName}>
            <h1 className={s.siteName}>
              <Link className={s.siteNameLink} to="/">
                {TITLE.map(([letter, isEndgame], index) => (
                  <span key={index} className={cx({ [s.endgame]: isEndgame })}>
                    {letter}
                  </span>
                ))}
              </Link>
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

            <Toggle
              className={s.toggle}
              label="Sort by:"
              name="sortmode"
              value={sortMode}
              choices={[
                { id: COUNT, label: 'Matches' },
                { id: TIME, label: 'Duration' }
              ]}
              onChange={ev => setSortMode(ev.target.value)}
            />

            <Toggle
              className={s.toggle}
              label="Show:"
              name="blueberries"
              value={listMode}
              choices={[
                { id: FIRETEAM, label: 'Fireteam' },
                { id: BLUEBERRIES, label: 'Blueberries' }
              ]}
              onChange={ev => setListMode(ev.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }
}
