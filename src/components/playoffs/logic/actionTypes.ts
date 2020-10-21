import { IBracketGame } from "../bracketGames";
import { ITeamWithResults } from "common/models";
import { IPlayoffSortedTeams } from "./actions";

export const PLAYOFF_SAVED_SUCCESS = "PLAYOFF_SAVED_SUCCESS";
export const PLAYOFF_FETCH_GAMES = "PLAYOFF_FETCH_GAMES";
export const PLAYOFF_CLEAR_GAMES = "PLAYOFF_CLEAR_GAMES";
export const PLAYOFF_UNDO_GAMES = "PLAYOFF_UNDO_GAMES";
export const PLAYOFF_UNDO_CLEAR = "PLAYOFF_UNDO_CLEAR";

export const LOAD_DATA_WITH_SCORES = "BRACKETS:LOAD_DATA_WITH_SCORES";
export const FETCH_SCORED_TEAMS = "BRACKETS:FETCH_SCORED_TEAMS";
export const CLEAR_SCORED_TEAMS = "BRACKETS:CLEAR_SCORED_TEAMS";
export const BRACKETS_ADVANCING_IN_PROGRESS = "BRACKETS_ADVANCING_IN_PROGRESS";
export const CHANGE_CUSTOM_BRACKET_GAME = "CHANGE_CUSTOM_BRACKET_GAME";
export const CHANGE_SELECTED_DIVISION = "CHANGE_SELECTED_DIVISION";

interface IPlayoffSavedSuccess {
  type: "PLAYOFF_SAVED_SUCCESS";
  payload: boolean;
}

interface IPlayoffFetchGames {
  type: "PLAYOFF_FETCH_GAMES";
  payload: IBracketGame[];
  skipHistory?: boolean;
}

interface IPlayoffClearGames {
  type: "PLAYOFF_CLEAR_GAMES";
}

interface IPlayoffUndoGames {
  type: "PLAYOFF_UNDO_GAMES";
}

interface ILoadDataWithScores {
  type: "BRACKETS:LOAD_DATA_WITH_SCORES";
  payload: { scoredTeams: ITeamWithResults[] };
}

interface IFetchSortedTeams {
  type: "BRACKETS:FETCH_SCORED_TEAMS";
  payload: IPlayoffSortedTeams;
}

interface IClearSortedTeams {
  type: "BRACKETS:CLEAR_SCORED_TEAMS";
}

interface IBracketsAdvancingInProgress {
  type: "BRACKETS_ADVANCING_IN_PROGRESS";
  payload: boolean;
}

interface IPlayoffUndoClear {
  type: "PLAYOFF_UNDO_CLEAR";
}

interface IChangeBracketGame {
  type: "CHANGE_CUSTOM_BRACKET_GAME";
  payload: IBracketGame;
}

interface IChangeSelectedDivision {
  type: "CHANGE_SELECTED_DIVISION";
  payload: string;
}

export type IPlayoffAction =
  | IPlayoffSavedSuccess
  | IPlayoffFetchGames
  | IPlayoffClearGames
  | IPlayoffUndoGames
  | ILoadDataWithScores
  | IFetchSortedTeams
  | IClearSortedTeams
  | IBracketsAdvancingInProgress
  | IChangeBracketGame
  | IChangeSelectedDivision
  | IPlayoffUndoClear;
