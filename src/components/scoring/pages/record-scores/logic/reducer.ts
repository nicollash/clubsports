import {
  LOAD_SCORES_DATA_START,
  LOAD_SCORES_DATA_SUCCESS,
  SAVE_GAME_SUCCESS,
  RecordScoresAction,
  CLEAR_SCORES_DATA,
  SAVE_GAME_START,
} from './action-types';

import {
  IDivision,
  ITeam,
  IEventSummary,
  IFacility,
  IEventDetails,
  IField,
  ISchedule,
  IPool,
  ISchedulesGame,
} from "common/models";

export interface IRecordScoresState {
  event: IEventDetails | null;
  facilities: IFacility[];
  fields: IField[];
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeam[];
  schedule: ISchedule | null;
  eventSummary: IEventSummary[];
  schedulesGames: ISchedulesGame[];
  isLoading: boolean;
  isLoaded: boolean;
  savingInProgress: boolean;
}

const initialState = {
  event: null,
  facilities: [],
  fields: [],
  divisions: [],
  pools: [],
  teams: [],
  schedule: null,
  eventSummary: [],
  schedulesGames: [],
  isLoading: false,
  isLoaded: false,
  savingInProgress: false,
};

const recordScoresReducer = (
  state: IRecordScoresState = initialState,
  action: RecordScoresAction
) => {
  switch (action.type) {
    case CLEAR_SCORES_DATA: {
      return { ...initialState };
    }
    case LOAD_SCORES_DATA_START: {
      return { ...initialState, isLoading: true };
    }
    case SAVE_GAME_SUCCESS: {
      const { games } = action.payload;
      return {
        ...state,
        savingInProgress: false,
        schedulesGames: games.map((game: ISchedulesGame) => ({
          ...game,
        })),
      };
    }
    case SAVE_GAME_START: {
      return {
        ...state,
        savingInProgress: true,
      }
    }
    case LOAD_SCORES_DATA_SUCCESS: {
      const {
        event,
        facilities,
        fields,
        schedule,
        divisions,
        teams,
        eventSummary,
        pools,
        schedulesGames,
      } = action.payload;

      return {
        ...state,
        isLoading: false,
        isLoaded: true,
        event,
        facilities,
        fields,
        schedule,
        divisions,
        teams,
        eventSummary,
        pools,
        schedulesGames: schedulesGames.map((game: ISchedulesGame) => ({
          ...game,
        })),
      };
    }

    default:
      return state;
  }
};

export default recordScoresReducer;
