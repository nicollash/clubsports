import {
  DASHBOARD_FETCH_START,
  EVENTS_FETCH_SUCCESS,
  EVENTS_FETCH_FAILURE,
  DASHBOARD_CLEAR,
  CALENDAR_EVENTS_FETCH_START,
  CALENDAR_EVENTS_FETCH_SUCCESS,
  DASHBOARD_CARDS_FETCH_SUCCESS,
} from "./actionTypes";
import api from "api/api";
import { ActionCreator, Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { Toasts } from "components/common";
import { IEventDetails, ICalendarEvent, IRegistration } from "common/models";
import { IDashboardsCard } from "./reducer";

export const fetchStart = (): { type: string } => ({
  type: DASHBOARD_FETCH_START,
});

export const fetchCalendarEventsStart = (): { type: string } => ({
  type: CALENDAR_EVENTS_FETCH_START,
});

export const eventsFetchSuccess = (
  payload: IDashboardsCard[]
): { type: string; payload: IDashboardsCard[] } => ({
  type: EVENTS_FETCH_SUCCESS,
  payload,
});

export const eventDetailsFetchFailure = (): { type: string } => ({
  type: EVENTS_FETCH_FAILURE,
});

export const calendarEventsFetchSuccess = (
  payload: ICalendarEvent[]
): { type: string; payload: ICalendarEvent[] } => ({
  type: CALENDAR_EVENTS_FETCH_SUCCESS,
  payload,
});

export const createDashboardCardSuccess = (
  payload: IDashboardsCard[]
): { type: string; payload: IDashboardsCard[] } => ({
  type: DASHBOARD_CARDS_FETCH_SUCCESS,
  payload,
});

const createDashboardCard = async (event: IEventDetails) => {
  const data = await api.get("/events_details");
  const filteredDate = data?.filter(
    (item: any) => item.event_id === event.event_id
  );
  const registration = await api.get(
    `/registrations?event_id=${event.event_id}`
  );

  const startDate = registration
    ? new Date(registration[0]?.registration_start)
    : null;
  const endDate = registration
    ? new Date(registration[0]?.registration_end)
    : null;
  const regStatus =
    registration && startDate && endDate
      ? registration[0]?.payments_enabled_YN === 1 &&
        startDate.getTime() < new Date().getTime() &&
        endDate.getTime() > new Date().getTime()
      : null;
  return {
    event,
    numTeams: filteredDate[0]?.teams_count || 0,
    numFieds: filteredDate[0]?.fields_count,
    numGames:
      filteredDate[0]?.games_count || 0 + filteredDate[0]?.games_count || 0,
    regStatus,
    numPlayers: filteredDate[0]?.players_count || 0,
    numLocations: filteredDate[0]?.locations_count || 0,
    lastScheduleRealese: filteredDate[0]?.latest_schedule_release,
  } as IDashboardsCard;
};

export const getEvents: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = () => async (dispatch: Dispatch) => {
  dispatch(fetchStart());
  const events = await api.get("/events");
  if (!events) {
    dispatch(eventDetailsFetchFailure());
    return Toasts.errorToast("Couldn't load tournaments");
  }
  const eventCards: IDashboardsCard[] = events.map(
    (event: IEventDetails) => ({ event } as IDashboardsCard)
  );
  dispatch(eventsFetchSuccess(eventCards));

  const registrations = await api.get(`/registrations`);
  const registrationStatus = {};
  registrations.forEach((registration: IRegistration) => {
    const selectedEvent = events.find(
      (event: IEventDetails) => event.event_id === registration.event_id
    );
    if (selectedEvent) {
      const startDate = new Date(registration.registration_start);
      const endDate = new Date(registration.registration_end);
      if (
        registration.payments_enabled_YN === 1 &&
        startDate.getTime() < new Date().getTime() &&
        endDate.getTime() > new Date().getTime()
      ) {
        registrationStatus[registration.event_id] = true;
      }
    }
  });

  const dashboardCards: IDashboardsCard[] = await Promise.all(
    events.map((event: IEventDetails) => createDashboardCard(event))
  );
  if (dashboardCards.length) {
    dispatch(createDashboardCardSuccess(dashboardCards));
  }
};

export const getCalendarEvents = () => async (dispatch: Dispatch) => {
  dispatch(fetchCalendarEventsStart());
  const response = await api.get("/calendar_events");

  if (response && !response.error) {
    return dispatch(calendarEventsFetchSuccess(response));
  }
};

export const dashboardClear = () => async (dispatch: Dispatch) => {
  dispatch({
    type: DASHBOARD_CLEAR,
  });
};
