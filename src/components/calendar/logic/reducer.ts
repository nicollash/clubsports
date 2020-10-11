import {
  CalendarEventActions,
  CALENDAR_EVENT_FETCH_MULT,
  CALENDAR_EVENT_CREATE_SUCC,
  CALENDAR_EVENT_DELETE_SUCC,
  CALENDAR_EVENT_UPDATE_SUCC,
  GET_TAGS_SUCCESS,
} from './actionTypes';
import { ICalendarEvent } from 'common/models/calendar';
import ITag from 'common/models/calendar/tag';

export interface ICalendarState {
  events: ICalendarEvent[] | null | undefined;
  error: boolean;
  tags: ITag[];
}

const appState: ICalendarState = {
  events: undefined,
  tags: [],
  error: false,
};

export default (
  state = appState,
  action: CalendarEventActions
): ICalendarState => {
  switch (action.type) {
    case CALENDAR_EVENT_FETCH_MULT:
      return {
        ...state,
        error: false,
        events: action.payload,
      };
    case GET_TAGS_SUCCESS:
      return {
        ...state,
        tags: action.payload,
      };
    case CALENDAR_EVENT_CREATE_SUCC:
      return {
        ...state,
        events: [...state.events, action.payload],
      };
    case CALENDAR_EVENT_UPDATE_SUCC:
      return {
        ...state,
        events: state.events?.map(event =>
          event.cal_event_id === action.payload.cal_event_id
            ? action.payload
            : event
        ),
      };
    case CALENDAR_EVENT_DELETE_SUCC:
      return {
        ...state,
        events: state.events?.filter(
          event => event.cal_event_id !== action.payload
        ),
      };
    default:
      return state;
  }
};
