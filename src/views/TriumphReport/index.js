import React, { Component } from 'react';
import { connect } from 'react-redux';

import Table from 'src/components/Table';
import TriumphSummary from 'src/components/TriumphSummary';

import s from './styles.styl';

const triumphsData = require('../../bulkTriumphData.json');

const lookup = {
  0: 'Category',
  1: 'Badge',
  2: 'Medals',
  3: 'Collectible',
  4: 'Record'
};

function percent(fraction) {
  return Math.round(fraction * 100 * 100) / 100;
}

class TriumphReport extends Component {
  render() {
    const { recordDefs } = this.props;
    const data = Object.values(triumphsData.results);

    const columns = [
      {
        name: 'triumph',
        cell: row => {
          const def = recordDefs && recordDefs[row.hash];

          return def ? <TriumphSummary record={def} /> : row.hash;
        },
        sortValue: row => {
          return recordDefs
            ? recordDefs[row.hash].displayProperties.name
            : row.hash;
        }
      },
      { name: 'completed', cell: row => row.completed },
      {
        name: '% completed',
        cell: row => `${percent(row.completed / triumphsData.usersProcessed)}%`,
        sortValue: row => row.completed / triumphsData.usersProcessed
      },
      { name: 'hash', cell: row => row.hash },
      {
        name: 'display type',
        cell: row => {
          const def = recordDefs && recordDefs[row.hash];

          return def ? lookup[def.presentationInfo.displayStyle] : '';
        }
      }
    ];

    return (
      <div className={s.root}>
        <h2>Triumphs report</h2>

        <p>
          Data from {triumphsData.usersProcessed} 'random' profiles, mostly from
          PS4.
        </p>

        <Table data={data} columns={columns} defaultSortField="completed" />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    recordDefs: state.definitions.DestinyRecordDefinition
  };
}

const mapDispatchToActions = {};

export default connect(mapStateToProps, mapDispatchToActions)(TriumphReport);
