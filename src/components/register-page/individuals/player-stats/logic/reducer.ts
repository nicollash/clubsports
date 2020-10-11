import {
  LOAD_REGISTRANT_DATA_START,
  LOAD_REGISTRANT_DATA_SUCCESS,
  LOAD_REGISTRANT_DATA_FAIL,
  LOAD_FORM_FIELDS_START,
  LOAD_FORM_FIELDS_SUCCESS,
  LOAD_FORM_FIELDS_FAIL,
  PlayerStatsAction,
} from './action-types';

const initialState = {
  registrantDataFields: [],
  formFields: [],
  isLoading: false,
};

export interface IPlayerStatsState {
  registrantDataFields: any;
  formFields: any;
}

const playerStatsReducer = (
  state: IPlayerStatsState = initialState,
  action: PlayerStatsAction
) => {
  switch (action.type) {
    case LOAD_REGISTRANT_DATA_START:
      return {
        ...state,
        isLoading: true,
      };
    case LOAD_REGISTRANT_DATA_SUCCESS:
      const { registrantDataFields } = action.payload;
      return {
        ...state,
        registrantDataFields,
        isLoading: false,
      };
    case LOAD_REGISTRANT_DATA_FAIL:
      return {
        ...state,
        isLoading: false,
      };
    case LOAD_FORM_FIELDS_START:
      return {
        ...state,
        isLoading: true,
      };
    case LOAD_FORM_FIELDS_SUCCESS:
      const { formFields } = action.payload;
      return {
        ...state,
        formFields,
        isLoading: false,
      };
    case LOAD_FORM_FIELDS_FAIL:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

export default playerStatsReducer;
