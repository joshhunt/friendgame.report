import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Router from './Router';
import './autotrack.build';

ReactDOM.render(<Router />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept('./Router', () => {
    ReactDOM.render(<Router />, document.getElementById('root'));
  });
}
