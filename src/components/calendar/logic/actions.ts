import { Dispatch, ActionCreator } from 'redux';
import { ICalendarEvent } from 'common/models/calendar';
import { Toasts } from 'components/common';
import {
  CALENDAR_EVENT_FETCH_MULT,
  GET_TAGS_SUCCESS,
  CALENDAR_EVENT_CREATE_SUCC,
  CALENDAR_EVENT_DELETE_SUCC,
  CALENDAR_EVENT_UPDATE_SUCC,
} from './actionTypes';
import api from 'api/api';
import { ThunkAction } from 'redux-thunk';

const fetchCalendarEvents = (payload: ICalendarEvent[]) => ({
  type: CALENDAR_EVENT_FETCH_MULT,
  payload,
});

const getTagsSuccess = (payload: any[]) => ({
  type: GET_TAGS_SUCCESS,
  payload,
});

const saveCalendarEventSuccess = (payload: ICalendarEvent) => ({
  type: CALENDAR_EVENT_CREATE_SUCC,
  payload,
});

const updateCalendarEventSuccess = (payload: ICalendarEvent) => ({
  type: CALENDAR_EVENT_UPDATE_SUCC,
  payload,
});

const deleteCalendarEventSuccess = (payload: string) => ({
  type: CALENDAR_EVENT_DELETE_SUCC,
  payload,
});

export const getCalendarEvents = () => async (dispatch: Dispatch) => {
  const response = await api.get('/calendar_events');

  if (response && !response.error) {
    return dispatch(fetchCalendarEvents(response));
  }

  Toasts.errorToast("Couldn't load the events");
};

export const saveCalendarEvent: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (event: ICalendarEvent) => async (dispatch: Dispatch) => {
  const response = await api.post('/calendar_events', event);

  if (response?.errorType === 'Error' || response?.message === false) {
    return Toasts.errorToast("Couldn't create");
  }

  dispatch(saveCalendarEventSuccess(event));

  Toasts.successToast('Successfully created');
};

export const updateCalendarEvent: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (event: ICalendarEvent, snooze?: boolean) => async (
  dispatch: Dispatch
) => {
  const response = await api.put(
    `/calendar_events?cal_event_id=${event.cal_event_id}`,
    event
  );

  if (response?.errorType === 'Error' || response?.message === false) {
    return Toasts.errorToast("Couldn't update");
  }

  dispatch(updateCalendarEventSuccess(event));

  !snooze && Toasts.successToast('Successfully updated');
};

export const deleteCalendarEvent: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (id: string) => async (dispatch: Dispatch) => {
  const response = await api.delete(`/calendar_events?cal_event_id=${id}`);

  if (response?.errorType === 'Error' || response?.message === false) {
    return Toasts.errorToast("Couldn't delete");
  }

  dispatch(deleteCalendarEventSuccess(id));

  Toasts.successToast('Successfully deleted');
};

export const getTags = (value: string) => async (dispatch: Dispatch) => {
  if (value) {
    const response = await api.get(`/tag_search?search_term=${value}%25`);

    if (response && !response.error) {
      return dispatch(getTagsSuccess(response));
    }
  }
};
