import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as Yup from 'yup';
import { Toasts } from 'components/common';
import { EMPTY_FACILITY, EMPTY_FIELD } from './constants';
import {
  ADD_EMPTY_FACILITIES,
  ADD_EMPTY_FIELDS,
  LOAD_FACILITIES_START,
  LOAD_FACILITIES_SUCCESS,
  LOAD_FACILITIES_FAILURE,
  LOAD_FIELDS_START,
  LOAD_FIELDS_SUCCESS,
  LOAD_FIELDS_FAILURE,
  UPDATE_FACILITY,
  UPDATE_FIELD,
  SAVE_FACILITIES_SUCCESS,
  SAVE_FACILITIES_FAILURE,
  FacilitiesAction,
  UPLOAD_FILE_MAP_SUCCESS,
  UPLOAD_FILE_MAP_FAILURE,
  DELETE_FACILITY_SUCCESS,
  DELETE_FILED_SUCCESS,
  DELETE_FILED_FAILURE,
} from './action-types';
import { IAppState } from 'reducers/root-reducer.types';
import Api from 'api/api';
import { facilitySchema, fieldSchema } from 'validations';
import {
  getVarcharEight,
  uploadFile,
  removeObjKeysByEntryPoint,
} from 'helpers';
import { IFacility, IField, IUploadFile } from 'common/models';
import { EntryPoints } from 'common/enums';

const loadFacilities = (eventId: string) => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  try {
    dispatch({
      type: LOAD_FACILITIES_START,
    });

    const { event } = getState().pageEvent.tournamentData;
    const facilities = await Api.get(`/facilities?event_id=${eventId}`);
    const mappedFacilitiesByEvent = facilities.map((it: IFacility) => ({
      ...it,
      first_game_time: it.first_game_time || event?.first_game_time,
      last_game_end: it.last_game_end || event?.last_game_end,
    }));

    dispatch({
      type: LOAD_FACILITIES_SUCCESS,
      payload: {
        facilities: mappedFacilitiesByEvent,
      },
    });
  } catch {
    dispatch({
      type: LOAD_FACILITIES_FAILURE,
    });
  }
};

const loadFields: ActionCreator<ThunkAction<
  void,
  {},
  null,
  FacilitiesAction
>> = (facilityId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_FIELDS_START,
      payload: {
        facilityId,
      },
    });

    const fields = await Api.get(`/fields?facilities_id=${facilityId}`);

    dispatch({
      type: LOAD_FIELDS_SUCCESS,
      payload: {
        facilityId,
        fields,
      },
    });
  } catch {
    dispatch({
      type: LOAD_FIELDS_FAILURE,
    });
  }
};

const addEmptyFacility = (incrementValue: number) => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  const { tournamentData } = getState().pageEvent;
  const { event } = tournamentData;

  const newFacilities = Array.from(new Array(incrementValue), () => ({
    ...EMPTY_FACILITY,
    event_id: event?.event_id,
    facilities_id: getVarcharEight(),
    first_game_time: event?.first_game_time,
    last_game_end: event?.last_game_end,
    isNew: true,
  }));

  dispatch({
    type: ADD_EMPTY_FACILITIES,
    payload: {
      facilities: newFacilities,
    },
  });
};

const addEmptyFields = (facility: IFacility, incrementValue: number) => {
  let fieldNumber = Number(facility.num_fields);

  const newFields = Array.from(new Array(incrementValue), () => {
    return {
      ...EMPTY_FIELD,
      field_id: getVarcharEight(),
      facilities_id: facility.facilities_id,
      field_name: `Field ${++fieldNumber}`,
      isNew: true,
    };
  });

  return {
    type: ADD_EMPTY_FIELDS,
    payload: {
      fields: newFields,
    },
  };
};

const updateFacilities = (updatedFacility: IFacility): FacilitiesAction => ({
  type: UPDATE_FACILITY,
  payload: {
    updatedFacility: { ...updatedFacility, isChange: true },
  },
});

const updateField = (updatedField: IField): FacilitiesAction => ({
  type: UPDATE_FIELD,
  payload: {
    updatedField: { ...updatedField, isChange: true },
  },
});

