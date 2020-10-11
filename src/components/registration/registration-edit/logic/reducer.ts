import {
  REGISTRATION_FETCH_SUCCESS,
  REGISTRATION_FETCH_FAILURE,
  REGISTRATION_UPDATE_SUCCESS,
  REGISTRATION_FETCH_START,
  DIVISIONS_FETCH_SUCCESS,
  REGISTRANTS_FETCH_SUCCESS,
  REGISTRANTS_PAYMENTS_FETCH_SUCCESS,
  REGISTRANTS_ADD_TO_EVENT_SUCCESS,
  EVENT_FETCH_SUCCESS,
  LOAD_CUSTOM_DATA_SUCCESS,
  UPDATE_REQUESTED_IDS_SUCCESS,
  SWAP_REQUESTED_IDS_SUCCESS,
  UPDATE_OPTIONS_SUCCESS,
} from './actionTypes';
import { sortByField } from 'helpers';
import {
  IDivision,
  IRegistration,
  IRegistrant,
  IEventDetails,
} from 'common/models';
import { SortByFilesTypes } from 'common/enums';

export interface IState {
  requestedIds: any;
  options: any;
  data?: Partial<IRegistration>;
  divisions: IDivision[];
  registrants: IRegistrant[];
  payments: any[];
  event?: IEventDetails;
  isLoading: boolean;
  error: boolean;
}

const defaultState: IState = {
  data: undefined,
  requestedIds: [],
  options: {},
  divisions: [],
  registrants: [],
  payments: [],
  event: undefined,
  isLoading: true,
  error: false,
};

export default (
  state = defaultState,
  action: { type: string; payload?: any }
) => {
  switch (action.type) {
    case REGISTRATION_FETCH_START: {
      return { ...defaultState };
    }
    case REGISTRATION_FETCH_SUCCESS: {
      return {
        ...state,
        data: action.payload[0],
        isLoading: false,
        error: false,
      };
    }
    case REGISTRATION_FETCH_FAILURE: {
      return {
        ...state,
        error: true,
      };
    }
    case REGISTRATION_UPDATE_SUCCESS: {
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        error: false,
        event: state.event,
      };
    }
    case DIVISIONS_FETCH_SUCCESS: {
      return {
        ...state,
        divisions: sortByField(action.payload, SortByFilesTypes.DIVISIONS),
        error: false,
      };
    }
    case REGISTRANTS_FETCH_SUCCESS: {
      return {
        ...state,
        registrants: action.payload,
        error: false,
      };
    }
    case REGISTRANTS_ADD_TO_EVENT_SUCCESS: {
      const { regResponseId, teamId } = action.payload;
      const updatedRegistrants = state.registrants.map((registrant) =>
        registrant.reg_response_id === regResponseId
          ? { ...registrant, team_id: teamId }
          : registrant
      );

      return {
        ...state,
        registrants: updatedRegistrants,
        error: false,
      };
    }

    case REGISTRANTS_PAYMENTS_FETCH_SUCCESS: {
      const newPayments = { ...state.payments };
      newPayments[action.payload.regResponseId] = action.payload.data;
      return {
        ...state,
        payments: newPayments,
        error: false,
      };
    }

    case EVENT_FETCH_SUCCESS: {
      return { ...state, event: action.payload };
    }

    case LOAD_CUSTOM_DATA_SUCCESS: {
      const { requestedIds, options } = action.payload;
      return { ...state, requestedIds, options };
    }

    case UPDATE_REQUESTED_IDS_SUCCESS: {
      const { id, status } = action.payload;
      const { requestedIds } = state;

      switch (status) {
        case 'add':
          return { ...state, requestedIds: [...requestedIds, id] };
        case 'remove':
          const updatedRequestedIds = requestedIds.filter(
            (el: number | string) => el !== id
          );

          return {
            ...state,
            requestedIds: updatedRequestedIds,
          };
        default:
          return {
            state,
          };
      }
    }

    case SWAP_REQUESTED_IDS_SUCCESS: {
      const { oldIndex, newIndex } = action.payload;
      const { requestedIds } = state;

      const updatedRequestedIds = [...requestedIds];
      updatedRequestedIds.splice(oldIndex, 1);
      updatedRequestedIds.splice(newIndex, 0, requestedIds[oldIndex]);

      return { ...state, requestedIds: updatedRequestedIds };
    }

    case UPDATE_OPTIONS_SUCCESS: {
      const { id, value, status } = action.payload;
      const { options } = state;

      switch (status) {
        case 'add':
          return { ...state, options: { ...options, [id]: value } };
        case 'remove': {
          const newOptions = {};

          Object.keys(options || {})
            .filter((el) => el.toString() !== id.toString())
            .map((el) => {
              newOptions[el] = options[el];
              return true;
            });
          return { ...state, options: newOptions };
        }
        default: {
          return {
            state,
          };
        }
      }
    }
    

    default:
      return state;
  }
};
