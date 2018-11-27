import React, { Component } from 'react';
import { connect } from 'react-redux';
import { sortBy } from 'lodash';

import BungieImage from 'src/components/BungieImage';

import s from './styles.styl';

// https://s3.amazonaws.com/destiny.plumbing/versions/1424950ea569506a3197e527fce36352/index.json

// actual current one:  d6bb93a417aa8f95c383c68477308072

const PREV_VERSION_URL =
  'https://s3.amazonaws.com/destiny.plumbing/versions/d6bb93a417aa8f95c383c68477308072/en/raw/DestinyCollectibleDefinition.json';

function groupCollectibles(collectibles) {
  return Object.values(collectibles).reduce((acc, def) => {
    if (!acc[def.sourceString]) {
      acc[def.sourceString] = [];
    }

    acc[def.sourceString].push(def);

    return acc;
  }, {});
}

function tagSortFn(obj) {
  if (obj.tag === 'new') {
    return -1;
  }

  return 1;
}

const TAG_CLASSNAME = {
  new: s.newTag
};

function Tag({ tag }) {
  if (!tag) {
    return null;
  }

  return <span className={TAG_CLASSNAME[tag]}>{tag}</span>;
}

function CollectibleLockup({ collectible, tag, itemDefs }) {
  const def = itemDefs && itemDefs[collectible.itemHash];

  return (
    <div className={s.collectibleLockup}>
      <BungieImage
        className={s.collectibleImage}
        src={collectible.displayProperties.icon}
      />

      <div className={s.collectibleMain}>
        <div>
          {collectible.displayProperties.name}
          <span className={s.collectibleSub}>{collectible.itemHash}</span>
          <Tag tag={tag} />
        </div>

        <div className={s.collectibleSub}>
          {def && def.itemTypeAndTierDisplayName}
          <br />
        </div>
      </div>
    </div>
  );
}

class NewCollections extends Component {
  state = {};

  componentDidMount() {
    this.fetchPromise = fetch(PREV_VERSION_URL).then(r => r.json());
    this.fetchPromise.catch(err => console.log(err));
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.DestinyCollectibleDefinition !==
        prevProps.DestinyCollectibleDefinition &&
      this.fetchPromise
    ) {
      const currentCollectibles = this.props.DestinyCollectibleDefinition;

      this.fetchPromise.then(allprevCollectibles => {
        const prevCollectiblesGrouped = groupCollectibles(allprevCollectibles);
        const currentCollectiblesGrouped = groupCollectibles(
          currentCollectibles
        );

        const payload = [];

        Object.entries(currentCollectiblesGrouped).forEach(
          ([sourceString, collectibles]) => {
            const prevCollectibles = prevCollectiblesGrouped[sourceString];

            if (prevCollectibles) {
              const thisObj = { sourceString, tag: null };

              const annotatedCollectibles = collectibles.map(col => {
                const wasInCollectionsPreviously = prevCollectibles.find(
                  c => c.hash === col.hash
                );

                return {
                  collectible: col,
                  tag: wasInCollectionsPreviously ? null : 'new'
                };
              });

              thisObj.collectibles = sortBy(annotatedCollectibles, tagSortFn);

              payload.push(thisObj);
            } else {
              // its new!
              payload.push({
                tag: 'new',
                sourceString,
                collectibles: collectibles.map(col => ({
                  collectible: col,
                  tag: allprevCollectibles[col.hash] ? null : 'new'
                }))
              });
            }
          }
        );

        this.setState({
          prevCollectiblesGrouped,
          currentCollectiblesGrouped,
          payload: sortBy(payload, tagSortFn)
        });
      });
    }
  }

  render() {
    const {
      prevCollectiblesGrouped,
      currentCollectiblesGrouped,
      payload
    } = this.state;

    return (
      <div>
        <h2>New Collections</h2>

        {/*          <div className={s.half}>
            <h2>prevCollectibles</h2>
            {prevCollectiblesGrouped &&
              Object.entries(prevCollectiblesGrouped).map(
                ([sourceString, collectibles]) => (
                  <div>
                    <h3>{sourceString || <em>no source</em>}</h3>
                    {collectibles.map(c => (
                      <CollectibleLockup
                        itemDefs={this.props.DestinyInventoryItemDefinition}
                        collectible={c}
                      />
                    ))}
                  </div>
                )
              )}
          </div>*/}

        {currentCollectiblesGrouped &&
          payload.map(obj => (
            <div>
              <h3>
                {obj.sourceString || <em>no source</em>} <Tag tag={obj.tag} />
              </h3>
              {obj.collectibles.map(c => (
                <CollectibleLockup
                  itemDefs={this.props.DestinyInventoryItemDefinition}
                  collectible={c.collectible}
                  tag={c.tag}
                />
              ))}
            </div>
          ))}

        {/*<div className={s.half}>
            <h2>currentCollectibles</h2>
            {currentCollectiblesGrouped &&
              Object.entries(currentCollectiblesGrouped).map(
                ([sourceString, collectibles]) => (
                  <div>
                    <h3>{sourceString || <em>no source</em>}</h3>
                    {collectibles.map(c => (
                      <CollectibleLockup
                        itemDefs={this.props.DestinyInventoryItemDefinition}
                        collectible={c}
                      />
                    ))}
                  </div>
                )
              )}
          </div>*/}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return state.definitions;
}

export default connect(mapStateToProps)(NewCollections);
