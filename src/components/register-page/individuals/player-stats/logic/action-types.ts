export const LOAD_REGISTRANT_DATA_START =
  'REGISTRANT/LOAD_REGISTRANT_DATA_START';
export const LOAD_REGISTRANT_DATA_SUCCESS =
  'REGISTRANT/LOAD_REGISTRANT_DATA_SUCCESS';
export const LOAD_REGISTRANT_DATA_FAIL = 'REGISTRANT/LOAD_REGISTRANT_DATA_FAIL';

export const LOAD_FORM_FIELDS_START = 'REGISTRANT/LOAD_FORM_FIELDS_START';
export const LOAD_FORM_FIELDS_SUCCESS = 'REGISTRANT/LOAD_FORM_FIELDS_SUCCESS';
export const LOAD_FORM_FIELDS_FAIL = 'REGISTRANT/LOAD_FORM_FIELDS_FAIL';

export interface loadRegistrantDataStart {
  type: 'REGISTRANT/LOAD_REGISTRANT_DATA_START';
}

export interface loadRegistrantDataSuccess {
  type: 'REGISTRANT/LOAD_REGISTRANT_DATA_SUCCESS';
  payload: {
    registrantDataFields: any;
  };
}

export interface loadRegistrantDataFail {
  type: 'REGISTRANT/LOAD_REGISTRANT_DATA_FAIL';
}

export interface loadFormFieldsStart {
  type: 'REGISTRANT/LOAD_FORM_FIELDS_START';
}

export interface loadFormFieldsSuccess {
  type: 'REGISTRANT/LOAD_FORM_FIELDS_SUCCESS';
  payload: {
    formFields: any;
  };
}

export interface loadFormFieldsFail {
  type: 'REGISTRANT/LOAD_FORM_FIELDS_FAIL';
}

export type PlayerStatsAction =
  | loadRegistrantDataStart
  | loadRegistrantDataSuccess
  | loadRegistrantDataFail
  | loadFormFieldsStart
  | loadFormFieldsSuccess
  | loadFormFieldsFail;
