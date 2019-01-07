import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { flatMapDeep, get, mapValues } from 'lodash';
import { connect } from 'react-redux';
import _LazyLoad from 'react-lazyload';

import TriumphSummary from 'src/components/TriumphSummary';
import { enumerateTriumphState } from 'src/lib/destinyUtils';
import Icon from 'src/components/Icon';
import Modal from 'src/components/Modal';
import SearchForPlayer from 'src/components/SearchForPlayer';
import { getProfile } from 'src/store/clan';

import tableStyles from 'app/components/Table/styles.styl';

import s from './styles.styl';
import Objectives from './Objectives';

const AsyncMode = React.unstable_ConcurrentMode;

window.React = React;

const USE_LAZY_LOAD = false;
const LazyLoad = USE_LAZY_LOAD ? _LazyLoad : Fragment;

function chunkArray(myArray, chunkSize) {
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];

  for (index = 0; index < arrayLength; index += chunkSize) {
    const myChunk = myArray.slice(index, index + chunkSize);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
}

function AddPlayer({ onClick }) {
  return (
    <td className={s.addPlayerTd}>
      <button className={s.addPlayerButton} onClick={onClick}>
        <Icon className={s.addPlayerIcon} name="plus" />
        Add Player
      </button>
    </td>
  );
}

const CHUNK_SIZE = 10;
const ROW_HEIGHT = 50;

