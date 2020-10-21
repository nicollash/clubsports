import {
  ADD_BACKUP_PLAN_SUCCESS,
  BACKUP_PLANS_FETCH_SUCCESS,
  DELETE_BACKUP_PLAN,
  EVENTS_FETCH_SUCCESS,
  FACILITIES_FETCH_SUCCESS,
  FIELDS_FETCH_SUCCESS,
  LOAD_TIMESLOTS_FAILURE,
  LOAD_TIMESLOTS_START,
  LOAD_TIMESLOTS_SUCCESS,
  TOGGLE_BACK_UP_STATUS_FAILURE,
  TOGGLE_BACK_UP_STATUS_SECCESS,
  UPDATE_BACKUP_PLAN,
} from "./actionTypes";
import { ActionCreator, Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import api from "api/api";
import { Toasts } from "components/common";
import {
  IEventDetails,
  IFacility,
  IFetchedBracket,
  IField,
  ISchedule,
  ISchedulesGame,
} from "common/models";
import { IBackupPlan } from "common/models/backup_plan";
import {
  dateToShortString,
  getTimeSlotsFromEntities,
  getVarcharEight,
  sortByField,
} from "helpers";
import {
  checkNewTimeSlots,
  getMapNewTimeSlots,
  stringifyBackupPlan,
} from "../helper";
import {
  BackUpActiveStatuses,
  BracketStatuses,
  ScheduleStatuses,
  SortByFilesTypes,
  TimeSlotsEntityTypes,
} from "common/enums";
import { IAppState } from "reducers/root-reducer.types";
import { IChangedTimeSlot, OptionsEnum } from "../common";
import { IPlayoffGame } from "common/models/playoffs/bracket-game";

export const eventsFetchSuccess = (payload: {
  events: IEventDetails[];
  schedules: ISchedule[];
}): {
  type: string;
  payload: {
    events: IEventDetails[];
    schedules: ISchedule[];
  };
} => ({
  type: EVENTS_FETCH_SUCCESS,
  payload,
});

export const facilitiesFetchSuccess = (
  payload: IFacility[]
): { type: string; payload: IFacility[] } => ({
  type: FACILITIES_FETCH_SUCCESS,
  payload,
});

export const fieldsFetchSuccess = (
  payload: IField[]
): { type: string; payload: IField[] } => ({
  type: FIELDS_FETCH_SUCCESS,
  payload,
});

export const backupPlansFetchSuccess = (
  payload: IBackupPlan[]
): { type: string; payload: IBackupPlan[] } => ({
  type: BACKUP_PLANS_FETCH_SUCCESS,
  payload,
});

export const addBackupPlanSuccess = (
  payload: IBackupPlan
): { type: string; payload: IBackupPlan } => ({
  type: ADD_BACKUP_PLAN_SUCCESS,
  payload,
});

export const deleteBackupPlanSuccess = (
  payload: string
): { type: string; payload: string } => ({
  type: DELETE_BACKUP_PLAN,
  payload,
});

export const updateBackupPlanSuccess = (
  payload: Partial<IBackupPlan>
): { type: string; payload: Partial<IBackupPlan> } => ({
  type: UPDATE_BACKUP_PLAN,
  payload,
});

export const getEvents: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = () => async (dispatch: Dispatch) => {
  const events = await api.get("/events");
  const schedules = await api.get("/schedules");

  if (!events || !schedules) {
    return Toasts.errorToast("Couldn't load tournaments");
  }

  const publishedSchedules = schedules.filter(
    (schedule: ISchedule) =>
      schedule.is_published_YN === ScheduleStatuses.Published
  );

  const allowdEvents = events.filter((event: IEventDetails) => {
    return publishedSchedules.some(
      (schedule: ISchedule) => schedule.event_id === event.event_id
    );
  });

  dispatch(
    eventsFetchSuccess({
      events: allowdEvents,
      schedules: publishedSchedules,
    })
  );
};

export const getFacilities: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = () => async (dispatch: Dispatch) => {
  const facilities = await api.get("/facilities");
  if (!facilities) {
    return Toasts.errorToast("Couldn't load facilities");
  }
  dispatch(facilitiesFetchSuccess(facilities));
};

export const getFields: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = () => async (dispatch: Dispatch) => {
  const fields = await api.get("/fields");
  if (!fields) {
    return Toasts.errorToast("Couldn't load fields");
  }
  dispatch(fieldsFetchSuccess(fields));
};

export const getBackupPlans: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = () => async (dispatch: Dispatch) => {
  const backupPlans = await api.get("/backup_plans");
  if (!backupPlans) {
    return Toasts.errorToast("Couldn't load backup plans");
  }

  const sortedBackup = sortByField(
    backupPlans,
    SortByFilesTypes.BACKUP_PLAN
  ) as IBackupPlan[];

  dispatch(backupPlansFetchSuccess(sortedBackup));
};

export const saveBackupPlans: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (backupPlans: IBackupPlan[]) => async (dispatch: Dispatch) => {
  for await (const backupPlan of backupPlans) {
    if (
      (backupPlan.backup_type === OptionsEnum["Cancel Games"] &&
        !backupPlan.event_date_impacted) ||
      (backupPlan.backup_type ===
        OptionsEnum["Weather Interruption: Modify Game Timeslots"] &&
        !checkNewTimeSlots(backupPlan.change_value)) ||
      !backupPlan.backup_name ||
      !backupPlan.event_id ||
      !backupPlan.facilities_impacted?.length ||
      !backupPlan.fields_impacted?.length ||
      !backupPlan.timeslots_impacted?.length
    ) {
      return Toasts.errorToast(
        "All fields are required and filled in the correct format."
      );
    }

    const stringifiedBackupPlan = stringifyBackupPlan(backupPlan);
    const data = {
      ...stringifiedBackupPlan,
      backup_plan_id: getVarcharEight(),
    };
    const response = await api.post(`/backup_plans`, data);

    if (response?.errorType === "Error") {
      return Toasts.errorToast("Couldn't add a division");
    }
    dispatch(addBackupPlanSuccess(data));
  }

  Toasts.successToast("Backup Plan is successfully added");
};

export const deleteBackupPlan: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (id: string) => async (dispatch: Dispatch) => {
  const backupPlan = await api.delete(`/backup_plans?backup_plan_id=${id}`);
  if (!backupPlan) {
    return Toasts.errorToast("Couldn't delete a backup plans");
  }
  dispatch(deleteBackupPlanSuccess(id));
  Toasts.successToast("Backup Plan is successfully deleted");
};

export const updateBackupPlan: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (backupPlan: IBackupPlan) => async (dispatch: Dispatch) => {
  if (
    (backupPlan.backup_type === OptionsEnum["Cancel Games"] &&
      !backupPlan.event_date_impacted) ||
    (backupPlan.backup_type ===
      OptionsEnum["Weather Interruption: Modify Game Timeslots"] &&
      !checkNewTimeSlots(backupPlan.change_value)) ||
    !backupPlan.backup_name ||
    !backupPlan.event_id ||
    !backupPlan.facilities_impacted?.length ||
    !backupPlan.fields_impacted?.length ||
    !backupPlan.timeslots_impacted?.length
  ) {
    return Toasts.errorToast(
      "All fields are required and filled in the correct format."
    );
  }

  const data = stringifyBackupPlan(backupPlan);

  const response = await api.put(
    `/backup_plans?backup_plan_id=${data.backup_plan_id}`,
    data
  );
  if (!response) {
    return Toasts.errorToast("Couldn't update a backup plans");
  }
  dispatch(updateBackupPlanSuccess(data));
  Toasts.successToast("Backup Plan is successfully updated");
};

export const loadTimeSlots = (eventId: string) => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  try {
    const { complexities } = getState();

    const currentSchedule = complexities.schedules.find(
      (it: ISchedule) => it.event_id === eventId
    );

    if (!currentSchedule) {
      throw new Error("Could not load time slots!");
    }

    dispatch({
      type: LOAD_TIMESLOTS_START,
      payload: {
        eventId,
      },
    });

    const scheduleGames = (await api.get(
      `/games?schedule_id=${currentSchedule.schedule_id}`
    )) as ISchedulesGame[];

    const timeSlots = getTimeSlotsFromEntities(
      scheduleGames,
      TimeSlotsEntityTypes.SCHEDULE_GAMES
    );

    const eventDays = Array.from(
      new Set(scheduleGames.map((it) => it.game_date))
    );

    dispatch({
      type: LOAD_TIMESLOTS_SUCCESS,
      payload: {
        eventId,
        eventDays,
        eventTimeSlots: timeSlots,
      },
    });
  } catch (err) {
    dispatch({
      type: LOAD_TIMESLOTS_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

export const cancelGames = (
  backUp: IBackupPlan,
  status: BackUpActiveStatuses
) => async (dispatch: Dispatch, getState: () => IAppState) => {
  try {
    const { complexities } = getState();

    const currentSchedule = complexities.schedules.find(
      (it: ISchedule) => it.event_id === backUp.event_id
    );

    if (!currentSchedule) {
      throw new Error("Could not change back up status!");
    }

    const scheduleGames = (await api.get(
      `/games?schedule_id=${currentSchedule.schedule_id}`
    )) as ISchedulesGame[];

    const brackets = await api.get(
      `/brackets?event_id=${currentSchedule.event_id}`
    );

    const publishedBraket = brackets.find(
      (it: IFetchedBracket) => it.is_published_YN === BracketStatuses.Published
    );

    const bracketGames = publishedBraket
      ? ((await api.get(
          `/v_brackets_details?bracket_id=${publishedBraket.bracket_id}`
        )) as IPlayoffGame[])
      : [];

    const { fields_impacted, timeslots_impacted, event_date_impacted } = backUp;

    const parsedFields = JSON.parse(fields_impacted) as string[];
    const parsedTimeSlots = JSON.parse(timeslots_impacted) as string[];

    const updatedGames = scheduleGames.reduce((acc, game: ISchedulesGame) => {
      const willChange =
        dateToShortString(game.game_date) ===
          dateToShortString(event_date_impacted) &&
        game.game_time &&
        parsedFields.includes(game.field_id) &&
        parsedTimeSlots.includes(game.game_time);

      return willChange ? [...acc, { ...game, is_cancelled_YN: status }] : acc;
    }, [] as ISchedulesGame[]);

    const updatedBrackets = bracketGames.reduce(
      (acc: IPlayoffGame[], game: IPlayoffGame) => {
        const willChange =
          dateToShortString(game.game_date.toString()) ===
            dateToShortString(event_date_impacted) &&
          game.start_time &&
          game.field_id &&
          parsedFields.includes(game.field_id) &&
          parsedTimeSlots.includes(game.start_time);

        return willChange
          ? [...acc, { ...game, is_cancelled_YN: status }]
          : acc;
      },
      [] as IPlayoffGame[]
    );

    if (updatedGames.length !== 0) {
      await api.put(`/games`, updatedGames);
    }

    if (updatedBrackets.length !== 0) {
      await api.put(`/brackets_details`, updatedBrackets);
    }

    dispatch({
      type: TOGGLE_BACK_UP_STATUS_SECCESS,
      payload: {
        backUp,
      },
    });

    Toasts.successToast("Changes successfully saved");
  } catch (err) {
    dispatch({
      type: TOGGLE_BACK_UP_STATUS_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

export const modifyGameTimeSlots = (backUp: IBackupPlan) => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  try {
    const { complexities } = getState();

    const currentSchedule = complexities.schedules.find(
      (it: ISchedule) => it.event_id === backUp.event_id
    );

    if (!currentSchedule) {
      throw new Error("Could not change back up status!");
    }

    const scheduleGames = (await api.get(
      `/games?schedule_id=${currentSchedule.schedule_id}`
    )) as ISchedulesGame[];

    const brackets = await api.get(
      `/brackets?event_id=${currentSchedule.event_id}`
    );

    const publishedBraket = brackets.find(
      (it: IFetchedBracket) => it.is_published_YN === BracketStatuses.Published
    );

    const bracketGames = publishedBraket
      ? ((await api.get(
          `/v_brackets_details?bracket_id=${publishedBraket.bracket_id}`
        )) as IPlayoffGame[])
      : [];

    const { fields_impacted, change_value } = backUp;

    const parsedFields = JSON.parse(fields_impacted) as string[];
    const parsedChangeValue = JSON.parse(change_value) as IChangedTimeSlot[];

    const mappedNewTimeSlots = getMapNewTimeSlots(parsedChangeValue);
    const oldTimeSlots = Object.keys(mappedNewTimeSlots);

    const updatedGames = scheduleGames.reduce(
      (acc: ISchedulesGame[], game: ISchedulesGame) => {
        const willChange =
          game.game_time &&
          oldTimeSlots.includes(game.game_time) &&
          parsedFields.includes(game.field_id);

        if (willChange) {
          const updatedGame = {
            ...game,
            start_time: mappedNewTimeSlots[game.game_time as string],
          };

          return [...acc, updatedGame];
        } else {
          return acc;
        }
      },
      [] as ISchedulesGame[]
    );

    const updatedBrackets = bracketGames.reduce(
      (acc: IPlayoffGame[], game: IPlayoffGame) => {
        const willChange =
          game.start_time &&
          game.field_id &&
          oldTimeSlots.includes(game.start_time) &&
          parsedFields.includes(game.field_id);

        if (willChange) {
          const updatedGame = {
            ...game,
            start_time: mappedNewTimeSlots[game.start_time as string],
          };

          return [...acc, updatedGame];
        } else {
          return acc;
        }
      },
      [] as IPlayoffGame[]
    );

    if (updatedGames.length !== 0) {
      await api.put(`/games`, updatedGames);
    }

    if (updatedBrackets.length !== 0) {
      await api.put(`/brackets_details`, updatedBrackets);
    }

    dispatch({
      type: TOGGLE_BACK_UP_STATUS_SECCESS,
      payload: {
        backUp,
      },
    });

    Toasts.successToast("Changes successfully saved");
  } catch (err) {
    dispatch({
      type: TOGGLE_BACK_UP_STATUS_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

export const toggleBackUpStatus = (
  backUp: IBackupPlan,
  status: BackUpActiveStatuses
) => async (dispatch: Dispatch) => {
  switch (backUp.backup_type) {
    case OptionsEnum["Cancel Games"]: {
      dispatch<any>(cancelGames(backUp, status));
      break;
    }
    case OptionsEnum["Weather Interruption: Modify Game Timeslots"]: {
      dispatch<any>(modifyGameTimeSlots(backUp));
      break;
    }
  }
};
