import { ITableColumns, IMapping } from 'common/models/table-columns';

export const TABLE_COLUMNS_FETCH_SUCCESS = 'TABLE_COLUMNS_FETCH_SUCCESS';
export const MAPPINGS_FETCH_SUCCESS = 'MAPPINGS_FETCH_SUCCESS';
export const REMOVE_MAPPING_SUCCESS = 'REMOVE_MAPPING_SUCCESS';
export const ADD_MAPPING_SUCCESS = 'ADD_MAPPING_SUCCESS';

export interface TableColumnsFetchSuccess {
  type: 'TABLE_COLUMNS_FETCH_SUCCESS';
  payload: ITableColumns;
}

export interface MappingsFetchSuccess {
  type: 'MAPPINGS_FETCH_SUCCESS';
  payload: IMapping[];
}

export interface AddMappingSuccess {
  type: 'ADD_MAPPING_SUCCESS';
  payload: Partial<IMapping>;
}

export interface RemoveMappingSuccess {
  type: 'REMOVE_MAPPING_SUCCESS';
  payload: number;
}

export type TableColumnsAction =
  | TableColumnsFetchSuccess
  | MappingsFetchSuccess
  | RemoveMappingSuccess
  | AddMappingSuccess;
