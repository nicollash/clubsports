import { Dispatch } from "redux";
import { Auth } from "aws-amplify";
import { union, orderBy } from "lodash-es";
import * as Yup from "yup";
import api from "api/api";
import { ISchedule, IConfigurableSchedule } from "common/models/schedule";
import { Toasts } from "components/common";
import {
  SCHEDULE_FETCH_IN_PROGRESS,
  SCHEDULE_FETCH_SUCCESS,
  SCHEDULE_FETCH_FAILURE,
  CREATE_NEW_SCHEDULE_SUCCESS,
  CREATE_NEW_SCHEDULE_FAILURE,
  ADD_NEW_SCHEDULE,
  CHANGE_SCHEDULE,
  UPDATE_SCHEDULE_SUCCESS,
  UPDATE_SCHEDULE_FAILURE,
  DELETE_SCHEDULE_SUCCESS,
  DELETE_SCHEDULE_FAILURE,
  ADD_NEW_BRACKET,
  FETCH_EVENT_BRACKETS,
  FETCH_BRACKETS_SUCCESS,
  UPDATE_EXISTING_BRACKET,
  CHECK_SAME_COACH_RESULT,
} from "./actionTypes";
import { EMPTY_SCHEDULE } from "./constants";
import { scheduleSchema, updatedScheduleSchema } from "validations";
import { IAppState } from "reducers/root-reducer.types";
import History from "browserhistory";
import {
  IMember,
  IEventDetails,
  IField,
  ITeam,
  IDivision,
  IFacility,
  ISchedulesDetails,
} from "common/models";
import {
  getVarcharEight,
  getTimeValuesFromEventSchedule,
  calculateTimeSlots,
  calculateTournamentDays,
} from "helpers";
import { gameStartOnOptions, ISchedulingSchedule } from "../types";
import {
  mapFieldsData,
  mapTeamsData,
} from "components/schedules/mapTournamentData";
import {
  sortFieldsByPremier,
  defineGames,
  settleTeamsPerGamesDays,
} from "components/common/matrix-table/helper";
import {
  mapTeamsFromSchedulesDetails,
  mapSchedulesTeamCards,
} from "components/schedules/mapScheduleData";
import { errorToast, successToast } from "components/common/toastr/showToasts";
import { ICreateBracketModalOutput } from "../create-new-bracket";
import {
  mapFetchedBracket,
  mapBracketData,
} from "components/playoffs/mapBracketsData";
import {
  IBracket,
  ISchedulingBracket,
  IFetchedBracket,
} from "common/models/playoffs/bracket";
import {
  BracketStatuses,
  ScheduleStatuses,
  TimeSlotsEntityTypes,
} from "common/enums";
import { IPlayoffGame } from "common/models/playoffs/bracket-game";
import moment from "moment";

type GetState = () => IAppState;

interface TournamentInfo {
  event: IEventDetails;
  fields: IField[];
  teams: ITeam[];
  divisions: IDivision[];
  facilities: IFacility[];
}

const scheduleFetchInProgress = () => ({
  type: SCHEDULE_FETCH_IN_PROGRESS,
});

const scheduleFetchSuccess = (schedules: ISchedulingSchedule) => ({
  type: SCHEDULE_FETCH_SUCCESS,
  payload: {
    schedules,
  },
});

const scheduleFetchFailure = () => ({
  type: SCHEDULE_FETCH_FAILURE,
});

const fetchEventBrackets = (payload: ISchedulingBracket[]) => ({
  type: FETCH_EVENT_BRACKETS,
  payload,
});

const fetchBracketsSuccess = (payload: IFetchedBracket[]) => ({
  type: FETCH_BRACKETS_SUCCESS,
  payload,
});

export const addNewBracket = (payload: ICreateBracketModalOutput) => ({
  type: ADD_NEW_BRACKET,
  payload,
});

export const updateExistingBracket = (payload: Partial<IBracket>) => ({
  type: UPDATE_EXISTING_BRACKET,
  payload,
});

