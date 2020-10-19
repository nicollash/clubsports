/* eslint-disable no-throw-literal */
import { ThunkAction } from 'redux-thunk';
import { ActionCreator, Dispatch } from 'redux';
import { Storage } from 'aws-amplify';
import * as Yup from 'yup';
import api from 'api/api';
import { getVarcharEight } from 'helpers';
import {
  EVENT_DETAILS_FETCH_START,
  EVENT_DETAILS_FETCH_SUCCESS,
  EVENT_DETAILS_FETCH_FAILURE,
  EventDetailsAction,
  ORGANIZATIONS_FETCH_START,
  ORGANIZATIONS_FETCH_SUCCESS,
  ORGANIZATIONS_FETCH_FAILURE,
  OrganizationsAction,
} from './actionTypes';
import { eventDetailsSchema, reporterSchemaCsv } from 'validations';
import { IIconFile } from './model';
import history from 'browserhistory';
import { ICalendarEvent } from 'common/models/calendar';
import { Toasts } from 'components/common';
import {
  IDivision,
  IFacility,
  BindingAction,
  IEventDetails,
  IReporter,
} from 'common/models';
import { registrationUpdateSuccess } from '../../registration/registration-edit/logic/actions';

export const eventDetailsFetchStart = () => ({
  type: EVENT_DETAILS_FETCH_START,
});

export const organizationsFetchStart = () => ({
  type: ORGANIZATIONS_FETCH_START,
});

export const eventDetailsFetchSuccess = (
  payload: IEventDetails[]
): EventDetailsAction => ({
  type: EVENT_DETAILS_FETCH_SUCCESS,
  payload,
});

export const organizationsFetchSuccess = (
  payload: any
): OrganizationsAction => ({
  type: ORGANIZATIONS_FETCH_SUCCESS,
  payload,
});

export const eventDetailsFetchFailure = (): EventDetailsAction => ({
  type: EVENT_DETAILS_FETCH_FAILURE,
});

export const organizationsFetchFailure = (): OrganizationsAction => ({
  type: ORGANIZATIONS_FETCH_FAILURE,
});

export const getOrganizations: ActionCreator<ThunkAction<
  void,
  {},
  null,
  OrganizationsAction
>> = () => async (dispatch: Dispatch) => {
  dispatch(organizationsFetchStart());

  const organizations = await api.get('/organizations');


  if (organizations) {
    dispatch(organizationsFetchSuccess(organizations));
  } else {
    dispatch(organizationsFetchFailure());
  }
};

export const getEventDetails: ActionCreator<ThunkAction<
  void,
  {},
  null,
  EventDetailsAction
>> = (eventId: string) => async (dispatch: Dispatch) => {
  dispatch(eventDetailsFetchStart());

  const eventDetails = await api.get('/events', { event_id: eventId });

  if (eventDetails) {
    dispatch(eventDetailsFetchSuccess(eventDetails));
  } else {
    dispatch(eventDetailsFetchFailure());
  }
};

export const saveEventDetails: ActionCreator<ThunkAction<
  void,
  {},
  null,
  EventDetailsAction
>> = (eventDetails: IEventDetails) => async (dispatch: Dispatch) => {
  try {
    await eventDetailsSchema.validate(eventDetails);

    const response = await api.put(
      `/events?event_id=${eventDetails.event_id}`,
      eventDetails
    );

    const registration = await api.get(`/registrations?event_id=${eventDetails.event_id}`);

    if (response?.errorType !== undefined) {
      return Toasts.errorToast("Couldn't save the changes");
    }

    const calendarEvent: Partial<ICalendarEvent> = {
      cal_event_id: eventDetails.event_id || '',
      cal_event_title: eventDetails.event_name || '',
      cal_event_type: 'event',
      cal_event_datetime: eventDetails.created_datetime || '',
      cal_event_tag: eventDetails.event_tag || '',
      cal_event_desc: eventDetails.event_description || '',
      cal_event_startdate: eventDetails.event_startdate || '',
      cal_event_enddate: eventDetails.event_enddate || '',
      has_reminder_YN: 1,
      status_id: 1,
    };
    dispatch<any>(saveCalendarEvent(calendarEvent));
    // dispatch<any>(updateMenu());

    Toasts.successToast('Changes successfully saved');

    dispatch<any>(getEventDetails(eventDetails.event_id));
    dispatch<any>(registrationUpdateSuccess(registration, eventDetails))
  } catch (err) {
    Toasts.errorToast(err.message);
  }
};

