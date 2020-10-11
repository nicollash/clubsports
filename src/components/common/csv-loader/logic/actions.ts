import { ThunkAction } from 'redux-thunk';
import { ActionCreator, Dispatch } from 'redux';
import { Auth } from 'aws-amplify';
import api from 'api/api';
import { IMember } from 'common/models';
import { ITableColumns, IMapping } from 'common/models/table-columns';
import { Toasts } from 'components/common';
import {
  TABLE_COLUMNS_FETCH_SUCCESS,
  MAPPINGS_FETCH_SUCCESS,
  ADD_MAPPING_SUCCESS,
  REMOVE_MAPPING_SUCCESS,
  TableColumnsAction,
} from './actionTypes';

export const getTableColumnsSuccess = (
  payload: ITableColumns
): TableColumnsAction => ({
  type: TABLE_COLUMNS_FETCH_SUCCESS,
  payload,
});

export const getMappingsSuccess = (
  payload: IMapping[]
): TableColumnsAction => ({
  type: MAPPINGS_FETCH_SUCCESS,
  payload,
});

export const addMappingsSuccess = (
  payload: Partial<IMapping>
): TableColumnsAction => ({
  type: ADD_MAPPING_SUCCESS,
  payload,
});

export const removeMappingSuccess = (payload: number): TableColumnsAction => ({
  type: REMOVE_MAPPING_SUCCESS,
  payload,
});

export const getTableColumns: ActionCreator<ThunkAction<
  void,
  {},
  null,
  TableColumnsAction
>> = (tableName: string) => async (dispatch: Dispatch) => {
  const response = await api.get(`/table_columns?table_name=${tableName}`);

  if (response) {
    dispatch(getTableColumnsSuccess(response));
  }
};

export const saveMapping: ActionCreator<ThunkAction<
  void,
  {},
  null,
  TableColumnsAction
>> = (data: Partial<IMapping>) => async (dispatch: Dispatch) => {
  const response = await api.post(`/data_import_history`, data);

  if (response) {
    dispatch(addMappingsSuccess(data));
    return Toasts.successToast('Mapping is successfully saved');
  }
};

export const getMappings: ActionCreator<ThunkAction<
  void,
  {},
  null,
  TableColumnsAction
>> = (table: string) => async (dispatch: Dispatch) => {
  const currentSession = await Auth.currentSession();
  const userEmail = currentSession.getIdToken().payload.email;
  const members = await api.get(`/members?email_address=${userEmail}`);
  const member: IMember = members.find(
    (it: IMember) => it.email_address === userEmail
  );

  const response = await api.get(`/data_import_history`);
  const filteredMapping = response.filter(
    (mapping: any) =>
      mapping.destination_table === table &&
      mapping.created_by === member.member_id
  );

  if (response) {
    dispatch(getMappingsSuccess(filteredMapping));
  }
};

export const removeMapping: ActionCreator<ThunkAction<
  void,
  {},
  null,
  TableColumnsAction
>> = (mappingId: number) => async (dispatch: Dispatch) => {
  const response = await api.delete(
    `/data_import_history?member_map_id=${mappingId}`
  );

  if (response) {
    dispatch(removeMappingSuccess(mappingId));
    return Toasts.successToast('Mapping is successfully deleted');
  }
};
