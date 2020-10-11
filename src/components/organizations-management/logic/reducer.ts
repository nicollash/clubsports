import {
  organizationManagementAction,
  LOAD_ORGANIZATIONS_START,
  LOAD_ORGANIZATIONS_SUCCESS,
  CREATE_ORGANIZATION_SUCCESS,
  ADD_USER_TO_ORGANIZATION_SUCCESS,
  DELETE_ORGANIZATION_SUCCESS,
} from './action-types';
import { IOrganization } from '../../../common/models';
import { sortByField } from 'helpers';
import { SortByFilesTypes } from 'common/enums';

const initialState = {
  isLoading: false,
  isLoaded: false,
  organizations: [],
};

export interface AppState {
  isLoading: boolean;
  isLoaded: boolean;
  organizations: IOrganization[];
}

const organizationsManagementReducer = (
  state: AppState = initialState,
  action: organizationManagementAction
) => {
  switch (action.type) {
    case LOAD_ORGANIZATIONS_START: {
      return { ...initialState, isLoading: true };
    }
    case LOAD_ORGANIZATIONS_SUCCESS: {
      const { organizations } = action.payload;

      return {
        ...state,
        isLoaded: true,
        isLoading: false,
        organizations: sortByField(
          organizations,
          SortByFilesTypes.ORGANIZATIONS
        ),
      };
    }
    case CREATE_ORGANIZATION_SUCCESS: {
      const { organization } = action.payload;

      return {
        ...state,
        organizations: [...state.organizations, organization],
      };
    }
    case ADD_USER_TO_ORGANIZATION_SUCCESS: {
      const { organization } = action.payload;

      return {
        ...state,
        organizations: [...state.organizations, organization],
      };
    }
    case DELETE_ORGANIZATION_SUCCESS: {
      const { organization } = action.payload;

      return {
        ...state,
        organizations: state.organizations.filter(
          it => it.org_id !== organization.org_id
        ),
      };
    }
    default:
      return state;
  }
};

export default organizationsManagementReducer;
