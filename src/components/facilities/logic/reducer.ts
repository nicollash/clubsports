import {
  LOAD_FACILITIES_START,
  LOAD_FACILITIES_SUCCESS,
  LOAD_FIELDS_START,
  LOAD_FIELDS_SUCCESS,
  ADD_EMPTY_FACILITIES,
  ADD_EMPTY_FIELDS,
  UPDATE_FACILITY,
  FacilitiesAction,
  UPDATE_FIELD,
  UPLOAD_FILE_MAP_SUCCESS,
  SAVE_FACILITIES_SUCCESS,
  DELETE_FACILITY_SUCCESS,
  DELETE_FILED_SUCCESS,
} from './action-types';
import {
  ADD_ENTITIES_TO_LIBRARY_SUCCESS,
  AuthPageAction,
} from 'components/authorized-page/authorized-page-event/logic/action-types';
import { IFacility, IField } from 'common/models';
import { EntryPoints } from 'common/enums';
import { getSortedFieldsByFacility } from '../helpers';

export interface IFacilitiesState {
  isLoading: boolean;
  isLoaded: boolean;
  facilities: IFacility[];
  fields: IField[];
}

const initialState = {
  isLoading: false,
  isLoaded: false,
  facilities: [],
  fields: [],
};

const facilitiesReducer = (
  state: IFacilitiesState = initialState,
  action: FacilitiesAction | AuthPageAction
) => {
  switch (action.type) {
    case LOAD_FACILITIES_START: {
      return { ...initialState, isLoading: true };
    }
    case LOAD_FACILITIES_SUCCESS:
      const { facilities } = action.payload;

      return {
        ...state,
        facilities,
        isLoading: false,
        isLoaded: true,
      };
    case LOAD_FIELDS_START: {
      const { facilityId } = action.payload;

      return {
        ...state,
        facilities: state.facilities.map(it =>
          it.facilities_id === facilityId
            ? { ...it, isFieldsLoading: true }
            : it
        ),
      };
    }
    case LOAD_FIELDS_SUCCESS: {
      const { facilityId, fields } = action.payload;

      const sortedFields = getSortedFieldsByFacility([
        ...state.fields,
        ...fields,
      ]);

      return {
        ...state,
        facilities: state.facilities.map(it =>
          it.facilities_id === facilityId
            ? { ...it, isFieldsLoading: false, isFieldsLoaded: true }
            : it
        ),
        fields: sortedFields,
      };
    }
    case ADD_EMPTY_FACILITIES: {
      const { facilities } = action.payload;

      return {
        ...state,
        facilities: [...state.facilities, ...facilities],
      };
    }
    case ADD_EMPTY_FIELDS: {
      const { fields } = action.payload;

      return {
        ...state,
        fields: [...state.fields, ...fields],
      };
    }
    case UPDATE_FACILITY: {
      const { updatedFacility } = action.payload;

      return {
        ...state,
        facilities: state.facilities.map(it =>
          it.facilities_id === updatedFacility.facilities_id
            ? updatedFacility
            : it
        ),
      };
    }
    case UPDATE_FIELD: {
      const { updatedField } = action.payload;

      return {
        ...state,
        fields: state.fields.map(it =>
          it.field_id === updatedField.field_id ? updatedField : it
        ),
      };
    }
    case UPLOAD_FILE_MAP_SUCCESS: {
      const { facility } = action.payload;

      return {
        ...state,
        facilities: state.facilities.map(it =>
          it.facilities_id === facility.facilities_id ? facility : it
        ),
      };
    }
    case SAVE_FACILITIES_SUCCESS: {
      const { facilities } = action.payload;

      return {
        ...state,
        facilities: [
          ...state.facilities,
          ...facilities.filter(fac => !state.facilities.includes(fac)),
        ],
      };
    }
    case ADD_ENTITIES_TO_LIBRARY_SUCCESS: {
      const { entities, entryPoint } = action.payload;

      if (entryPoint === EntryPoints.FACILITIES) {
        const updatedFacilities = entities as IFacility[];

        const facilities = state.facilities.map(facility => {
          const updatedFacility = updatedFacilities.find(
            it => it.facilities_id === facility.facilities_id
          );

          return updatedFacility ? updatedFacility : facility;
        });

        return {
          ...state,
          facilities,
        };
      } else {
        return state;
      }
    }
    case DELETE_FACILITY_SUCCESS: {
      const { facilityId } = action.payload;
      return {
        ...state,
        facilities: state.facilities.filter(
          facility => facility.facilities_id !== facilityId
        ),
      };
    }
    case DELETE_FILED_SUCCESS: {
      const { field, facility } = action.payload;

      return {
        ...state,
        fields: state.fields.filter(it => it.field_id !== field.field_id),
        facilities: state.facilities.map(it =>
          it.facilities_id === facility.facilities_id ? facility : it
        ),
      };
    }

    default:
      return state;
  }
};

export default facilitiesReducer;