export const saveCalendarEvent: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (event: ICalendarEvent) => async () => {
  const eventList = await api.get(
    `/calendar_events?cal_event_id=${event.cal_event_id}`
  );

  if (eventList.length) {
    // update if exist
    const response = await api.put(
      `/calendar_events?cal_event_id=${event.cal_event_id}`,
      event
    );

    if (response?.errorType === 'Error' || response?.message === false) {
      return Toasts.errorToast("Couldn't update (calendar event)");
    }
  } else {
    // create if not exist
    const response = await api.post('/calendar_events', event);

    if (response?.errorType === 'Error' || response?.message === false) {
      return Toasts.errorToast("Couldn't create (calendar event)");
    }
  }

  Toasts.successToast('Successfully saved (calendar event)');
};

export const createEvent: ActionCreator<ThunkAction<
  void,
  {},
  null,
  EventDetailsAction
>> = (eventDetails: IEventDetails) => async (dispatch: Dispatch) => {
  try {
    await Yup.array()
      .of(eventDetailsSchema)
      .unique(
        e => e.event_name,
        'You already have an event with the same name. Event must have a unique name.'
      )
      .validate([eventDetails]);

    const response = await api.post('/events', eventDetails);

    if (response?.errorType !== undefined)
      return Toasts.errorToast("Couldn't save the changes");

    const calendarEvent: Partial<ICalendarEvent> = {
      cal_event_id: eventDetails.event_id || '',
      cal_event_title: eventDetails.event_name || '',
      cal_event_type: 'event',
      cal_event_datetime: eventDetails.created_datetime || '',
      cal_event_tag: eventDetails.event_tag || '',
      cal_event_desc: eventDetails.event_description || '',
      cal_event_startdate: eventDetails.event_startdate || '',
      cal_event_enddate: eventDetails.event_enddate || '',
      has_reminder_YN: 1,
      status_id: 1,
    };
    dispatch<any>(saveCalendarEvent(calendarEvent));

    Toasts.successToast('Changes successfully saved');

    history.replace(`/event/event-details/${eventDetails.event_id}`);

    dispatch<any>(getEventDetails(eventDetails.event_id));
  } catch (err) {
    Toasts.errorToast(err.message);
  }
};

// export const uploadFiles = (files: IIconFile[]) => () => {
//   if (!files || !files.length) return;

//   files.forEach((fileObject: IIconFile) => {
//     const { file, destinationType } = fileObject;
//     const uuid = uuidv4();
//     const saveFilePath = `event_media_files/${destinationType}_${uuid}_${file.name}`;
//     const config = { contentType: file.type };

//     Storage.put(saveFilePath, file, config)
//       .then(() => Toasts.successToast(`${file.name} was successfully uploaded`))
//       .catch(() => Toasts.errorToast(`${file.name} couldn't be uploaded`));
//   });
// };

export const removeFiles = (files: IIconFile[]) => () => {
  if (!files || !files.length) return;

  files.forEach(fileObject => {
    const { file, destinationType } = fileObject;
    const key = `event_media_files/${destinationType}_${file.name}`;
    Storage.remove(key)
      .then(() => Toasts.successToast(`${file.name} was successfully removed`))
      .catch(() => Toasts.errorToast(`${file.name} failed to remove`));
  });
};

export const deleteEvent: ActionCreator<ThunkAction<
  void,
  {},
  null,
  EventDetailsAction
