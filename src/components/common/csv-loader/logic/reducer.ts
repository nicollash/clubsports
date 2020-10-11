import {
  TABLE_COLUMNS_FETCH_SUCCESS,
  MAPPINGS_FETCH_SUCCESS,
  ADD_MAPPING_SUCCESS,
  REMOVE_MAPPING_SUCCESS,
  TableColumnsAction,
} from './actionTypes';
import { ITableColumns, IMapping } from 'common/models/table-columns';

export interface ITableColumnsState {
  data?: ITableColumns;
  mappings: IMapping[];
}

const defaultState: ITableColumnsState = {
  data: undefined,
  mappings: [],
};

export default (state = defaultState, action: TableColumnsAction) => {
  switch (action.type) {
    case TABLE_COLUMNS_FETCH_SUCCESS: {
      return {
        ...state,
        data: action.payload[0],
      };
    }
    case MAPPINGS_FETCH_SUCCESS: {
      return {
        ...state,
        mappings: action.payload,
      };
    }
    case REMOVE_MAPPING_SUCCESS: {
      return {
        ...state,
        mappings: state.mappings.filter(
          mapping => mapping.member_map_id !== action.payload
        ),
      };
    }
    case ADD_MAPPING_SUCCESS: {
      return {
        ...state,
        mappings: [...state.mappings, action.payload],
      };
    }
    default:
      return state;
  }
};
