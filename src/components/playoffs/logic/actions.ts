import { Dispatch } from "redux";
import { IAppState } from "reducers/root-reducer.types";
import { chunk, orderBy, groupBy } from "lodash-es";
import {
  PLAYOFF_SAVED_SUCCESS,
  PLAYOFF_FETCH_GAMES,
  PLAYOFF_CLEAR_GAMES,
  PLAYOFF_UNDO_GAMES,
  PLAYOFF_UNDO_CLEAR,
  LOAD_DATA_WITH_SCORES,
  FETCH_SCORED_TEAMS,
  CLEAR_SCORED_TEAMS,
  BRACKETS_ADVANCING_IN_PROGRESS,
} from "./actionTypes";
import {
  mapBracketData,
  mapBracketGames,
  mapFetchedBracket,
  mapFetchedBracketGames,
} from "../mapBracketsData";
import { IBracketGame } from "../bracketGames";
import api from "api/api";
import { successToast, errorToast } from "components/common/toastr/showToasts";
import { addNewBracket } from "components/scheduling/logic/actions";
import { IPlayoffGame } from "common/models/playoffs/bracket-game";
import {
  getScoringSettings,
  getTeamsWithResults,
  sortTeamByScored,
  mapScheduleGamesWithNames,
} from "helpers";
import {
  ITeamWithResults,
  IFacility,
  IFetchedBracket,
  IBracket,
} from "common/models";

export type IPlayoffSortedTeams = { [key: string]: ITeamWithResults[] };

type IGetState = () => IAppState;

const playoffSavedSuccess = (payload: boolean) => ({
  type: PLAYOFF_SAVED_SUCCESS,
  payload,
});

const loadDataWithScores = (payload: { scoredTeams: ITeamWithResults[] }) => ({
  type: LOAD_DATA_WITH_SCORES,
  payload,
});

const fetchSortedTeams = (payload: IPlayoffSortedTeams) => ({
  type: FETCH_SCORED_TEAMS,
  payload,
});

const setAdvancingInProgress = (payload: boolean) => ({
  type: BRACKETS_ADVANCING_IN_PROGRESS,
  payload,
});

export const clearSortedTeams = () => ({
  type: CLEAR_SCORED_TEAMS,
});

export const fetchBracketGames = (
  payload: IBracketGame[],
  skipHistory?: boolean
) => ({
  type: PLAYOFF_FETCH_GAMES,
  payload,
  skipHistory,
});

export const clearBracketGames = () => ({
  type: PLAYOFF_CLEAR_GAMES,
});

export const onUndoBrackets = () => ({
  type: PLAYOFF_UNDO_GAMES,
});

const clearUndoHistory = () => ({
  type: PLAYOFF_UNDO_CLEAR,
});

const newError = () =>
  errorToast("An error occurred while saving the playoff data");

const callPostPut = (uri: string, data: any, isUpdate: boolean) =>
  isUpdate ? api.put(uri, data) : api.post(uri, data);

const managePlayoffSaving = (
  bracketGames: IBracketGame[],
  isCreate: boolean
) => async (dispatch: Dispatch, getState: IGetState) => {
  const { scheduling } = getState();
  const { bracket } = scheduling;

  if (!bracket) return newError();

  const loadedGames: IPlayoffGame[] = await api.get(`/brackets_details`, {
    bracket_id: bracket.id,
  });

  // POST/PUT Bracket
  const bracketData = await mapBracketData(bracket, true);
  const bracketResp = await callPostPut(
    "/brackets",
    isCreate && bracket?.bracketLevel
      ? ({
          ...bracketData,
          bracket_level: bracket?.bracketLevel,
        } as IFetchedBracket)
      : bracketData,
    !isCreate
  );

  if (!bracketResp) return newError();
  // POST/PUT BracketGames
  const existingGames: IBracketGame[] = [];
  const newGames: IBracketGame[] = [];

  const existingGameIds = loadedGames?.map((item) => item.game_id);
  const removedGames = bracketGames.filter((item) => item.hidden);
  bracketGames = bracketGames.filter((item) => !item.hidden);

  bracketGames.forEach((item) =>
    existingGameIds.includes(item.id)
      ? existingGames.push(item)
      : newGames.push(item)
  );

  const existingBracketGames = await mapBracketGames(existingGames, bracket);
  const existingBracketGamesChunk = chunk(existingBracketGames, 50);

  const existingBracketGamesResp = await Promise.all(
    existingBracketGamesChunk.map(
      async (arr) => await api.put("/brackets_details", arr)
    )
  );

  const newBracketGames = await mapBracketGames(newGames, bracket);
  const newBracketGamesChunk = chunk(newBracketGames, 50);

  const newBracketGamesResp = await Promise.all(
    newBracketGamesChunk.map(
      async (arr) => await api.post("/brackets_details", arr)
    )
  );

  // Delete games that were removed in the component
  const mappedRemovedGames = await mapBracketGames(removedGames, bracket);
  const mappedRemovedGamesChunk = chunk(mappedRemovedGames, 50);

  await Promise.all(
    mappedRemovedGamesChunk.map(
      async (arr) => await api.delete("/brackets_details", arr)
    )
  );

  const existingBracketGamesRespOk = existingBracketGamesResp.every(
    (item) => item
  );
  const newBracketGamesRespOk = newBracketGamesResp.every((item) => item);

  const responseOk =
    existingGames?.length && newGames?.length
      ? existingBracketGamesRespOk && newBracketGamesRespOk
      : existingBracketGamesRespOk || newBracketGamesRespOk;

  if (bracketResp && responseOk) {
    dispatch(clearUndoHistory());
    dispatch(playoffSavedSuccess(true));
    successToast("Playoff data was successfully saved!");
    return;
  }

  dispatch(playoffSavedSuccess(false));
  errorToast("Something happened during the saving process");
};