export const addNewSchedule = () => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  const { tournamentData } = getState().pageEvent;
  const currentSession = await Auth.currentSession();
  const userEmail = currentSession.getIdToken().payload.email;
  const members = await api.get(`/members?email_address=${userEmail}`);
  const member: IMember = members?.find(
    (it: IMember) => it.email_address === userEmail
  );
  const DEFAULT_INCREMENT_MAX_NUM_GAMES = 2;
  const DEFAULT_PERIODS_PER_GAME = 2;
  const DEFAULT_PRE_GAME_WARMUP = "5";
  const DEFAULT_PERIOD_DURATION = "10";
  const DEFAULT_TIME_BETWEEN_PERIODS = "5";
  const DEFAULT_MIN_NUMBER_OF_GAMES = 1;

  const newSchedule = {
    ...EMPTY_SCHEDULE,
    schedule_id: getVarcharEight(),
    event_id: tournamentData.event?.event_id,
    member_id: member.member_id,
    num_divisions: tournamentData.divisions.length,
    num_teams: tournamentData.teams.length,
    num_fields: tournamentData.fields.length,
    min_num_games:
      Number(tournamentData.event?.min_num_of_games) ||
      DEFAULT_MIN_NUMBER_OF_GAMES,
    max_num_games:
      (Number(tournamentData.event?.min_num_of_games) ||
        DEFAULT_MIN_NUMBER_OF_GAMES) + DEFAULT_INCREMENT_MAX_NUM_GAMES,
    periods_per_game:
      tournamentData.event?.periods_per_game || DEFAULT_PERIODS_PER_GAME,
    pre_game_warmup:
      tournamentData.event?.pre_game_warmup || DEFAULT_PRE_GAME_WARMUP,
    period_duration:
      tournamentData.event?.period_duration || DEFAULT_PERIOD_DURATION,
    time_btwn_periods:
      tournamentData.event?.time_btwn_periods || DEFAULT_TIME_BETWEEN_PERIODS,
    first_game_time: tournamentData.event?.first_game_time,
    last_game_end_time: tournamentData.event?.last_game_end,
    games_start_on: gameStartOnOptions[0],
  };

  dispatch({
    type: ADD_NEW_SCHEDULE,
    payload: {
      newSchedule,
    },
  });
};

export const changeSchedule = (key: Partial<ISchedule>) => ({
  type: CHANGE_SCHEDULE,
  payload: {
    scheduleKey: key,
  },
});

export const getScheduling = (eventId: string) => async (
  dispatch: Dispatch
) => {
  dispatch(scheduleFetchInProgress());

  const members = await api.get(`/members`);
  const schedules = await api.get(`/schedules?event_id=${eventId}`);
  const mappedSchedules = schedules.map((schedule: ISchedule) => {
    const createdBy = members?.find((member: IMember) => {
      return member.member_id === schedule.created_by;
    });
    const updatedBy = members?.find((member: IMember) => {
      return member.member_id === schedule.updated_by;
    });

    return {
      ...schedule,
      createdByName: createdBy
        ? `${createdBy.first_name} ${createdBy.last_name}`
        : null,
      updatedByName: updatedBy
        ? `${updatedBy.first_name} ${updatedBy.last_name}`
        : null,
    };
  });

  if (!schedules?.error) {
    dispatch(scheduleFetchSuccess(mappedSchedules));

    return;
  }

  dispatch(scheduleFetchFailure());
};

export const createNewSchedule = (schedule: IConfigurableSchedule) => async (
  dispatch: Dispatch,
  getState: GetState
) => {
  try {
    const { event } = getState().pageEvent.tournamentData;

    const allSchedules = await api.get(
      `/schedules?event_id=${schedule.event_id}`
    );

    await Yup.array()
      .of(scheduleSchema)
      .unique(
        (schedule) => schedule.schedule_name,
        "Oops. It looks like you already have schedule with the same name. The schedule must have a unique name."
      )
      .validate([...allSchedules, schedule]);

    const updatedSchedule = {
      ...schedule,
      first_game_time: event?.first_game_time,
      last_game_end_time: event?.last_game_end,
    };

    dispatch({
      type: CREATE_NEW_SCHEDULE_SUCCESS,
      payload: {
        schedule: updatedSchedule,
      },
    });

    History.push(`/schedules/${schedule.event_id}`);
  } catch (err) {
    Toasts.errorToast(err.message);

    dispatch({
      type: CREATE_NEW_SCHEDULE_FAILURE,
    });
  }
};

export const updateSchedule = (schedule: ISchedulingSchedule) => async (
  dispatch: Dispatch
) => {
  try {
    const copiedSchedule = { ...schedule };
    delete copiedSchedule.createdByName;
    delete copiedSchedule.updatedByName;

    const allSchedules = await api.get(
      `/schedules?event_id=${schedule.event_id}`
    );

    await Yup.array()
      .of(updatedScheduleSchema)
      .unique(
        (schedule) => schedule.schedule_name,
        "Oops. It looks like you already have schedule with the same name. The schedule must have a unique name."
      )
      .validate([...allSchedules, copiedSchedule]);

    await api.put(
      `/schedules?schedule_id=${copiedSchedule.schedule_id}`,
      copiedSchedule
    );

    dispatch({
      type: UPDATE_SCHEDULE_SUCCESS,
      payload: {
        schedule,
      },
    });

    Toasts.successToast("Changes successfully saved.");
  } catch (err) {
    Toasts.errorToast(err.message);

    dispatch({
      type: UPDATE_SCHEDULE_FAILURE,
    });
  }
};

