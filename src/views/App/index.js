import React, { Component } from 'react';

if (React) {
}

class App extends Component {
  componentDidMount() {
    console.log('app componentDidMount');
  }

  render() {
    return this.props.children;
  }
}

export default App;