const saveFacilities = (facilities: IFacility[], fields: IField[]) => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  const { tournamentData } = getState().pageEvent;
  const { event } = tournamentData;

  try {
    const mappedFacilityFields = Object.values(
      fields.reduce((acc, it: IField) => {
        const facilityId = it.facilities_id;

        acc[facilityId] = [...(acc[facilityId] || []), it];

        return acc;
      }, {})
    );

    for await (let mappedFields of mappedFacilityFields) {
      await Yup.array()
        .of(fieldSchema)
        .unique(
          team => team.field_name,
          'Oops. It looks like you already have fields with the same name. The field must have a unique name.'
        )
        .validate(mappedFields);
    }

    await Yup.array()
      .of(facilitySchema)
      .unique(
        facility => facility.facilities_description,
        'Oops. It looks like you already have facilities with the same name. The facility must have a unique name.'
      )
      .validate(facilities);

    for await (let facility of facilities) {
      const copiedFacility = { ...facility };

      delete copiedFacility.isFieldsLoaded;
      delete copiedFacility.isFieldsLoading;

      if (copiedFacility.isChange && !copiedFacility.isNew) {
        delete copiedFacility.isChange;

        await Api.put(
          `/facilities?facilities_id=${copiedFacility.facilities_id}`,
          copiedFacility
        );
      }
      if (copiedFacility.isNew) {
        delete copiedFacility.isChange;
        delete copiedFacility.isNew;

        await Api.post('/facilities', copiedFacility);
      }
    }

    for await (let field of fields) {
      const copiedField = { ...field };

      if (copiedField.isChange && !copiedField.isNew) {
        delete copiedField.isChange;

        await Api.put(`/fields?field_id=${copiedField.field_id}`, copiedField);
      }

      if (copiedField.isNew) {
        delete copiedField.isChange;
        delete copiedField.isNew;

        await Api.post('/fields', copiedField);
      }
    }

    dispatch({
      type: SAVE_FACILITIES_SUCCESS,
      payload: {
        facilities,
        fields,
      },
    });

    Toasts.successToast('Facilities saved successfully');

    if (event && facilities.length) {
      dispatch<any>(loadFacilities(event.event_id));
    }
  } catch (err) {
    dispatch({
      type: SAVE_FACILITIES_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

const uploadFileMap: ActionCreator<ThunkAction<
  void,
  {},
  null,
  FacilitiesAction
>> = (facility: IFacility, files: IUploadFile[]) => async (
  dispatch: Dispatch
) => {
  if (!files || !files.length) {
    return;
  }

  for await (let file of files) {
    try {
      const uploadedFile = await uploadFile(file);
      const { key } = uploadedFile as Storage;

      dispatch({
        type: UPLOAD_FILE_MAP_SUCCESS,
        payload: {
          facility: { ...facility, isChange: true, field_map_URL: key },
        },
      });

      Toasts.successToast('Map was successfully uploaded');
    } catch (err) {
      dispatch({
        type: UPLOAD_FILE_MAP_FAILURE,
      });

      Toasts.errorToast('Map could not be uploaded');
    }
  }
};

export {
  loadFacilities,
  loadFields,
  addEmptyFacility,
  addEmptyFields,
  updateFacilities,
  updateField,
  saveFacilities,
  uploadFileMap,
};

export const createFacilities: ActionCreator<ThunkAction<
  void,
  {},
  null,
  FacilitiesAction
>> = (facilities: IFacility[], cb: () => void) => async (
  dispatch: Dispatch
) => {
  try {
    const allFacilities = await Api.get(
      `/facilities?event_id=${facilities[0].event_id}`
    );

    for (const facility of facilities) {
      await Yup.array()
        .of(facilitySchema)
        .unique(
          fac => fac.facilities_description,
          'You already have a facility with the same name. Facility must have a unique name.'
        )
        .validate([...allFacilities, facility]);
    }

    for (const facility of facilities) {
      delete facility.isNew;

      await Api.post('/facilities', facility);
    }

    dispatch({
      type: SAVE_FACILITIES_SUCCESS,
      payload: {
        facilities,
      },
    });

    const successMsg = `Facilities are successfully created (${facilities.length})`;
    Toasts.successToast(successMsg);
    cb();
  } catch (err) {
    const fac = err.value[err.value.length - 1];
    const index = facilities.findIndex(
      facility => facility.facilities_id === fac.facilities_id
    );
    const errMessage = `Record ${index + 1}: ${err.message}`;
    return Toasts.errorToast(errMessage);
  }
};

export const deleteFacility: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (facilityId: string) => async (dispatch: Dispatch) => {
  const fields = await Api.get(`/fields?facilities_id=${facilityId}`);
  for await (const field of fields) {
    await Api.delete(`/fields?field_id=${field.field_id}`);
  }

  const response = await Api.delete(`/facilities?facilities_id=${facilityId}`);

  if (response?.errorType === 'Error') {
    return Toasts.errorToast("Couldn't delete a facility");
  }

  dispatch({
    type: DELETE_FACILITY_SUCCESS,
    payload: { facilityId },
  });

  Toasts.successToast('Facility is successfully deleted');
};

export const deleteField = (facility: IFacility, field: IField) => async (
  dispatch: Dispatch
) => {
  const DEFAULT_DECREMENT_VALUE = 1;
  const updatedFacility = {
    ...facility,
    num_fields: Number(facility.num_fields) - DEFAULT_DECREMENT_VALUE,
  };

  try {
    if (!field.isNew) {
      const clearFacility = removeObjKeysByEntryPoint(
        updatedFacility,
        EntryPoints.FACILITIES
      );
      const fieldResponse = await Api.delete('/fields', field);
      const facilityResponse = await Api.put(
        `/facilities?facilities_id=${updatedFacility.facilities_id}`,
        clearFacility
      );

      if (
        fieldResponse?.errorType === 'Error' ||
        facilityResponse?.errorType === 'Error'
      ) {
        throw new Error('Could not delete a field');
      }
    }

    dispatch({
      type: DELETE_FILED_SUCCESS,
      payload: {
        field,
        facility: updatedFacility,
      },
    });

    Toasts.successToast('Field is successfully deleted');
  } catch (err) {
    dispatch({
      type: DELETE_FILED_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};