export const deleteSchedule = (schedule: ISchedulingSchedule) => async (
  dispatch: Dispatch
) => {
  try {
    const brackets = await api.get(
      `/brackets?schedule_id=${schedule.schedule_id}`
    );

    await api.delete("/brackets", brackets);

    await api.delete(`/schedules?schedule_id=${schedule.schedule_id}`);

    dispatch({
      type: DELETE_SCHEDULE_SUCCESS,
      payload: {
        schedule,
      },
    });

    Toasts.successToast(
      `"${schedule.schedule_name}" schedule has been deleted.`
    );
  } catch {
    dispatch({
      type: DELETE_SCHEDULE_FAILURE,
    });
  }
};

const showError = (errorMessage?: string) => {
  errorToast(errorMessage || "Something happened during the saving process");
};

const getSchedulesData = async (
  schedule: ISchedule,
  tournamentInfo: TournamentInfo
) => {
  const { event, fields, teams, divisions, facilities } = tournamentInfo;

  const loadedSchedulesDetails = (await api.get("/schedules_details", {
    schedule_id: schedule.schedule_id,
  })) as ISchedulesDetails[];

  const timeValues = getTimeValuesFromEventSchedule(event, schedule);
  const timeSlots = calculateTimeSlots(
    timeValues,
    loadedSchedulesDetails,
    TimeSlotsEntityTypes.SCHEDULE_DETAILS
  );

  const mappedFields = mapFieldsData(fields, facilities);
  const sortedFields = sortFieldsByPremier(mappedFields);

  const { games } = defineGames(sortedFields, timeSlots!);

  const mappedTeams = mapTeamsData(teams, divisions);
  const tableTeams = mapTeamsFromSchedulesDetails(
    loadedSchedulesDetails,
    mappedTeams
  );
  return { games, tableTeams, schedulesDetails: loadedSchedulesDetails };
};

export const getSchedulesDetails = async (
  schedule: ISchedule,
  isDraft: boolean,
  tournamentInfo: TournamentInfo
) => {
  const { games, tableTeams, schedulesDetails } = await getSchedulesData(
    schedule,
    tournamentInfo
  );
  const { event } = tournamentInfo;
  const tournamentDays = calculateTournamentDays(event);

  let schedulesTableGames = [];
  for (const day of tournamentDays) {
    schedulesTableGames.push(settleTeamsPerGamesDays(games, tableTeams, day));
  }
  schedulesTableGames = schedulesTableGames.flat();

  return mapSchedulesTeamCards(
    schedule,
    schedulesTableGames,
    isDraft,
    schedulesDetails
  );
};

export const updateScheduleStatus = (
  scheduleId: string,
  isDraft: boolean
) => async (dispatch: Dispatch, getState: GetState) => {
  const { pageEvent } = getState();
  const { tournamentData } = pageEvent;
  const {
    event,
    fields,
    teams,
    divisions,
    facilities,
    schedules,
  } = tournamentData;

  const schedule = schedules.find(
    (schedule) => schedule.schedule_id === scheduleId
  );

  if (!event || !fields || !teams || !divisions || !schedule || !facilities)
    return showError();

  /* PUT Schedule */
  const updatedSchedule: ISchedule = {
    ...schedule,
    is_published_YN: isDraft
      ? ScheduleStatuses.Draft
      : ScheduleStatuses.Published,
    last_web_publish: isDraft
      ? schedule.last_web_publish
      : new Date().toISOString(),
  };

  /* Put SchedulesDetails and POST/PUT SchedulesGames */
  const schedulesResp = await api.put("/schedules", updatedSchedule);

  if (!schedulesResp) return showError();

  if (schedulesResp) {
    dispatch<any>(getScheduling(event.event_id));
    dispatch<any>(addNewSchedule());
    const name = isDraft ? "unpublished" : "published";
    successToast(`Schedules was successfully ${name}`);
  } else {
    showError();
  }
};

export const publishSchedule = (scheduleId: string) => (dispatch: Dispatch) => {
  dispatch<any>(updateScheduleStatus(scheduleId, false));
};

