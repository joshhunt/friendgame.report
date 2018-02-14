import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Router from './Router';

ReactDOM.render(<Router />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept('./Router', () => {
    ReactDOM.render(<Router />, document.getElementById('root'));
  });
}
