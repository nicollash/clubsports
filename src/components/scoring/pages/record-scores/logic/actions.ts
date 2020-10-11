import { ThunkAction } from "redux-thunk";
import { ActionCreator, Dispatch } from "redux";
import {
  RecordScoresAction,
  LOAD_SCORES_DATA_START,
  LOAD_SCORES_DATA_SUCCESS,
  LOAD_SCORES_DATA_FAILURE,
  SAVE_GAME_SUCCESS,
  SAVE_GAME_FAILURE,
  CLEAR_SCORES_DATA,
  SAVE_GAME_START,
} from "./action-types";
import Api from "api/api";

import {
  IFacility,
  IEventDetails,
  IDivision,
  ISchedulesGame,
  ISchedule,
  IChangedGame,
} from "common/models";
import { Toasts } from "components/common";
import { chunk } from "lodash-es";
import { ScheduleStatuses } from "common/enums";
import { dateToShortString } from "../../../../../helpers";
import { IPlayoffGame } from "../../../../../common/models/playoffs/bracket-game";

const clearScoresData: ActionCreator<ThunkAction<
  void,
  {},
  null,
  RecordScoresAction
>> = () => async (dispatch: Dispatch) => {
  dispatch({
    type: CLEAR_SCORES_DATA,
  });
};

const loadScoresData: ActionCreator<ThunkAction<
  void,
  {},
  null,
  RecordScoresAction
>> = (eventId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_SCORES_DATA_START,
    });

    const events = await Api.get(`/events?event_id=${eventId}`);
    const divisions = await Api.get(`/divisions?event_id=${eventId}`);
    const teams = await Api.get(`/teams?event_id=${eventId}`);
    const eventSummary = await Api.get(`/event_summary?event_id=${eventId}`);
    const schedules = await Api.get(`/schedules?event_id=${eventId}`);
    const facilities = await Api.get(`/facilities?event_id=${eventId}`);
    const fields = (
      await Promise.all(
        facilities.map((it: IFacility) =>
          Api.get(`/fields?facilities_id=${it.facilities_id}`)
        )
      )
    ).flat();

    const pools = (
      await Promise.all(
        divisions.map((it: IDivision) =>
          Api.get(`/pools?division_id=${it.division_id}`)
        )
      )
    ).flat();

    const currentEvent = events.find(
      (it: IEventDetails) => it.event_id === eventId
    );

    const activeSchedule = schedules.find(
      (it: ISchedule) => it.is_published_YN === ScheduleStatuses.Published
    );

    const schedulesGames = await Api.get(
      `/games?schedule_id=${activeSchedule.schedule_id}`
    );

    dispatch({
      type: LOAD_SCORES_DATA_SUCCESS,
      payload: {
        event: currentEvent,
        schedule: activeSchedule || null,
        facilities,
        fields,
        divisions,
        teams,
        eventSummary,
        pools,
        schedulesGames,
      },
    });
  } catch {
    dispatch({
      type: LOAD_SCORES_DATA_FAILURE,
    });
  }
};

const saveGames: ActionCreator<ThunkAction<
  void,
  {},
  null,
  RecordScoresAction
>> = (
  games: ISchedulesGame[],
  changedGameIds: IChangedGame[] | undefined
) => async (dispatch: Dispatch) => {
  dispatch({
    type: SAVE_GAME_START,
  });
  try {
    const schedulesGamesChunk = chunk(
      (changedGameIds
        ? games?.filter((game: ISchedulesGame) =>
            changedGameIds.find(
              (cg: IChangedGame) =>
                !cg.isBracketTable &&
                cg.fieldId === game.field_id &&
                cg.startTime === game.game_time &&
                dateToShortString(cg.date) === dateToShortString(game.game_date)
            )
          )
        : games
      )?.map((g: ISchedulesGame) => ({
        game_id: g.game_id,
        home_team_score: g.home_team_score,
        away_team_score: g.away_team_score,
      })),
      50
    );
    const gamesResponses = await Promise.all(
      schedulesGamesChunk.map((arr: any) => Api.put("/games", arr))
    );

    const gamesResponseSuccess = gamesResponses.every((item: any) => item);

    if (!gamesResponseSuccess) {
      throw Error("Something happened during the saving process");
    }

    dispatch({
      type: SAVE_GAME_SUCCESS,
      payload: {
        games,
      },
    });

    const successText = changedGameIds
      ? changedGameIds.length !== 0
        ? `Schedules data successfully saved and published! Number of game(s) modified = ${changedGameIds.length}.`
        : "No scores were updated."
      : "";

    Toasts.successToast(successText);
  } catch (err) {
    Toasts.successToast(err);

    dispatch({
      type: SAVE_GAME_FAILURE,
    });
  }
};

const savePlayoffs: ActionCreator<ThunkAction<
  void,
  {},
  null,
  RecordScoresAction
>> = (
  bracketGames: IPlayoffGame[],
  changedGameIds: IChangedGame[] | undefined
) => async (dispatch: Dispatch) => {
  try {
    const bracketGamesChunk = chunk(
      (changedGameIds
        ? bracketGames.filter((bg: IPlayoffGame) =>
            changedGameIds.find(
              (cg: IChangedGame) =>
                cg.isBracketTable &&
                cg.fieldId === bg.field_id &&
                cg.startTime === bg.start_time &&
                dateToShortString(cg.date) === dateToShortString(bg.game_date)
            )
          )
        : bracketGames
      )?.map((g: IPlayoffGame) => ({
        game_id: g.game_id,
        home_team_score: g.home_team_score,
        away_team_score: g.away_team_score,
      })),
      50
    );
    const gamesResponses = await Promise.all(
      bracketGamesChunk.map((arr: any) => Api.put("/brackets_details", arr))
    );

    const gamesResponseSuccess = gamesResponses.every((item: any) => item);

    if (!gamesResponseSuccess) {
      throw Error("Something happened during the saving process");
    }
  } catch (err) {
    Toasts.successToast(err);

    dispatch({
      type: SAVE_GAME_FAILURE,
    });
  }
};

export { loadScoresData, saveGames, savePlayoffs, clearScoresData };
