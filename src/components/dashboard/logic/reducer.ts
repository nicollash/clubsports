import {
  EVENTS_FETCH_SUCCESS,
  EVENTS_FETCH_FAILURE,
  DASHBOARD_FETCH_START,
  CALENDAR_EVENTS_FETCH_START,
  CALENDAR_EVENTS_FETCH_SUCCESS,
  DASHBOARD_CARDS_FETCH_SUCCESS,
  DASHBOARD_CLEAR,
} from './actionTypes';
import {
  ICalendarEvent,
  IEventDetails,
} from 'common/models';
import { filterEvents } from '../helpers';

export interface IDashboardsCard {
  event: IEventDetails;
  numTeams?: number;
  numFieds?: number;
  numGames?: number;
  regStatus?: boolean;
  numPlayers?: number;
  numLocations?: number;
  lastScheduleRealese?: string;
};

export interface IState {
  calendarEvents: ICalendarEvent[];
  isLoading: boolean;
  isDetailLoading: boolean;
  areCalendarEventsLoading: boolean;
  error: boolean;
  dashboardCards: IDashboardsCard[];
}

const defaultState: IState = {
  calendarEvents: [],
  isLoading: false,
  isDetailLoading: true,
  areCalendarEventsLoading: false,
  error: false,
  dashboardCards: [],
};

export default (
  state = defaultState,
  action: { type: string; payload?: any }
) => {
  switch (action.type) {
    case DASHBOARD_FETCH_START: {
      return {
        ...state,
        isLoading: true,
        error: false,
      };
    }
    case EVENTS_FETCH_SUCCESS: {
      return {
        ...state,
        dashboardCards: filterEvents(action.payload),
        isLoading: false,
        error: false,
      };
    }
    case EVENTS_FETCH_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: true,
      };
    }
    case CALENDAR_EVENTS_FETCH_START: {
      return {
        ...state,
        areCalendarEventsLoading: true,
      };
    }
    case CALENDAR_EVENTS_FETCH_SUCCESS: {
      return {
        ...state,
        calendarEvents: action.payload.sort(
          (a: ICalendarEvent, b: ICalendarEvent) =>
            +new Date(a.cal_event_datetime) - +new Date(b.cal_event_datetime)
        ),
        areCalendarEventsLoading: false,
      };
    }
    case DASHBOARD_CARDS_FETCH_SUCCESS: {
      return { 
        ...state, 
        dashboardCards: filterEvents(action.payload),
        isDetailLoading: false,
      };
    }
    case DASHBOARD_CLEAR: {
      return {
        calendarEvents: [],
        isLoading: false,
        isDetailLoading: true,
        areCalendarEventsLoading: false,
        error: false,
        dashboardCards: [],
      }
    }
    default:
      return state;
  }
};
