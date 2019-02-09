import { createSelector } from 'reselect';

import { pKey } from 'src/lib/destinyUtils';

const profilesStateSelector = state => state.profiles.profiles;
const routeParamsSelector = (state, ownProps) => ownProps.routeParams;

export const profileSelector = createSelector(
  profilesStateSelector,
  routeParamsSelector,
  (profiles, routeParams) => {
    const key = pKey(routeParams);
    return profiles[key];
  }
);
