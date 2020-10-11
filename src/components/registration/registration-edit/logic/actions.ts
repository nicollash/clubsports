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
import api from 'api/api';
import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Toasts } from 'components/common';
import { getVarcharEight } from 'helpers';
import { loadFormFields } from 'components/register-page/individuals/player-stats/logic/actions';
import { IRegistration } from 'common/models/registration';
import { ICalendarEvent } from 'common/models/calendar';
import { IDivision, ITeam, IEventDetails } from 'common/models';
import { ITeamsRegister } from 'common/models/register';

const defaultCalendarEvent = (): Partial<ICalendarEvent> => ({
  cal_event_id: getVarcharEight(),
  cal_event_type: 'event',
  has_reminder_YN: 1,
  status_id: 1,
});

export const registrationFetchStart = (): { type: string } => ({
  type: REGISTRATION_FETCH_START,
});

export const registrationFetchSuccess = (
  payload: any
): { type: string; payload: any } => ({
  type: REGISTRATION_FETCH_SUCCESS,
  payload,
});

export const registrationFetchFailure = (): { type: string } => ({
  type: REGISTRATION_FETCH_FAILURE,
});

export const registrationUpdateSuccess = (
  payload: any,
  event: any | null
): { type: string; payload: any; event: any | null } => ({
  type: REGISTRATION_UPDATE_SUCCESS,
  payload,
  event,
});

export const getRegistration: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (eventId: string) => async (dispatch: Dispatch) => {
  dispatch(registrationFetchStart());
  dispatch<any>(loadCustomData(eventId));

  const data = await api.get(`/registrations?event_id=${eventId}`);
  if (data && data.length > 0) {
    dispatch<any>(getRegistrants(data[0].registration_id));
  }
  const event = await api.get(`/events?event_id=${eventId}`);
  dispatch(registrationFetchSuccess(data));
  dispatch({
    type: EVENT_FETCH_SUCCESS,
    payload: event,
  });
};

export const saveRegistration: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (registration: IRegistration, eventId: string) => async (
  dispatch: Dispatch
) => {
  const event = (await api.get(`/events?event_id=${eventId}`))[0];

  const openEvent: Partial<ICalendarEvent> = {
    ...defaultCalendarEvent(),
    cal_event_title: `${event.event_name} Open`,
    cal_event_startdate: registration.registration_start,
    cal_event_enddate: registration.registration_start,
  };
  const closeEvent: Partial<ICalendarEvent> = {
    ...defaultCalendarEvent(),
    cal_event_title: `${event.event_name} Close`,
    cal_event_startdate: registration.registration_end,
    cal_event_enddate: registration.registration_end,
  };
  const discountEndEvent: Partial<ICalendarEvent> = {
    ...defaultCalendarEvent(),
    cal_event_title: `${event.event_name} Early Bird Discount Ends`,
    cal_event_startdate: registration.discount_enddate,
    cal_event_enddate: registration.discount_enddate,
  };

  if (registration?.registration_id) {
    dispatch(registrationFetchStart());
    const response = await api.put(
      `/registrations?registration_id=${registration.registration_id}`,
      registration
    );

    if (response?.errorType === 'Error' || response?.message === false) {
      return Toasts.errorToast("Couldn't update a registration");
    }

    dispatch(registrationUpdateSuccess(registration, event));
    dispatch<any>(saveCalendarEvent(openEvent));
    dispatch<any>(saveCalendarEvent(closeEvent));
    dispatch<any>(saveCalendarEvent(discountEndEvent));

    Toasts.successToast('Registration is successfully updated');
    dispatch<any>(getDivisions(eventId));
    dispatch<any>(getRegistration(eventId));
    dispatch<any>(getRegistrants(registration.registration_id));
  } else {
    const data = {
      ...registration,
      event_id: eventId,
      registration_id: getVarcharEight(),
    };

    dispatch(registrationFetchStart());
    const response = await api.post(`/registrations`, data);

    if (response?.errorType === 'Error' || response?.message === false) {
      return Toasts.errorToast("Couldn't save a registration");
    }
    dispatch(registrationUpdateSuccess(data, event));
    dispatch<any>(saveCalendarEvent(openEvent));
    dispatch<any>(saveCalendarEvent(closeEvent));
    dispatch<any>(saveCalendarEvent(discountEndEvent));

    Toasts.successToast('Registration is successfully saved');
  }
};