>> = (eventId: string, eventName: string) => async (_dispatch: Dispatch) => {
  // Delete EVENT
  await api.delete(`/events?event_id=${eventId}`);

  // DELETE REGISTRATION
  const registrations = await api.get(`/registrations?event_id=${eventId}`);
  api.delete('/registrations', registrations);

  // Delete calendar event
  await api.delete(`/calendar_events?cal_event_id=${eventId}`, {
    is_active_YN: 0,
  });

  const openEvent = await api.get(
    `/calendar_events?cal_event_title=${eventName} Open`
  );
  if (openEvent.length)
    await api.delete(
      `/calendar_events?cal_event_id=${openEvent[0].cal_event_id}`,
      {
        is_active_YN: 0,
      }
    );

  const closeEvent = await api.get(
    `/calendar_events?cal_event_title=${eventName} Close`
  );
  if (closeEvent.length)
    await api.delete(
      `/calendar_events?cal_event_id=${closeEvent[0].cal_event_id}`,
      {
        is_active_YN: 0,
      }
    );

  const discountEndEvent = await api.get(
    `/calendar_events?cal_event_title=${eventName} Early Bird Discount Ends`
  );
  if (discountEndEvent.length)
    await api.delete(
      `/calendar_events?cal_event_id=${discountEndEvent[0].cal_event_id}`,
      {
        is_active_YN: 0,
      }
    );

  // DELETE DIVISIONS&POOLS
  const divisions = await api.get(`/divisions?event_id=${eventId}`);
  divisions.forEach(async (division: IDivision) => {
    const pools = await api.get(`/pools?division_id=${division.division_id}`);
    api.delete('/pools', pools);
  });
  api.delete('/divisions', divisions);

  // DELETE TEAMS
  const teams = await api.get(`/teams?event_id=${eventId}`);
  api.delete('/teams', teams);

  // DELETE FACILITIES&FIELDS
  const facilities = await api.get(`/facilities?event_id=${eventId}`);
  facilities.forEach(async (facility: IFacility) => {
    const fields = await api.get(
      `/fields?facilities_id=${facility.facilities_id}`
    );
    api.delete('/fields', fields);
  });
  api.delete('/facilities', facilities);

  Toasts.successToast('Event is successfully deleted');
  history.push('/');
};

export const createEvents: ActionCreator<ThunkAction<
  void,
  {},
  null,
  EventDetailsAction
>> = (events: IEventDetails[], cb: BindingAction) => async (
  dispatch: Dispatch
) => {
  try {
    const allEvents = await api.get('/events');

    for (const event of events) {
      await Yup.array()
        .of(eventDetailsSchema)
        .unique(
          e => e.event_name,
          'You already have an event with the same name. Event must have a unique name.'
        )
        .validate([...allEvents, event]);
    }

    for (const event of events) {
      await api.post('/events', event);
    }
    const lastEvent = events[events.length - 1];
    const successMsg = `Events are successfully created (${events.length})`;
    Toasts.successToast(successMsg);
    cb();
    history.replace(`/event/event-details/${lastEvent.event_id}`);

    dispatch<any>(getEventDetails(lastEvent.event_id));
  } catch (err) {
    const e = err.value[err.value.length - 1];
    const index = events.findIndex(event => event.event_id === e.event_id);
    const errMessage = `Record ${index + 1}: ${err.message}`;
    return Toasts.errorToast(errMessage);
  }
};

