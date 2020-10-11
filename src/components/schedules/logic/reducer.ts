import {
  IScheduleAction,
  FETCH_EVENT_SUMMARY_SUCCESS,
  FETCH_EVENT_SUMMARY_FAILURE,
  SCHEDULES_DRAFT_SAVED_SUCCESS,
  SCHEDULES_SAVING_IN_PROGRESS,
  SCHEDULES_DRAFT_SAVED_FAILURE,
  FETCH_SCHEDULES_DETAILS_SUCCESS,
  FETCH_SCHEDULES_DETAILS_FAILURE,
  SCHEDULES_PUBLISHED_FAILURE,
  SCHEDULES_PUBLISHED_SUCCESS,
  SCHEDULES_PUBLISHED_CLEAR,
  ANOTHER_SCHEDULE_PUBLISHED,
  SCHEDULES_GAMES_ALREADY_EXIST,
  SCHEDULES_DETAILS_CLEAR,
  UPDATE_SCHEDULES_DETAILS_IN_PROGRESS,
  UPDATE_SCHEDULES_DETAILS_SUCCESS,
  UPDATE_SCHEDULES_DETAILS_FAILURE,
  DELETE_SCHEDULES_DETAILS_IN_PROGRESS,
  DELETE_SCHEDULES_DETAILS_SUCCESS,
  DELETE_SCHEDULES_DETAILS_FAILURE,
  ADD_SCHEDULES_DETAILS_IN_PROGRESS,
  ADD_SCHEDULES_DETAILS_SUCCESS,
  ADD_SCHEDULES_DETAILS_FAILURE,
  SET_IS_DRAFT_ALREADY_SAVED_STATUS,
} from './actionTypes';
import { IEventSummary } from 'common/models/event-summary';
import { ISchedule } from 'common/models';
import { ISchedulesDetails } from 'common/models/schedule/schedules-details';

export interface ISchedulesState {
  schedule?: ISchedule;
  eventSummary?: IEventSummary[];
  schedulesDetails?: ISchedulesDetails[];
  anotherSchedulePublished: boolean;
  draftIsAlreadySaved: boolean;
  schedulesPublished: boolean;
  gamesAlreadyExist: boolean;
  savingInProgress: boolean;
  updateSchedulesDetailsInProgress: boolean;
  deleteSchedulesDetailsInProgress: boolean;
  addSchedulesDetailsInProgress: boolean;
  fetchError: boolean;
  error: boolean;
}

const initialState: ISchedulesState = {
  error: false,
  fetchError: false,
  savingInProgress: false,
  updateSchedulesDetailsInProgress: false,
  deleteSchedulesDetailsInProgress: false,
  addSchedulesDetailsInProgress: false,
  draftIsAlreadySaved: false,
  schedulesPublished: false,
  anotherSchedulePublished: false,
  gamesAlreadyExist: false,
};

const SchedulesReducer = (state = initialState, action: IScheduleAction) => {
  switch (action.type) {
    case FETCH_EVENT_SUMMARY_SUCCESS:
      return {
        ...state,
        error: false,
        eventSummary: action.payload,
      };
    case FETCH_EVENT_SUMMARY_FAILURE:
      return {
        ...state,
        error: true,
      };
    case SCHEDULES_DRAFT_SAVED_SUCCESS:
      return {
        ...state,
        savingInProgress: false,
        draftIsAlreadySaved: true,
      };
    case SCHEDULES_DRAFT_SAVED_FAILURE:
      return {
        ...state,
        savingInProgress: false,
      };
    case SCHEDULES_SAVING_IN_PROGRESS:
      return {
        ...state,
        savingInProgress: action.payload,
      };
    case FETCH_SCHEDULES_DETAILS_SUCCESS:
      return {
        ...state,
        fetchError: false,
        ...action.payload,
      };
    case FETCH_SCHEDULES_DETAILS_FAILURE:
      return {
        ...state,
        fetchError: true,
      };
    case SCHEDULES_PUBLISHED_SUCCESS:
      return {
        ...state,
        savingInProgress: false,
        schedulesPublished: true,
      };
    case SCHEDULES_PUBLISHED_FAILURE:
      return {
        ...state,
        savingInProgress: false,
      };
    case SCHEDULES_PUBLISHED_CLEAR:
      return {
        ...state,
        schedulesPublished: false,
      };
    case ANOTHER_SCHEDULE_PUBLISHED:
      return {
        ...state,
        anotherSchedulePublished: action.payload,
      };
    case SCHEDULES_GAMES_ALREADY_EXIST:
      return {
        ...state,
        gamesAlreadyExist: action.payload,
      };
    case SCHEDULES_DETAILS_CLEAR:
      return {
        ...state,
        schedule: undefined,
        schedulesDetails: undefined,
      };
    case UPDATE_SCHEDULES_DETAILS_IN_PROGRESS:
      return {
        ...state,
        updateSchedulesDetailsInProgress: true,
      };
    case UPDATE_SCHEDULES_DETAILS_SUCCESS:
      return {
        ...state,
        schedulesDetails: action.payload,
        updateSchedulesDetailsInProgress: false,
      };
    case UPDATE_SCHEDULES_DETAILS_FAILURE:
      return {
        ...state,
        updateSchedulesDetailsInProgress: false,
      };
    case DELETE_SCHEDULES_DETAILS_IN_PROGRESS:
      return {
        ...state,
        deleteSchedulesDetailsInProgress: true,
      };
    case DELETE_SCHEDULES_DETAILS_SUCCESS:
      return {
        ...state,
        schedulesDetails: action.payload,
        deleteSchedulesDetailsInProgress: false,
      };
    case DELETE_SCHEDULES_DETAILS_FAILURE:
      return {
        ...state,
        deleteSchedulesDetailsInProgress: false,
      };
    case ADD_SCHEDULES_DETAILS_IN_PROGRESS:
      return {
        ...state,
        addSchedulesDetailsInProgress: true,
      };
    case ADD_SCHEDULES_DETAILS_SUCCESS:
      return {
        ...state,
        schedulesDetails: action.payload,
        addSchedulesDetailsInProgress: false,
      };
    case ADD_SCHEDULES_DETAILS_FAILURE:
      return {
        ...state,
        addSchedulesDetailsInProgress: false,
      };
    case SET_IS_DRAFT_ALREADY_SAVED_STATUS:
      return {
        ...state,
        draftIsAlreadySaved: action.payload,
      }
    default:
      return state;
  }
};

export default SchedulesReducer;