export const updateNoRegistrations: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (registration: any, event: IEventDetails, eventId: string) => async (
  dispatch: Dispatch
) => {
  const response = await api.put(`/events?event_id=${eventId}`, event);
  if (response?.errorType === 'Error' || response?.message === false) {
    return Toasts.errorToast("Couldn't update an event");
  }
  dispatch(registrationUpdateSuccess(registration, event));
};

export const saveCustomData = (eventId: string) => async (
  dispatch: Dispatch,
  getState: () => any
) => {
  try {
    const {
      registration: { requestedIds, options },
    } = getState();

    const oldRequestFields = await api.get(
      `/registrant_data_requests?event_id=${eventId}`
    );

    const oldRequestFieldsPromises: Promise<any>[] = [];

    for (const field of oldRequestFields) {
      oldRequestFieldsPromises.push(
        api.delete(`/registrant_data_requests?request_id=${field.request_id}`)
      );
    }
    await Promise.all(oldRequestFieldsPromises);

    const requestFieldsPromises: Promise<any>[] = [];

    requestedIds.map((id: number, idx: number) => {
      if (options.hasOwnProperty(id)) {
        requestFieldsPromises.push(
          api.post(`/registrant_data_requests`, {
            event_id: eventId,
            data_field_id: id,
            data_sort_order: idx + 1,
          })
        );
      }
      return true;
    });
    await Promise.all(requestFieldsPromises);

    const updatedRequestFields = await api.get(
      `/registrant_data_requests?event_id=${eventId}`
    );

    const optionsPromises: Promise<any>[] = [];

    Object.keys(options).forEach(el => {
      const optionsFields = updatedRequestFields.filter(
        (updatedField: any) => updatedField.data_field_id.toString() === el
      );

      if (optionsFields.length > 0) {
        optionsPromises.push(
          api.put(`/registrant_data_requests`, {
            request_id: optionsFields[0].request_id,
            is_required_YN: options[el],
          })
        );
      }
    });
    await Promise.all(optionsPromises);

    dispatch<any>(loadFormFields(eventId));
  } catch {
    Toasts.errorToast("Couldn't save custom data");
  }
};

export const saveCalendarEvent: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (event: ICalendarEvent) => async () => {
  const eventList = await api.get(
    `/calendar_events?cal_event_title=${event.cal_event_title}`
  );

  if (eventList.length) {
    // update if exist
    const eventList = await api.get(
      `/calendar_events?cal_event_title=${event.cal_event_title}`
    );
    if (eventList.length) {
      const response = await api.put(
        `/calendar_events?cal_event_id=${eventList[0].cal_event_id}`,
        event
      );
      if (response?.errorType === 'Error' || response?.message === false) {
        return Toasts.errorToast("Couldn't update (calendar event)");
      }
    }
  } else {
    // create if not exist
    const response = await api.post('/calendar_events', event);
    if (response?.errorType === 'Error' || response?.message === false) {
      return Toasts.errorToast("Couldn't create (calendar event)");
    }
  }
};

export const getDivisions: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (eventId: string) => async (dispatch: Dispatch) => {
  const data = await api.get(`/divisions?event_id=${eventId}`);
  dispatch(divisionsFetchSuccess(data));
};

export const divisionsFetchSuccess = (
  payload: IDivision
): { type: string; payload: IDivision } => ({
  type: DIVISIONS_FETCH_SUCCESS,
  payload,
});

export const addTeamToEvent: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (registrant: ITeamsRegister, event: IEventDetails) => async (
  dispatch: Dispatch
) => {
  let team: ITeam;
  const teams: ITeam[] = await api.get(
    `teams?division_id=${registrant.division_id}&long_name=${registrant.team_name}`
  );
  if (teams.length === 0) {
    // Create a new team if does not exist
    team = {
      team_id: getVarcharEight(),
      event_id: event.event_id,
      org_id: event.org_id,
      long_name: registrant.team_name,
      short_name: registrant.team_name,
      team_tag: null,
      city: registrant.team_city,
      state: registrant.team_state,
      level: registrant.team_level,
      contact_first_name: registrant.contact_first_name,
      contact_last_name: registrant.contact_last_name,
      phone_num: registrant.contact_mobile,
      contact_email: registrant.contact_email,
      schedule_restrictions: null,
      is_active_YN: 1,
      is_library_YN: null,
      division_id: registrant.division_id,
      pool_id: null,
    };

    await api.post(`/teams`, team);
  } else {
    team = teams[0];
  }

  const updatedRegistrant = {
    ...registrant,
    team_id: team.team_id,
  };
  delete updatedRegistrant.type;

  await api.put(
    `/reg_responses_teams?reg_response_id=${updatedRegistrant.reg_response_id}`,
    updatedRegistrant
  );

  dispatch(
    registrantsAddToEventSuccess({
      regResponseId: updatedRegistrant.reg_response_id,
      teamId: team.team_id,
    })
  );
  Toasts.successToast(`Team ${team.long_name} added to the event`);
};

