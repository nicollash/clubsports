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
} from './actionTypes';
import { IBracketGame } from '../bracketGames';
import { IPlayoffSortedTeams } from './actions';

export interface IPlayoffState {
  playoffSaved: boolean;
  bracketGames: IBracketGame[] | null;
  bracketGamesHistory: IBracketGame[][] | [];
  sortedTeams: IPlayoffSortedTeams | null;
  advancingInProgress: boolean;
}

const defaultState: IPlayoffState = {
  playoffSaved: false,
  bracketGamesHistory: [],
  bracketGames: null,
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
    default:
      return state;
  }
};