export const unpublishSchedule = (scheduleId: string) => (
  dispatch: Dispatch
) => {
  dispatch<any>(updateScheduleStatus(scheduleId, true));
};

/* BRACKETS SECTION */

const mapToSchedulingBracket = (
  item: IBracket,
  members: IMember[]
): ISchedulingBracket => {
  const createdBy = members?.find(
    (member: IMember) => member.member_id === item.createdBy
  );
  const updatedBy = members?.find(
    (member: IMember) => member.member_id === item.updatedBy
  );

  const createdByName = createdBy
    ? `${createdBy.first_name} ${createdBy.last_name}`
    : null;
  const updatedByName = updatedBy
    ? `${updatedBy.first_name} ${updatedBy.last_name}`
    : null;

  return {
    ...item,
    createdByName,
    updatedByName,
  };
};

export const createNewBracket = (bracketData: ICreateBracketModalOutput) => (
  dispatch: Dispatch
) => {
  dispatch(addNewBracket(bracketData));
};

export const getEventBrackets = () => async (
  dispatch: Dispatch,
  getState: GetState
) => {
  const { event_id } = getState().pageEvent.tournamentData.event || {};
  const members = await api.get(`/members`);
  const response = await api.get("/brackets", { event_id });

  if (response?.length) {
    dispatch(fetchBracketsSuccess(response));

    const mappedBrackets = response.map(mapFetchedBracket);
    const mappedBrackets2 = mappedBrackets.map((item: IBracket) =>
      mapToSchedulingBracket(item, members)
    );

    dispatch(fetchEventBrackets(mappedBrackets2));
  }
};

export const updateBracket = (bracket: ISchedulingBracket) => async (
  dispatch: Dispatch,
  getState: GetState
) => {
  const members = await api.get(`/members`);
  const mappedBracket = await mapBracketData(bracket, !bracket.published);
  const response = await api.put("/brackets", mappedBracket);

  const brackets = getState().scheduling.brackets;

  if (response) {
    const updatedBracket = await mapFetchedBracket(mappedBracket);
    const updatedBrackets = brackets?.map((item) =>
      item.id === updatedBracket.id ? updatedBracket : item
    );
    if (updatedBrackets) {
      const mappedBrackets = updatedBrackets.map((item) =>
        mapToSchedulingBracket(item, members)
      );
      const mappedFetchedBrackets = await Promise.all(
        mappedBrackets.map((it: ISchedulingBracket) =>
          mapBracketData(it, !it.published)
        )
      );

      dispatch(fetchBracketsSuccess(mappedFetchedBrackets));

      dispatch(fetchEventBrackets(mappedBrackets));
    }
    successToast("Bracket was successfully updated!");
    return;
  }

  errorToast("Couldn't update the brackets");
};

export const deleteBracket = (bracketId: string) => async (
  dispatch: Dispatch,
  getState: GetState
) => {
  const response = await api.delete("/brackets", {
    bracket_id: bracketId,
  });
  const brackets = getState().scheduling.brackets;

  if (response) {
    const updatedBrackets = brackets?.filter((item) => item.id !== bracketId)!;
    dispatch(fetchEventBrackets(updatedBrackets));
    successToast("Bracket was successfully removed!");
    return;
  }
  errorToast("Couldn't remove the bracket");
};

export const updateBracketStatus = (
  bracketId: string,
  isDraft: boolean
) => async (dispatch: Dispatch, getState: GetState) => {
  const { pageEvent } = getState();
  const { tournamentData } = pageEvent;
  const { brackets } = tournamentData;

  const bracket = brackets.find((bracket) => bracket.bracket_id === bracketId);

  const bracketGames: (
    | IPlayoffGame
    | undefined
  )[] = await api.get("/brackets_details", { bracket_id: bracketId });

  const allGamesAssigned = bracketGames.every(
    (item) => item?.field_id && item.start_time
  );

  if (!allGamesAssigned && !isDraft) {
    return showError("All bracket games should be assigned before publishing");
  }

  if (!bracket) {
    return showError("Failed to load playoff data");
  }

  /* PUT Bracket */
  const updatedBracket: IFetchedBracket = {
    ...bracket,
    is_published_YN: isDraft
      ? BracketStatuses.Draft
      : BracketStatuses.Published,
  };

  const bracketResp = await api.put("/brackets", updatedBracket);

  if (!bracketResp) {
    return showError();
  }

  dispatch<any>(getEventBrackets());

  const name = isDraft ? "unpublished" : "published";

  successToast(`Bracket was successfully ${name}`);
};

