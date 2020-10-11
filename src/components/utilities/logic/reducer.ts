import {
  LOAD_USER_DATA_START,
  LOAD_USER_DATA_SUCCESS,
  CHANGE_USER,
  UtilitiesAction,
} from './action-types';
import { IUtilitiesMember } from '../types';

const initialState = {
  isLoading: false,
  isLoaded: false,
  userData: null,
};

export interface AppState {
  isLoading: boolean;
  isLoaded: boolean;
  userData: IUtilitiesMember | null;
}

const utilitiesReducer = (
  state: AppState = initialState,
  action: UtilitiesAction
) => {
  switch (action.type) {
    case LOAD_USER_DATA_START: {
      return { ...initialState, isLoading: true };
    }
    case LOAD_USER_DATA_SUCCESS: {
      const { userData } = action.payload;

      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        userData,
      };
    }
    case CHANGE_USER: {
      const { userNewField } = action.payload;

      return {
        ...state,
        userData: { ...state.userData, ...userNewField },
      };
    }
    default:
      return state;
  }
};

export default utilitiesReducer;
