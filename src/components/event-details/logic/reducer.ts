import {
  EVENT_DETAILS_FETCH_START,
  EVENT_DETAILS_FETCH_SUCCESS,
  EVENT_DETAILS_FETCH_FAILURE,
  EventDetailsAction,
  ORGANIZATIONS_FETCH_START,
  ORGANIZATIONS_FETCH_SUCCESS,
  ORGANIZATIONS_FETCH_FAILURE,
  OrganizationsAction
} from './actionTypes';
import { IEventDetails, IOrganization } from 'common/models';

export interface IEventState {
  data?: IEventDetails;
  error: boolean;
  isEventLoading: boolean;
}

export interface IOrganizationState {
  dataOrg?: IOrganization[];
  errorOrf: boolean;
  isOrganizationLoading: boolean;
  isOrganizationLoaded: boolean;
}

const defaultState: IEventState = {
  data: undefined,
  isEventLoading: false,
  error: false,
};

const defaultOrganizationsState: IOrganizationState = {
  dataOrg: undefined,
  errorOrf: false,
  isOrganizationLoading: false,
  isOrganizationLoaded: false,
}

export const event = (state = defaultState, action: EventDetailsAction) => {
  switch (action.type) {
    case EVENT_DETAILS_FETCH_START: {
      return {
        ...state,
        isEventLoading: true,
      };
    }
    case EVENT_DETAILS_FETCH_SUCCESS: {
      return {
        ...state,
        data: {
          ...action.payload[0],
        },
        isEventLoading: false,
      };
    }
    case EVENT_DETAILS_FETCH_FAILURE: {
      return {
        ...state,
        isEventLoading: false,
        error: true,
      };
    }
    default:
      return state;
  }
};

export const organizations = (state = defaultOrganizationsState, action: OrganizationsAction) => {
  switch (action.type) {
    case ORGANIZATIONS_FETCH_START: {
      return {
        ...state,
        isOrganizationLoading: true,
      };
    }
    case ORGANIZATIONS_FETCH_SUCCESS: {
      return {
        ...state,
        dataOrg: action.payload,
        isOrganizationLoading: false,
        isOrganizationLoaded: true,
      };
    }
    case ORGANIZATIONS_FETCH_FAILURE: {
      return {
        ...state,
        error: true,
      };
    }
    default:
      return state;
  }
};