export const createPlayoff = (bracketGames: IBracketGame[]) => (
  dispatch: Dispatch
) => {
  dispatch<any>(managePlayoffSaving(bracketGames, true));
};

export const savePlayoff = (bracketGames: IBracketGame[]) => (
  dispatch: Dispatch
) => {
  dispatch<any>(managePlayoffSaving(bracketGames, false));
};

export const retrieveBrackets = (bracketId: string) => async (
  dispatch: Dispatch
) => {
  const response = await api.get("/brackets", {
    bracket_id: bracketId,
  });

  if (response?.length) {
    const bracketData = mapFetchedBracket(response[0]);
    dispatch(addNewBracket(bracketData));
  }
};

export const retrieveBracketsGames = (bracketId: string) => async (
  dispatch: Dispatch,
  getState: IGetState
) => {
  const response = await api.get("/brackets_details", {
    bracket_id: bracketId,
  });
  const fields = getState().pageEvent.tournamentData.fields;

  if (response?.length) {
    const bracketGames = mapFetchedBracketGames(response, fields);
    const orderedGames = orderBy(bracketGames, ["divisionId", "index"]);
    dispatch(fetchBracketGames(orderedGames));
  }
};

export const addNoteForGame = (
  game: IBracketGame,
  bracket: IBracket
) => async () => {
  const updatedGame = [{ ...game }];
  const bracketGame = await mapBracketGames(updatedGame, bracket);

  await api.put("/brackets_details", bracketGame);
};

// Advance Teams To Brackets

export const advanceTeamsToBrackets = () => async (
  dispatch: Dispatch,
  getState: IGetState
) => {
  dispatch(setAdvancingInProgress(true));
  const { scheduling } = getState();
  const { bracket } = scheduling;
  const event = getState().pageEvent.tournamentData.event;
  const eventId = event?.event_id;
  // get teams
  const teams = await api.get("/teams", { event_id: eventId });
  // get games
  const games = await api.get("/games", { schedule_id: bracket?.scheduleId });
  // get facilities
  const facilities = await api.get("/facilities", { event_id: eventId });
  // get fields
  const fields = (
    await Promise.all(
      facilities.map((it: IFacility) =>
        api.get(`/fields?facilities_id=${it.facilities_id}`)
      )
    )
  ).flat();
  // calculate scoring settings
  const scoringSettings = getScoringSettings(event!);
  // calculate teams with scoring results
  const scoredTeams = getTeamsWithResults(teams, games, scoringSettings);
  // calculate games with scoring results
  const scoredGames = mapScheduleGamesWithNames(teams, fields, games);

  dispatch(loadDataWithScores({ scoredTeams }));

  const divisionDictionary = groupBy(scoredTeams, "division_id");
  const sortedTeams = {};

  Object.keys(divisionDictionary).forEach(
    (key) =>
      (sortedTeams[key] = sortTeamByScored(
        divisionDictionary[key],
        scoredGames,
        event?.ranking_factor_divisions!
      ))
  );

  dispatch(setAdvancingInProgress(false));
  dispatch(fetchSortedTeams(sortedTeams));
};
