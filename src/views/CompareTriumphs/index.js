import React, { Component } from 'react';
import { flatMapDeep, get, mapValues } from 'lodash';
import { connect } from 'react-redux';

import TriumphSummary from 'src/components/TriumphSummary';
import { enumerateTriumphState } from 'src/lib/destinyUtils';
import Icon from 'src/components/Icon';
import { getProfile } from 'src/store/clan';

import tableStyles from 'app/components/Table/styles.styl';

import s from './styles.styl';

class CompareTriumphs extends Component {
  state = { hideAllCompleted: false };

  toggleHideAllCompleted = () => {
    this.setState({
      hideAllCompleted: !this.state.hideAllCompleted
    });
  };

  componentDidMount() {
    this.props.playersToCompare
      .filter(playerKey => !this.props.recordsByPlayerKey[playerKey])
      .forEach(playerKey => {
        const [membershipType, membershipId] = playerKey.split('/');
        this.props.getProfile({ membershipType, membershipId });
      });
  }

  render() {
    const {
      flattenedRecords,
      playersToCompare,
      recordsByPlayerKey
    } = this.props;

    const { hideAllCompleted } = this.state;

    let currentDepth = 0;

    return (
      <div className={s.root}>
        <h2>Compare triumphs</h2>

        <button onClick={this.toggleHideAllCompleted}>
          {hideAllCompleted ? 'Show all completed' : 'Hide all completed'}
        </button>

        <table className={tableStyles.table}>
          <thead>
            <tr>
              <td>Triumph</td>
              {playersToCompare.map(playerKey => {
                const player = recordsByPlayerKey[playerKey];
                return (
                  <td>
                    {player && player.profile.profile.data.userInfo.displayName}
                  </td>
                );
              })}
            </tr>
          </thead>

          <tbody className={s.tbody}>
            {flattenedRecords &&
              flattenedRecords.map(node => {
                const hash = node.headingNode
                  ? node.headingNode.hash
                  : node.hash;

                const anchorId = `triumph_${hash}`;

                if (!node.headingNode && hideAllCompleted) {
                  const allCompleted = playersToCompare.reduce(
                    (acc, playerKey) => {
                      const player = recordsByPlayerKey[playerKey];
                      const thisPlayerCompleted =
                        player && player.records[node.hash].$hasCompleted;
                      return thisPlayerCompleted && acc;
                    },
                    true
                  );

                  if (allCompleted) {
                    return null;
                  }
                }

                let content;

                if (node.headingNode) {
                  currentDepth = node.depth;
                  content = (
                    <a className={s.heading} href={`#${anchorId}`}>
                      {node.headingNode.displayProperties.name}
                    </a>
                  );
                } else {
                  content = (
                    <TriumphSummary record={node} anchorLink={anchorId} />
                  );
                }

                return (
                  <tr
                    className={s.row}
                    data-depth={
                      node.headingNode ? currentDepth : currentDepth + 1
                    }
                  >
                    <td id={anchorId}>{content}</td>

                    {playersToCompare.map(playerKey => {
                      const player = recordsByPlayerKey[playerKey];
                      const record = player && player.records[node.hash];

                      if (!record) {
                        return <td />;
                      }

                      return (
                        <td
                          className={
                            record.$hasCompleted
                              ? s.cellCompleted
                              : s.cellIncomplete
                          }
                        >
                          {record.$hasCompleted ? (
                            <Icon className={s.icon} name="check" />
                          ) : (
                            <Icon className={s.icon} name="times" />
                          )}
                          <div className={s.subtlePlayerName}>
                            {player &&
                              player.profile.profile.data.userInfo.displayName}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    );
  }
}

const TRIUMPHS_PRESENTATION_NODE = 1024788583;

function recursiveRecords(node, definitions, depth = -1) {
  if (!node || !node.children) {
    console.log('bailing early for', node);
    return [];
  }

  // if (node.hash === 3052787867) {
  //   debugger;
  // }

  const fromChildren = flatMapDeep(
    node.children.presentationNodes,
    childNode => {
      const childPresentationNode =
        definitions.DestinyPresentationNodeDefinition[
          childNode.presentationNodeHash
        ];

      if (
        childPresentationNode &&
        childPresentationNode.children &&
        childPresentationNode.children.records &&
        childPresentationNode.children.records.length
      ) {
        return [
          { headingNode: childPresentationNode, depth: depth + 1 },
          ...childPresentationNode.children.records
            .map(
              c =>
                definitions.DestinyRecordDefinition &&
                definitions.DestinyRecordDefinition[c.recordHash]
            )
            .filter(Boolean)
        ];
      }

      return recursiveRecords(childPresentationNode, definitions, depth + 1);
    }
  );

  const fromThis = node.children.records
    .map(
      c =>
        definitions.DestinyRecordDefinition &&
        definitions.DestinyRecordDefinition[c.recordHash]
    )
    .filter(Boolean);

  return [{ headingNode: node, depth }, ...fromThis, ...fromChildren];
}

const enumeratedRecordsFromProfile = profile => {
  const profileRecords = get(profile, 'profileRecords.data.records', {});
  const characterRecords = Object.values(
    get(profile, 'characterRecords.data', {})
  ).reduce((acc, { records }) => {
    return {
      ...acc,
      ...records
    };
  }, {});

  const all = {
    ...profileRecords,
    ...characterRecords
  };

  const allMappedRecords = mapValues(all, record => {
    const state = enumerateTriumphState(record.state);
    return {
      ...record,
      $enumeratedState: state,
      $hasCompleted: state.recordRedeemed || !state.objectiveNotCompleted
    };
  });

  return allMappedRecords;
};

function mapStateToProps(state, ownProps) {
  const {
    DestinyPresentationNodeDefinition: presentationNodeDefs,
    DestinyRecordDefinition: recordDefs
  } = state.definitions;

  const playersToCompare = ownProps.router.location.query.players.split(',');

  const triumphNode =
    presentationNodeDefs && presentationNodeDefs[TRIUMPHS_PRESENTATION_NODE];

  let flattenedRecords =
    triumphNode && recursiveRecords(triumphNode, state.definitions).slice(1);

  const recordsFromPlayers = playersToCompare.reduce((acc, playerKey) => {
    const profile = state.clan.profiles[playerKey];

    if (!profile) {
      return acc;
    }

    return {
      ...acc,
      [playerKey]: {
        profile,
        records: enumeratedRecordsFromProfile(profile)
      }
    };
  }, {});

  return {
    recordDefs,
    presentationNodeDefs,
    triumphNode,
    flattenedRecords,
    playersToCompare,
    recordsByPlayerKey: recordsFromPlayers
  };
}

const mapDispatchToActions = { getProfile };

export default connect(mapStateToProps, mapDispatchToActions)(CompareTriumphs);