export const createDataFromCSV: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (data: any, cb: (parm?: object) => void) => async () => {
  // exit when no data from CSV
  if (data.length === 0) {
    return;
  }

  const { event_id } = data[0];

  // unique divisionList from CSV
  const newDivisions = new Set();
  // unique divisionList with its ID from CSV&DB
  const newDivisionList = {};
  const newPools = {};
  const newPoolList = {};
  const newTeams = {};
  const errDivisions: number[] = [];
  const errTeams = new Set();

  const allDivisions = await api.get(`/divisions?event_id=${event_id}`);

  data.forEach(
    (
      {
        division_name,
        pool_name,
        coach_email,
        coach_first_name,
        coach_last_name,
        coach_phone,
        team_city,
        team_id,
        team_name,
        team_state,
      }: {
        division_name: string;
        pool_name: string | undefined;
        coach_email: string | undefined;
        coach_first_name: string | undefined;
        coach_last_name: string | undefined;
        coach_phone: string | undefined;
        team_city: string | undefined;
        team_id: string | undefined;
        team_name: string | undefined;
        team_state: string | undefined;
      },
      index: number
    ) => {
      if (division_name && division_name.trim()) {
        newDivisions.add(division_name);

        if (pool_name && pool_name.trim()) {
          if (!newPools.hasOwnProperty(division_name)) {
            newPools[division_name] = new Set();
          }
          newPools[division_name].add(pool_name);
        }

        if (!newTeams.hasOwnProperty(division_name)) {
          newTeams[division_name] = [];
        }
        newTeams[division_name].push({
          index,
          pool_name,
          coach_email,
          coach_first_name,
          coach_last_name,
          coach_phone,
          team_city,
          team_id,
          team_name,
          team_state,
        });
      } else {
        errDivisions.push(index);
      }
    }
  );

  const promisesNewTeams = [];

  for (const parentDivision in newTeams) {
    if (newTeams.hasOwnProperty(parentDivision)) {
      const teamsByDivision = newTeams[parentDivision];
      const sortedTeamsByDivision = teamsByDivision.slice().sort(); // You can define the comparing function here.

      for (let i = 0; i < sortedTeamsByDivision.length; i++) {
        if (
          i < sortedTeamsByDivision.length - 1 &&
          sortedTeamsByDivision[i + 1].team_name ===
            sortedTeamsByDivision[i].team_name
        ) {
          errTeams.add(sortedTeamsByDivision[i].index);
          errTeams.add(sortedTeamsByDivision[i + 1].index);
        } else {
          const divisionId = allDivisions.find(
            (el: any) => el.long_name === parentDivision
          )?.division_id;
          if (divisionId) {
            promisesNewTeams.push(
              api.get(`/teams?division_id=${divisionId}`).then(allTeams => {
                const dupTeam = allTeams.find(
                  (el: any) =>
                    el.long_name === sortedTeamsByDivision[i].team_name
                );
                if (dupTeam) {
                  errTeams.add(sortedTeamsByDivision[i].index);
                }
              })
            );
          }
        }
      }
    }
  }

  await Promise.all(promisesNewTeams);

  if (errDivisions.length !== 0) {
    cb({
      type: 'error',
      data: errDivisions.map(el => ({
        index: el,
        msg: 'Division Name is required to fill',
      })),
    });
  } else if (errTeams.size !== 0) {
    cb({
      type: 'error',
      data: [...errTeams].map(el => ({
        index: el,
        msg: 'The team must have a unique name',
      })),
    });
  } else {
    try {
      // add new divisions
      const promisesNewDivisions = [];

      for (let i = 0; i < newDivisions.size; i++) {
        const divisionName: any = [...newDivisions][i];
        const dupDivision = allDivisions.find(
          (el: any) => el.long_name === divisionName
        );
        const divisionId = getVarcharEight();

        if (!dupDivision) {
          const newHex =
            '#' +
            ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');

          promisesNewDivisions.push(
            api.post('/divisions', {
              division_hex: newHex,
              division_id: divisionId,
              long_name: divisionName,
              short_name: divisionName,
              event_id,
            })
          );
          newDivisionList[divisionName] = divisionId;
        } else {
          newDivisionList[dupDivision.long_name] = dupDivision.division_id;
        }
      }

      await Promise.all(promisesNewDivisions);

      // add new pools
      const promisesNewPools = [];

      for (const parentDivision in newPools) {
        if (newPools.hasOwnProperty(parentDivision)) {
          const divisionId = newDivisionList[parentDivision];
          const allPools = await api.get(`/pools?division_id=${divisionId}`);

          for (let i = 0; i < newPools[parentDivision].size; i++) {
            const poolName = [...newPools[parentDivision]][i];
            const dupPool = allPools.find(
              (el: any) => el.pool_name === poolName
            );
            const poolId = getVarcharEight();

            if (!dupPool) {
              promisesNewPools.push(
                api.post('/pools', {
                  division_id: newDivisionList[parentDivision],
                  pool_id: poolId,
                  pool_name: poolName,
                })
              );
              newPoolList[poolName] = poolId;
            } else {
              newPoolList[dupPool.pool_name] = dupPool.pool_id;
            }
          }
        }
      }

      await Promise.all(promisesNewPools);

      // add new teams
      const promisesAddTeams = [];

      for (const parentDivision in newTeams) {
        if (newTeams.hasOwnProperty(parentDivision)) {
          for (const newTeam of newTeams[parentDivision]) {
            promisesAddTeams.push(
              api.post('/teams', {
                event_id,
                contact_email: newTeam.coach_email || undefined,
                contact_first_name: newTeam.coach_first_name || undefined,
                contact_last_name: newTeam.coach_last_name || undefined,
                phone_num: newTeam.coach_phone,
                division_id: newDivisionList[parentDivision],
                pool_id: newPoolList[newTeam.pool_name],
                city: newTeam.team_city || undefined,
                team_id: newTeam.team_id,
                long_name: newTeam.team_name,
                short_name: newTeam.team_name,
                state: newTeam.team_state || undefined,
              })
            );
          }
        }
      }

      await Promise.all(promisesAddTeams);
      cb();
      Toasts.successToast('Data successfully imported');
    } catch {
      Toasts.errorToast("Couldn't import data");
    }
  }
};