const ComparisonTable = React.memo(
  ({
    searchText,
    playersToCompare,
    recordsByPlayerKey,
    flattenedRecords,
    hideAllCompleted,
    hideZeroPointRecords,
    onAddPlayerClick
  }) => {
    let currentDepth = -1;

    const chunkedRecords =
      flattenedRecords && chunkArray(flattenedRecords, CHUNK_SIZE);

    return (
      <AsyncMode>
        <table className={cx(tableStyles.table, s.table)}>
          <thead>
            <tr style={{ width: 500 }}>
              <AddPlayer onClick={onAddPlayerClick} />

              {playersToCompare.map(playerKey => {
                const player = recordsByPlayerKey[playerKey];
                return (
                  <td className={s.playerCell} key={playerKey}>
                    {player
                      ? player.profile.profile.data.userInfo.displayName
                      : 'Loading...'}

                    {player ? (
                      <div className={s.score}>
                        {player.profile.profileRecords.data.score} pts
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          </thead>

          <tbody className={s.tbody}>
            {chunkedRecords &&
              chunkedRecords.map((flattenedRecords, index) => (
                <LazyLoad
                  height={CHUNK_SIZE * ROW_HEIGHT}
                  key={index}
                  offset={100}
                >
                  {flattenedRecords.map(node => {
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

                    if (!node.headingNode && hideZeroPointRecords) {
                      if (
                        node.completionInfo &&
                        node.completionInfo.ScoreValue === 0
                      ) {
                        return null;
                      }
                    }

                    let content;
                    let searchableContent;

                    if (node.headingNode) {
                      currentDepth = node.depth;
                      searchableContent = node.headingNode.displayProperties.name.toLowerCase();
                      content = (
                        <a className={s.heading} href={`#${anchorId}`}>
                          {node.headingNode.displayProperties.name}
                        </a>
                      );
                    } else {
                      searchableContent = node.displayProperties.name.toLowerCase();

                      content = (
                        <TriumphSummary record={node} anchorLink={anchorId} />
                      );
                    }

                    if (searchText && searchText.length) {
                      const thisMatches = searchableContent.includes(
                        searchText
                      );

                      if (!thisMatches) {
                        return null;
                      }
                    }

                    return (
                      <tr
                        key={node.hash || node.headingNode.hash}
                        className={s.row}
                        data-depth={
                          node.headingNode ? currentDepth : currentDepth + 1
                        }
                      >
                        <td id={anchorId}>{content} </td>

                        {playersToCompare.map(playerKey => {
                          const player = recordsByPlayerKey[playerKey];
                          const record = player && player.records[node.hash];

                          if (!record) {
                            return <td key={playerKey} />;
                          }

                          return (
                            <td
                              key={playerKey}
                              className={cx(
                                record.$hasCompleted
                                  ? s.cellCompleted
                                  : s.cellIncomplete,
                                s.playerCell
                              )}
                            >
                              <div className={s.subtlePlayerName}>
                                {player &&
                                  player.profile.profile.data.userInfo
                                    .displayName}
                              </div>

                              {record.$hasCompleted ? (
                                <Icon className={s.icon} name="check" />
                              ) : (
                                <Icon className={s.icon} name="times" />
                              )}

                              {!record.$hasCompleted &&
                                record.objectives && (
                                  <Objectives objectives={record.objectives} />
                                )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </LazyLoad>
              ))}
          </tbody>
        </table>
      </AsyncMode>
    );
  }
);

class CompareTriumphs extends Component {
  state = { hideAllCompleted: false, addPlayerModalVisible: false };

  toggleHideAllCompleted = () => {
    this.setState({
      hideAllCompleted: !this.state.hideAllCompleted
    });
  };

  toggleHideZeroPointTriumphs = () => {
    this.setState({
      hideZeroPointRecords: !this.state.hideZeroPointRecords
    });
  };

  componentDidMount() {
    this.fetchProfiles(this.props.playersToCompare);
  }

  componentDidUpdate(prevProps) {
    const newPlayers = this.props.playersToCompare.filter(currentPlayer => {
      return !prevProps.playersToCompare.includes(currentPlayer);
    });

    if (newPlayers.length) {
      this.setState({ addPlayerModalVisible: false });
    }

    this.fetchProfiles(newPlayers);
  }

  fetchProfiles(playersToCompare) {
    playersToCompare
      .filter(playerKey => !this.props.recordsByPlayerKey[playerKey])
      .forEach(playerKey => {
        const [membershipType, membershipId] = playerKey.split('/');
        this.props.getProfile({ membershipType, membershipId });
      });
  }

  toggleAddPlayer = () => {
    this.setState({
      addPlayerModalVisible: !this.state.addPlayerModalVisible
    });
  };

  onFilterChange = ev => {
    const filterText = ev.target.value.toLowerCase();
    requestAnimationFrame(() => {
      this.setState({ filterText });
    });
  };

  render() {
    const {
      flattenedRecords,
      playersToCompare,
      recordsByPlayerKey
    } = this.props;

    const {
      hideAllCompleted,
      addPlayerModalVisible,
      hideZeroPointRecords,
      filterText
    } = this.state;

    return (
      <div className={s.root}>
        <h2>Compare triumphs</h2>

        <button
          className={s.addPlayerButton}
          onClick={this.toggleHideAllCompleted}
        >
          <Icon
            className={s.addPlayerIcon}
            name={hideAllCompleted ? 'eye' : 'eye-slash'}
          />
          {hideAllCompleted ? 'Show all completed' : 'Hide all completed'}
        </button>

        <button
          className={s.addPlayerButton}
          onClick={this.toggleHideZeroPointTriumphs}
        >
          <Icon
            className={s.addPlayerIcon}
            name={hideZeroPointRecords ? 'eye' : 'eye-slash'}
          />
          {hideZeroPointRecords
            ? 'Show all Triumphs'
            : 'Hide zero-point Triumphs'}
        </button>

        <input placeholder="filter" onChange={this.onFilterChange} />

        <ComparisonTable
          searchText={filterText}
          playersToCompare={playersToCompare}
          recordsByPlayerKey={recordsByPlayerKey}
          flattenedRecords={flattenedRecords}
          hideAllCompleted={hideAllCompleted}
          hideZeroPointRecords={hideZeroPointRecords}
          onAddPlayerClick={this.toggleAddPlayer}
        />

        <Modal
          isOpen={addPlayerModalVisible}
          onRequestClose={this.toggleAddPlayer}
        >
          <SearchForPlayer className={s.addPlayerModal} compareTriumphsLink />
        </Modal>
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

  const { players } = ownProps.router.location.query;
  const playersToCompare = players ? players.split(',') : [];

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
