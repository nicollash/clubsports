import { IEventDetails, IOrganization } from 'common/models';

export const EVENT_DETAILS_FETCH_START = 'EVENT_DETAILS_FETCH_START';
export const EVENT_DETAILS_FETCH_SUCCESS = 'EVENT_DETAILS_FETCH_SUCCESS';
export const EVENT_DETAILS_FETCH_FAILURE = 'EVENT_DETAILS_FETCH_FAILURE';

export const ORGANIZATIONS_FETCH_START = 'ORGANIZATIONS_FETCH_START';
export const ORGANIZATIONS_FETCH_SUCCESS = 'ORGANIZATIONS_FETCH_SUCCESS';
export const ORGANIZATIONS_FETCH_FAILURE = 'ORGANIZATIONS_FETCH_FAILURE';
export interface OrganizationsFetchStart {
  type: 'ORGANIZATIONS_FETCH_START';
}

export interface OrganizationsFetchSuccess {
  type: 'ORGANIZATIONS_FETCH_SUCCESS';
  payload: IOrganization[];
}

export interface OrganizationsFetchFailure {
  type: 'ORGANIZATIONS_FETCH_FAILURE';
}

export interface EventDetailsFetchStart {
  type: 'EVENT_DETAILS_FETCH_START';
}

export interface EventDetailsFetchSuccess {
  type: 'EVENT_DETAILS_FETCH_SUCCESS';
  payload: IEventDetails[];
}

export interface EventDetailsFetchFailure {
  type: 'EVENT_DETAILS_FETCH_FAILURE';
}

export type EventDetailsAction =
  | EventDetailsFetchStart
  | EventDetailsFetchSuccess
  | EventDetailsFetchFailure;

export type OrganizationsAction =
  | OrganizationsFetchStart
  | OrganizationsFetchSuccess
  | OrganizationsFetchFailure;
