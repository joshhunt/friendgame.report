import React from 'react';
import { connect } from 'react-redux';

import { setSortMode as setSortModeAction, COUNT, TIME } from 'src/store/app';

import s from './styles.styl';

function App({ children, sortMode, setSortMode }) {
  return (
    <div className={s.root}>
      <div className={s.header}>
        <div className={s.headerInner}>
          <div className={s.headerName}>
            <h1 className={s.siteName}>
              fri<span>endgame</span>.report
            </h1>
          </div>
          <div className={s.headerMain}>
            <input
              className={s.searchInput}
              placeholder="Search for player"
              type="text"
            />

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

      {children}

      <div className={s.footer}>
        friendgame.report is made by{' '}
        <a
          href="https://twitter.com/joshhunt"
          target="_blank"
          rel="noopener noreferrer"
        >
          joshhunt
        </a>
        , who also made{' '}
        <a
          href="https://destinysets.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Destiny Sets
        </a>
        ,{' '}
        <a href="https://clan.report" target="_blank" rel="noopener noreferrer">
          clan.report
        </a>
        , and the{' '}
        <a
          href="https://data.destinysets.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Destiny Data Explorer
        </a>
        . All content is owned by their respective owners, most probably Bungie.
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    sortMode: state.app.sortMode
  };
}

const mapDispatchToActions = { setSortMode: setSortModeAction };

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(App);
