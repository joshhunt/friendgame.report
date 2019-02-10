import React from 'react';
import { connect } from 'react-redux';

import SearchHeader from 'src/components/SearchHeader';

import { setSortMode as setSortModeAction } from 'src/store/app';

import s from './styles.styl';

function App({ children, sortMode, setSortMode }) {
  return (
    <div className={s.root}>
      <SearchHeader setSortMode={setSortMode} sortMode={sortMode} />

      {children}

      <div className={s.footer}>
        <p>
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
          <a
            href="https://clan.report"
            target="_blank"
            rel="noopener noreferrer"
          >
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
          .
        </p>
        <p>
          Player search is provided by{' '}
          <a
            href="https://trials.report"
            target="_blank"
            rel="noopener noreferrer"
          >
            trials.report
          </a>{' '}
          (RIP). Thanks!
        </p>
        <p>
          All content is owned by their respective owners, most probably Bungie.
        </p>
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
