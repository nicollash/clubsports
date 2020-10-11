import {
  EVENTS_FETCH_SUCCESS,
  FACILITIES_FETCH_SUCCESS,
  FIELDS_FETCH_SUCCESS,
  BACKUP_PLANS_FETCH_SUCCESS,
  ADD_BACKUP_PLAN_SUCCESS,
  DELETE_BACKUP_PLAN,
  UPDATE_BACKUP_PLAN,
  LOAD_TIMESLOTS_START,
  LOAD_TIMESLOTS_SUCCESS,
} from './actionTypes';
import { IFacility, IField, IEventDetails, ISchedule } from 'common/models';
import { IBackupPlan } from 'common/models/backup_plan';
import { IComplexityTimeslots } from '../common';

export interface IGamedayComplexitiesState {
  data: IEventDetails[];
  facilities: IFacility[];
  fields: IField[];
  schedules: ISchedule[];
  backupPlans: IBackupPlan[];
  timeSlots: IComplexityTimeslots;
  isLoading: boolean;
}

const defaultState: IGamedayComplexitiesState = {
  data: [],
  facilities: [],
  fields: [],
  backupPlans: [],
  schedules: [],
  timeSlots: {},
  isLoading: true,
};

export default (
  state = defaultState,
  action: { type: string; payload?: any }
) => {
  switch (action.type) {
    case EVENTS_FETCH_SUCCESS: {
      const { events, schedules } = action.payload;

      return {
        ...state,
        data: events.sort(
          (a: IEventDetails, b: IEventDetails) =>
            +new Date(b.event_startdate) - +new Date(a.event_startdate)
        ),
        schedules,
      };
    }
    case FACILITIES_FETCH_SUCCESS: {
      return {
        ...state,
        facilities: action.payload,
      };
    }
    case FIELDS_FETCH_SUCCESS: {
      return {
        ...state,
        fields: action.payload,
      };
    }
    case BACKUP_PLANS_FETCH_SUCCESS: {
      return {
        ...state,
        backupPlans: action.payload,
        isLoading: false,
      };
    }
    case ADD_BACKUP_PLAN_SUCCESS: {
      return {
        ...state,
        backupPlans: [action.payload, ...state.backupPlans],
      };
    }
    case DELETE_BACKUP_PLAN: {
      return {
        ...state,
        backupPlans: state.backupPlans.filter(
          backupPlan => backupPlan.backup_plan_id !== action.payload
        ),
      };
    }
    case UPDATE_BACKUP_PLAN: {
      return {
        ...state,
        backupPlans: state.backupPlans.map(backupPlan =>
          backupPlan.backup_plan_id === action.payload.backup_plan_id
            ? action.payload
            : backupPlan
        ),
      };
    }
    case LOAD_TIMESLOTS_START: {
      const { eventId } = action.payload;

      return {
        ...state,
        timeSlots: {
          ...state.timeSlots,
          [eventId]: {
            eventId,
            isLoading: true,
          },
        },
      };
    }
    case LOAD_TIMESLOTS_SUCCESS: {
      const { eventId, eventDays, eventTimeSlots } = action.payload;

      return {
        ...state,
        timeSlots: {
          ...state.timeSlots,
          [eventId]: {
            eventId,
            eventTimeSlots,
            eventDays,
            isLoading: false,
            isLoaded: true,
          },
        },
      };
    }
    default:
      return state;
  }
};
