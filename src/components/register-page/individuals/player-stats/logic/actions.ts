import { ThunkAction } from 'redux-thunk';
import { ActionCreator, Dispatch } from 'redux';
import { Auth } from 'aws-amplify';
import axios from 'axios';
import Api from 'api/api';
import { Toasts } from 'components/common';
import { IMember } from 'common/models';
import {
  LOAD_REGISTRANT_DATA_START,
  LOAD_REGISTRANT_DATA_SUCCESS,
  LOAD_REGISTRANT_DATA_FAIL,
  LOAD_FORM_FIELDS_START,
  LOAD_FORM_FIELDS_SUCCESS,
  LOAD_FORM_FIELDS_FAIL,
  PlayerStatsAction,
} from './action-types';

axios.defaults.baseURL = process.env.REACT_APP_PUBLIC_API_BASE_URL!;

export const loadRegistrantData: ActionCreator<ThunkAction<
  void,
  {},
  null,
  PlayerStatsAction
>> = () => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_REGISTRANT_DATA_START,
    });

    const currentSession = await Auth.currentSession();
    const userEmail = currentSession.getIdToken().payload.email;
    const members = await Api.get(`/members?email_address=${userEmail}`);
    const member: IMember = members.find(
      (it: IMember) => it.email_address === userEmail
    );

    const registrantDefaultFields = await Api.get(
      '/registrant_data_fields?is_default_YN=1'
    );
    const registrantUserDefinedFields = await Api.get(
      `/registrant_data_fields?created_by=${member.member_id}`
    );

    const fieldIds: number[] = [];
    const registrantDataFields = [
      ...registrantDefaultFields,
      ...registrantUserDefinedFields,
    ].filter((el) => {
      if (fieldIds.some((id: number) => id === el.data_field_id)) {
        return false;
      } else {
        fieldIds.push(el.data_field_id);
        return true;
      }
    });

    dispatch({
      type: LOAD_REGISTRANT_DATA_SUCCESS,
      payload: { registrantDataFields },
    });
  } catch {
    dispatch({
      type: LOAD_REGISTRANT_DATA_FAIL,
    });

    Toasts.errorToast("Couldn't load Registrant fields");
  }
};

export const loadFormFields: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (eventId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_FORM_FIELDS_START,
      payload: '',
    });

    const requestedFieldsResponse = await axios.get(
      `/registrant_data_requests?event_id=${eventId}`
    );
    const registrantFieldsResponse = await axios.get('/registrant_data_fields');

    const requestedFields = requestedFieldsResponse.data
      .map((requestedField: any) => {
        const registrantFields = registrantFieldsResponse.data.filter(
          (registrantField: any) =>
            registrantField.data_field_id === requestedField.data_field_id
        );
        if (registrantFields.length > 0) {
          return { ...requestedField, ...registrantFields[0] };
        } else {
          return null;
        }
      })
      .filter((el: any) => el)
      .sort((a: any, b: any) => {
        const fieldA = a.data_sort_order;
        const fieldB = b.data_sort_order;

        let comparison = 0;
        if (fieldA > fieldB) {
          comparison = 1;
        } else if (fieldA < fieldB) {
          comparison = -1;
        }
        return comparison;
      });

    dispatch({
      type: LOAD_FORM_FIELDS_SUCCESS,
      payload: { formFields: requestedFields },
    });
  } catch {
    dispatch({
      type: LOAD_FORM_FIELDS_FAIL,
    });

    Toasts.errorToast("Couldn't load Registrant fields");
  }
};
