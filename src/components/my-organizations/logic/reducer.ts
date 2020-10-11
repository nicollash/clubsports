import {
  LOAD_ORGANIZATION,
  LOAD_ORGANIZATION_SUCCESS,
  LOAD_ORGANIZATION_FAILURE,
  LOAD_STATEGROUP,
  LOAD_STATEGROUP_SUCCESS,
  LOAD_STATEGROUP_FAILURE,
  OrgAction,
} from './action-types';

const initialState = {
  isLoading: false,
  orgList: [],
  stateGroup: [],
};

export interface AppState {
  isLoading: boolean;
  orgList: Array<any>;
  stateGroup: Array<any>;
}

const orgInfoReducer = (state: AppState = initialState, action: OrgAction) => {
  switch (action.type) {
    case LOAD_ORGANIZATION: {
      return { ...state, isLoading: true };
    }
    case LOAD_ORGANIZATION_SUCCESS: {
      const { orgList } = action.payload;

      if (state.stateGroup.length > 0) {
        return {
          ...state,
          isLoading: false,
          orgList,
        };
      } else {
        return {
          ...state,
          orgList,
        };
      }
    }
    case LOAD_ORGANIZATION_FAILURE: {
      return {
        ...state,
        isLoading: false,
        orgList: [],
      };
    }
    case LOAD_STATEGROUP: {
      return { ...state, isLoading: true };
    }
    case LOAD_STATEGROUP_SUCCESS: {
      const { stateGroup } = action.payload;

      if (state.orgList.length > 0) {
        return {
          ...state,
          isLoading: false,
          stateGroup,
        };
      } else {
        return {
          ...state,
          stateGroup,
        };
      }
    }
    case LOAD_STATEGROUP_FAILURE: {
      return {
        ...state,
        isLoading: false,
        stateGroup: [],
      };
    }
    default:
      return state;
  }
};

export default orgInfoReducer;
