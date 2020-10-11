import { IFacility, IField } from '../../../common/models';

export const SUCCESS = '_SUCCESS';
export const FAILURE = '_FAILURE';

export const LOAD_FACILITIES_START = 'FACILITIES:LOAD_FACILITIES_START';
export const LOAD_FACILITIES_SUCCESS = 'FACILITIES:LOAD_FACILITIES_SUCCESS';
export const LOAD_FACILITIES_FAILURE = 'FACILITIES:LOAD_FACILITIES_FAILURE';

export const LOAD_FIELDS_START = 'FACILITIES:LOAD_FIELDS_START';
export const LOAD_FIELDS_SUCCESS = 'FACILITIES:LOAD_FIELDS_SUCCESS';
export const LOAD_FIELDS_FAILURE = 'FACILITIES:LOAD_FIELDS_FAILURE';

export const ADD_EMPTY_FACILITIES = 'ADD_EMPTY_FACILITIES';

export const ADD_EMPTY_FIELDS = 'ADD_EMPTY_FIELDS';

export const UPDATE_FACILITY = 'UPDATE_FACILITY';

export const UPDATE_FIELD = 'UPDATE_FIELD';

export const SAVE_FACILITIES_SUCCESS = 'FACILITIES:SAVE_FACILITIES_SUCCESS';
export const SAVE_FACILITIES_FAILURE = 'FACILITIES:SAVE_FACILITIES_FAILURE';

export const UPLOAD_FILE_MAP_SUCCESS = 'FACILITIES:UPLOAD_FILE_MAP_SUCCESS';
export const UPLOAD_FILE_MAP_FAILURE = 'FACILITIES:UPLOAD_FILE_MAP_FAILURE';

export const DELETE_FACILITY_SUCCESS = 'FACILITIES:DELETE_FACILITY_SUCCESS';

export const DELETE_FILED_SUCCESS = 'FACILITIES:DELETE_FIELD_SUCCESS';
export const DELETE_FILED_FAILURE = 'FACILITIES:DELETE_FIELD_FAILURE';

export interface loadFacilitiesStart {
  type: 'FACILITIES:LOAD_FACILITIES_START';
}

export interface loadFieldsStart {
  type: 'FACILITIES:LOAD_FIELDS_START';
  payload: {
    facilityId: string;
  };
}

export interface loadFacilitiesSuccess {
  type: 'FACILITIES:LOAD_FACILITIES_SUCCESS';
  payload: {
    facilities: IFacility[];
  };
}

export interface loadFieldsSuccess {
  type: 'FACILITIES:LOAD_FIELDS_SUCCESS';
  payload: {
    facilityId: string;
    fields: IField[];
  };
}

export interface addEmptyFacilities {
  type: 'ADD_EMPTY_FACILITIES';
  payload: {
    facilities: IFacility[];
  };
}

export interface addEmptyFields {
  type: 'ADD_EMPTY_FIELDS';
  payload: {
    fields: IField[];
  };
}

export interface updateFacilities {
  type: 'UPDATE_FACILITY';
  payload: {
    updatedFacility: IFacility;
  };
}

export interface updateField {
  type: 'UPDATE_FIELD';
  payload: {
    updatedField: IField;
  };
}

export interface saveFacilities {
  type: 'FACILITIES:SAVE_FACILITIES_SUCCESS';
  payload: {
    facilities: IFacility[];
    fields: IField[];
  };
}

export interface uploadFileMapSuccess {
  type: 'FACILITIES:UPLOAD_FILE_MAP_SUCCESS';
  payload: {
    facility: IFacility;
  };
}

export interface deleteFacilitySuccess {
  type: 'FACILITIES:DELETE_FACILITY_SUCCESS';
  payload: {
    facilityId: string;
  };
}

export interface deleteFieldSuccess {
  type: 'FACILITIES:DELETE_FIELD_SUCCESS';
  payload: {
    field: IField;
    facility: IFacility;
  };
}

export type FacilitiesAction =
  | loadFacilitiesStart
  | loadFacilitiesSuccess
  | loadFieldsStart
  | loadFieldsSuccess
  | addEmptyFacilities
  | addEmptyFields
  | updateFacilities
  | updateField
  | saveFacilities
  | uploadFileMapSuccess
  | deleteFacilitySuccess
  | deleteFieldSuccess;
