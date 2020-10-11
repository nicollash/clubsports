import {
  LibraryManagerAction,
  LIBRARY_MANAGER_LOAD_DATA_START,
  LIBRARY_MANAGER_LOAD_DATA_SUCCESS,
  SAVE_CLONED_ITEM_SUCCESS,
  DELETE_LIBRARY_ITEM_SUCCESS,
} from './action-types';
import {
  ILibraryManagerRegistration,
  ILibraryManagerFacility,
  ILibraryManagerDivision,
  ILibraryManagerSchedule,
} from '../common';
import {
  IEventDetails,
  IFacility,
  IDivision,
  ISchedule,
  IRegistration,
} from 'common/models';
import { EntryPoints } from 'common/enums';

export interface ILibraryManagerState {
  isLoading: boolean;
  isLoaded: boolean;
  events: IEventDetails[];
  registrations: ILibraryManagerRegistration[];
  facilities: ILibraryManagerFacility[];
  divisions: ILibraryManagerDivision[];
  schedules: ILibraryManagerSchedule[];
}

const initialState = {
  isLoading: false,
  isLoaded: false,
  events: [],
  registrations: [],
  facilities: [],
  divisions: [],
  schedules: [],
};

const libraryManagerReducer = (
  state: ILibraryManagerState = initialState,
  action: LibraryManagerAction
) => {
  switch (action.type) {
    case LIBRARY_MANAGER_LOAD_DATA_START: {
      return {
        ...initialState,
        isLoading: true,
      };
    }
    case LIBRARY_MANAGER_LOAD_DATA_SUCCESS: {
      const {
        events,
        registrations,
        facilities,
        divisions,
        schedules,
      } = action.payload;

      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        events,
        registrations,
        facilities,
        divisions,
        schedules,
      };
    }
    case DELETE_LIBRARY_ITEM_SUCCESS: {
      const { libraryItem, entryPoint } = action.payload;

      switch (entryPoint) {
        case EntryPoints.EVENTS: {
          const event = libraryItem as IEventDetails;

          return {
            ...state,
            events: state.events.filter(it => it.event_id !== event.event_id),
          };
        }
        case EntryPoints.REGISTRATIONS: {
          const registration = libraryItem as IRegistration;

          return {
            ...state,
            registrations: state.registrations.filter(
              it => it.registration_id !== registration.registration_id
            ),
          };
        }
        case EntryPoints.FACILITIES: {
          const facility = libraryItem as IFacility;

          return {
            ...state,
            facilities: state.facilities.filter(
              it => it.facilities_id !== facility.facilities_id
            ),
          };
        }
        case EntryPoints.DIVISIONS: {
          const division = libraryItem as IDivision;

          return {
            ...state,
            divisions: state.divisions.filter(
              it => it.division_id !== division.division_id
            ),
          };
        }
        case EntryPoints.SCHEDULES: {
          const schedule = libraryItem as ISchedule;

          return {
            ...state,
            schedules: state.schedules.filter(
              it => it.schedule_id !== schedule.schedule_id
            ),
          };
        }
        default:
          return state;
      }
    }
    case SAVE_CLONED_ITEM_SUCCESS: {
      const { entity, entryPoint } = action.payload;

      switch (entryPoint) {
        case EntryPoints.EVENTS: {
          const event = entity as IEventDetails;

          return {
            ...state,
            events: [...state.events, event],
          };
        }
        default:
          return state;
      }
    }
    default:
      return state;
  }
};

export default libraryManagerReducer;