export const registrantsAddToEventSuccess = (
  payload: any
): { type: string; payload: any[] } => ({
  type: REGISTRANTS_ADD_TO_EVENT_SUCCESS,
  payload,
});

export const getRegistrants: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (registrationId?: string) => async (dispatch: Dispatch) => {
  const regQueryString = registrationId
    ? `?registration_id=${registrationId}`
    : '';
  let [teams, individuals] = await Promise.all([
    api.get(`/reg_responses_teams${regQueryString}`),
    api.get(`/reg_responses_individuals${regQueryString}`),
  ]);
  teams = teams.map((x: any) => ({ ...x, type: 'team' }));
  individuals = individuals.map((x: any) => ({ ...x, type: 'individual' }));

  const data = teams.concat(individuals).map((x: any) => {
    let { custom_data, ...row } = x;

    if (custom_data) {
      try {
        row = Object.assign(row, JSON.parse(custom_data));
      } catch (err) {
        // This should not be happening
      }
    }

    return row;
  });

  dispatch(registrantsFetchSuccess(data));
};

export const registrantsFetchSuccess = (
  payload: any[]
): { type: string; payload: any[] } => ({
  type: REGISTRANTS_FETCH_SUCCESS,
  payload,
});

export const getRegistrantPayments: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (regResponseId: string) => async (dispatch: Dispatch) => {
  // dispatch(registrantsPaymentsFetchSuccess({ regResponseId, data: null }));
  const data = await api.get(
    `/registrations_payments?reg_response_id=${regResponseId}`
  );

  dispatch(registrantsPaymentsFetchSuccess({ regResponseId, data }));
};

export const registrantsPaymentsFetchSuccess = (
  payload: any
): { type: string; payload: any[] } => ({
  type: REGISTRANTS_PAYMENTS_FETCH_SUCCESS,
  payload,
});

export const loadCustomData: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (eventId: string) => async (dispatch: Dispatch) => {
  const requestedFieldsResponse = await api.get(
    `/registrant_data_requests?event_id=${eventId}`
  );
  const requestedFields = requestedFieldsResponse.map((field: any) => ({
    data_field_id: field.data_field_id,
    data_sort_order: field.data_sort_order,
    is_required_YN: field.is_required_YN,
  }));
  const requestedIds: number[] = [];
  const options = {};

  requestedFields
    .sort((a: any, b: any) => {
      const fieldA = a.data_sort_order;
      const fieldB = b.data_sort_order;

      let comparison = 0;
      if (fieldA > fieldB) {
        comparison = 1;
      } else if (fieldA < fieldB) {
        comparison = -1;
      }
      return comparison;
    })
    .map((el: any) => {
      const { data_field_id, is_required_YN } = el;

      requestedIds.push(data_field_id);
      options[data_field_id] = is_required_YN;
      return true;
    });

  dispatch(loadCustomDataSuccess({ requestedIds, options }));
};

export const loadCustomDataSuccess = (
  payload: any
): { type: string; payload: any[] } => ({
  type: LOAD_CUSTOM_DATA_SUCCESS,
  payload,
});

export const updateRequestedIds = (
  payload: any
): { type: string; payload: any[] } => ({
  type: UPDATE_REQUESTED_IDS_SUCCESS,
  payload,
});

export const swapRequestedIds = (
  payload: any
): { type: string; payload: any[] } => ({
  type: SWAP_REQUESTED_IDS_SUCCESS,
  payload,
});

export const updateOptions = (
  payload: any
): { type: string; payload: any[] } => ({
  type: UPDATE_OPTIONS_SUCCESS,
  payload,
});