export const checkSameCoachWarning = (
  eventId: string,
  schedules: ISchedule[]
) => async (dispatch: Dispatch) => {
  try {
    if (schedules) {
      const teams: ITeam[] = await api.get(`/teams?event_id=${eventId}`);
      const sameCoachWarning: any[] = [];
      for await (const schedule of schedules) {
        if (schedule.schedule_id) {
          const schedulesDetails: ISchedulesDetails[] = await api.get(
            "schedules_details",
            {
              schedule_id: schedule.schedule_id,
            }
          );

          const totalDays = schedulesDetails
            .map((scheduleDetail) => scheduleDetail.game_date)
            .filter((date) => date !== undefined);
          const days = orderBy(union(totalDays), [], "asc");

          const totalTimeslots = schedulesDetails ? schedulesDetails
                .map((scheduleDetail) => scheduleDetail.game_time)
                .filter((time) => time !== undefined)
            : [];
          const timeSlots = orderBy(union(totalTimeslots), [], "asc");

          days.forEach((day) => {
            if (!day) return;

            timeSlots.forEach((timeSlot) => {
              if (!timeSlot) return;

              const sameTimSlotTeams: ITeam[] = [];
              schedulesDetails.forEach((scheduleDetail) => {
                if (
                  !scheduleDetail.away_team_id ||
                  !scheduleDetail.home_team_id ||
                  !scheduleDetail.game_date ||
                  !scheduleDetail.game_time
                ) {
                  return;
                }

                if (
                  new Date(scheduleDetail.game_date).getTime() ===
                    new Date(day).getTime() &&
                  timeSlot === scheduleDetail.game_time
                ) {
                  const homeTeam = teams.find(
                    (team) => team.team_id === scheduleDetail.home_team_id
                  );
                  if (
                    homeTeam &&
                    (sameTimSlotTeams.find(
                      (team) => team.team_id === homeTeam.team_id
                    ) ||
                      sameTimSlotTeams.find(
                        (team) =>
                          team.contact_first_name ===
                            homeTeam.contact_first_name &&
                          team.contact_last_name === homeTeam.contact_last_name
                      ))
                  ) {
                    const tempTitle = `Coach ${homeTeam.contact_first_name} ${
                      homeTeam.contact_last_name
                    } is coaching in > 1 games during the ${moment(day)
                      .utc()
                      .format("YYYY-MM-DD")} ${
                      scheduleDetail.game_time
                    } timeslot`;
                    if (
                      !sameCoachWarning.find(
                        (item) =>
                          item.title === tempTitle &&
                          item.schedule_id === schedule.schedule_id
                      )
                    ) {
                      sameCoachWarning.push({
                        type: "WARN",
                        schedule_id: schedule.schedule_id,
                        title: tempTitle,
                      });
                    }
                  } else if (homeTeam) {
                    sameTimSlotTeams.push(homeTeam);
                  }

                  const awayTeam = teams.find(
                    (team) => team.team_id === scheduleDetail.away_team_id
                  );
                  if (
                    awayTeam &&
                    (sameTimSlotTeams.find(
                      (team) => team.team_id === awayTeam.team_id
                    ) ||
                      sameTimSlotTeams.find(
                        (team) =>
                          team.contact_first_name ===
                            awayTeam.contact_first_name &&
                          team.contact_last_name === awayTeam.contact_last_name
                      ))
                  ) {
                    const tempTitle = `Coach ${awayTeam.contact_first_name} ${
                      awayTeam.contact_last_name
                    } is coaching in > 1 games during the ${moment(day)
                      .utc()
                      .format("YYYY-MM-DD")} ${
                      scheduleDetail.game_time
                    } timeslot`;
                    if (
                      !sameCoachWarning.find(
                        (item) =>
                          item.title === tempTitle &&
                          item.schedule_id === schedule.schedule_id
                      )
                    ) {
                      sameCoachWarning.push({
                        type: "WARN",
                        schedule_id: schedule.schedule_id,
                        title: tempTitle,
                      });
                    }
                  } else if (awayTeam) {
                    sameTimSlotTeams.push(awayTeam);
                  }
                }
              });
            });
          });
        }
      }
      dispatch(saveCheckSameCoachResult(sameCoachWarning));
    }
  } catch (err) {
    errorToast(err.message);
  }
};

export const saveCheckSameCoachResult = (payload: object) => ({
  type: CHECK_SAME_COACH_RESULT,
  payload,
});
