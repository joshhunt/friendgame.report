import React from 'react';
import './App.css';

import Header from './Header';

export default function App({ children }) {
  return (
    <div>
      <Header />
      <div>{children}</div>
      <br />
      <br />
      <br />

      <p className="footer">
        Made by{' '}
        <a href="https://joshhunt.is" target="_blank" rel="noopener noreferrer">
          Josh Hunt
        </a>, who also makes{' '}
        <a
          href="https://destinysets.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          DestinySets.com
        </a>, a great site to track your gear collection.
      </p>

      <p className="footer">
        Player search is provided by the excellent{' '}
        <a
          href="https://trials.report"
          target="_blank"
          rel="noopener noreferrer"
        >
          trials.report
        </a>. Thanks!
      </p>

      <p className="footer" style={{ paddingBottom: 15 }}>
        If you like this site, you&apos;ll probably also like{' '}
        <a
          href="https://chrisfried.github.io/secret-scrublandeux/"
          target="_blank"
          rel="noopener noreferrer"
        >
          secret-scrubland
        </a>{' '}
        and{' '}
        <a
          href="https://guardian.theater"
          target="_blank"
          rel="noopener noreferrer"
        >
          guardian.theater
        </a>
      </p>
    </div>
  );
}
