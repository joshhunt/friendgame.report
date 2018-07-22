import React, { Component } from 'react';
import { format, formatDistance } from 'date-fns';

export default class PrettyDate extends Component {
  state = {
    toggle: true
  };

  onClick = () => {
    this.setState({ toggle: !this.state.toggle });
  };

  render() {
    const { date, formatFormat } = this.props;
    const d = new Date(date);

    return (
      <span onClick={this.onClick}>
        {this.state.toggle
          ? `${formatDistance(d, new Date())} ago`
          : format(d, formatFormat || 'd LLL Y, h:mm aaaa')}
      </span>
    );
  }
}
