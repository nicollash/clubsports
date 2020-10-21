import {
  PLAYOFF_SAVED_SUCCESS,
  IPlayoffAction,
  PLAYOFF_FETCH_GAMES,
  PLAYOFF_CLEAR_GAMES,
  PLAYOFF_UNDO_GAMES,
  PLAYOFF_UNDO_CLEAR,
  LOAD_DATA_WITH_SCORES,
  FETCH_SCORED_TEAMS,
  CLEAR_SCORED_TEAMS,
  BRACKETS_ADVANCING_IN_PROGRESS,
  CHANGE_CUSTOM_BRACKET_GAME,
  CHANGE_SELECTED_DIVISION,
} from "./actionTypes";
import { IBracketGame } from "../bracketGames";
import { IPlayoffSortedTeams } from "./actions";

export interface IPlayoffState {
  playoffSaved: boolean;
  bracketGames: IBracketGame[] | null;
  selectedDivision: string | null;
  bracketGamesHistory: IBracketGame[][] | [];
  sortedTeams: IPlayoffSortedTeams | null;
  advancingInProgress: boolean;
}

const defaultState: IPlayoffState = {
  playoffSaved: false,
  bracketGamesHistory: [],
  bracketGames: null,
  selectedDivision: null,
  sortedTeams: null,
  advancingInProgress: false,
};

export default (state = defaultState, action: IPlayoffAction) => {
  switch (action.type) {
    case PLAYOFF_SAVED_SUCCESS:
      return {
        ...state,
        playoffSaved: action.payload,
      };
    case PLAYOFF_FETCH_GAMES:
      return {
        ...state,
        bracketGamesHistory: action.skipHistory
          ? state.bracketGamesHistory
          : [
              ...(state.bracketGamesHistory || []),
              ...(state.bracketGames ? [state.bracketGames] : []),
            ],
        bracketGames: action.payload,
      };
    case PLAYOFF_CLEAR_GAMES:
      return {
        ...state,
        bracketGamesHistory: [],
        bracketGames: null,
      };
    case PLAYOFF_UNDO_GAMES:
      return {
        ...state,
        bracketGamesHistory: state.bracketGamesHistory.slice(
          0,
          state.bracketGamesHistory?.length - 1
        ),
        bracketGames: state.bracketGamesHistory.pop(),
      };
    case PLAYOFF_UNDO_CLEAR:
      return {
        ...state,
        bracketGamesHistory: [],
      };
    case LOAD_DATA_WITH_SCORES:
      return {
        ...state,
        ...action.payload,
      };
    case FETCH_SCORED_TEAMS:
      return {
        ...state,
        sortedTeams: action.payload,
      };
    case CLEAR_SCORED_TEAMS:
      return {
        ...state,
        sortedTeams: null,
      };
    case BRACKETS_ADVANCING_IN_PROGRESS:
      return {
        ...state,
        advancingInProgress: action.payload,
      };
    case CHANGE_SELECTED_DIVISION:
      return {
        ...state,
        selectedDivision: action.payload,
      };
    case CHANGE_CUSTOM_BRACKET_GAME:
      const updatedBracketGames = state.bracketGames?.map(
        (game: IBracketGame) => {
          if (game.id === action.payload.id) {
            return action.payload;
          }
          return game;
        }
      );
      return {
        ...state,
        bracketGames: updatedBracketGames,
      };
    default:
      return state;
  }
};
