import { createSelector } from 'reselect';

const routeParams = (state, props) => props.routeParams;

export const createUserFromRouteParamsSelector = () =>
  createSelector(
    profilesSelector,
    routeParamsSelector,
    (profiles, routeProps) => {}
  );
