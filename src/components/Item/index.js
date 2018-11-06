import React from 'react';
import { connect } from 'react-redux';

import BungieImage from 'src/components/BungieImage';

const NO_ICON = '/img/misc/missing_icon_d2.png';

function Item({ item, className }) {
  const icon = (item && item.displayProperties.icon) || NO_ICON;
  return <BungieImage className={className} src={icon} />;
}

const mapStateToProps = (state, ownProps) => {
  return {
    item:
      state.definitions.DestinyInventoryItemDefinition &&
      state.definitions.DestinyInventoryItemDefinition[ownProps.hash]
  };
};

export default connect(mapStateToProps)(Item);