export const createReporterFromCSV = async (scorers: any[], event: Partial<IEventDetails>, cb: (param?: object) => void) => {
  // console.log('scorers in csv file=>', scorers);
  let currentReporters: IReporter[] = [];
  let comingReporters: any[] = [];
  let report_id = 0;
  try {
    currentReporters = await api.get(`/sms_authorized_scorers?event_id=${event.event_id}`);
    console.log('currentReporters=>', currentReporters);
    
    const currentReportersKeys = currentReporters.map(
      (reporter) =>
        `${reporter.mobile}_${reporter.first_name}_${reporter.last_name}`
    );

    // const comingReporterKeys = scorers.map(
    //   (reporter) =>
    //     `${reporter.Mobile}_${reporter.First}_${reporter.Last}`
    // );

    let isAlreadyExisted = false;
    const duplicatedRows: string[] = [];

    scorers.forEach((comingReporter, index) => {
      const key =`${comingReporter.Mobile}_${comingReporter.First}_${comingReporter.Last}`
      if (currentReportersKeys.includes(key)) {
        isAlreadyExisted = true;
        duplicatedRows.push(`${index + 1}th`);
      } else {
        comingReporters.push(comingReporter)
      }

    });     

    if (isAlreadyExisted) {
      if (duplicatedRows.length > 1) {
        throw {
          message: `${duplicatedRows.join(", ")} rows are already existed.`,
        };
      } else if (duplicatedRows.length === 1) {
        throw {
          message: `${duplicatedRows.join(", ")} row is already existed.`,
        };
      }
    }

    if (duplicatedRows.length !== 0) {
      cb({ type: "error", data: duplicatedRows });
      // return;
    }     

    currentReporters.forEach((reporter) => {
      if (Number(reporter.sms_scorer_id) > report_id) report_id = Number(reporter.sms_scorer_id);
    })

  } catch (error) {
    Toasts.errorToast(error.message);
  }  
  try {
    const dupList = [];
    try {
        await Yup.array()
          .of(reporterSchemaCsv)
          .unique(
            (comingReporter) => `${comingReporter.Mobile}_${comingReporter.First}_${comingReporter.Last}`,
            "Within a Reporters, First + Last + Mobile  must be unique."
          )
          .validate(comingReporters);
      } catch (err) {
        const invalidReporter = err.value[err.value.length - 1];
        const index = comingReporters.findIndex(
          (reporter) => (
            reporter.First === invalidReporter.First &&
            reporter.Last === invalidReporter.Last &&
            reporter.Mobile === invalidReporter.Mobile
          )
        );

        dupList.push({
          index,
          msg: err.message,
        });
      }
    // await Yup.array().of(reporterSchemaCsv).validate(comingReporters);
    if (dupList.length !== 0) {
      cb({ type: "error", data: dupList });
      // return;
    }

    const addedReporters: IReporter[] = [];

    let progress = 0;
    for await (const reporter of comingReporters) {  
      report_id += 1;
      // post player data
      
      const newData = {
        // sms_scorer_id: report_id.toString(),
        event_id: event.event_id,
        first_name: reporter.First,
        last_name: reporter.Last,
        mobile: reporter.Mobile,
        is_active_YN: 1,
      };
      addedReporters.push(newData as IReporter);
      const response = await api.post(
        `/sms_authorized_scorers?event_id=${event.event_id}`,
        newData
      )
      // const response = await api.put(
      //   `/sms_authorized_scorers?event_id=${event.event_id}&sms_scorer_id=${newData.sms_scorer_id}`,
      //   newData
      // );
      if (response?.errorType === "Error" || response?.message === false) {
        return Toasts.errorToast("Couldn't create a player");
      }

      progress += 1;

      cb({
        type: "progress",
        data: [
          {
            status: "Importing New Data...",
            msg: `${progress / comingReporters.length}`,
          },
        ],
      });
    }
    cb({
        type: "info",
        data: [
          {
            index: 0,
            msg: `Import Summary; Of the ${comingReporters.length} reporters you imported, ${addedReporters.length} rows mapped to existing sms-scorers.`,
          },
        ],
      });

    // console.log('new addedReporters =>',addedReporters )

    const successMsg = `(${addedReporters.length}) scorers were successfully imported.`;
    Toasts.successToast(successMsg);
    return addedReporters;
    
  } catch (error) {
    Toasts.errorToast(error.message);
    return []
  }  
};
