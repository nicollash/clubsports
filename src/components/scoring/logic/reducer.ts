import {
  TeamsAction,
  LOAD_SCORING_DATA_START,
  LOAD_SCORING_DATA_SUCCESS,
  LOAD_POOLS_SUCCESS,
  EDIT_TEAM_SUCCESS,
  DELETE_TEAM_SUCCESS,
  LOAD_POOLS_START,
} from './action-types';
import {
  IDivision,
  IPool,
  ITeamWithResults,
  ISchedulesGameWithNames,
} from 'common/models';

export interface IScoringState {
  isLoading: boolean;
  isLoaded: boolean;
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeamWithResults[];
  games: ISchedulesGameWithNames[];
}

const initialState = {
  isLoading: false,
  isLoaded: true,
  divisions: [],
  pools: [],
  teams: [],
  games: [],
};

const scoringReducer = (
  state: IScoringState = initialState,
  action: TeamsAction
) => {
  switch (action.type) {
    case LOAD_SCORING_DATA_START: {
      return { ...initialState, isLoading: true };
    }
    case LOAD_SCORING_DATA_SUCCESS: {
      const { divisions, teams, games } = action.payload;

      return {
        ...state,
        divisions,
        teams,
        games,
        isLoading: false,
        isLoaded: true,
      };
    }
    case LOAD_POOLS_START: {
      const { divisionId } = action.payload;

      return {
        ...state,
        divisions: state.divisions.map(it =>
          it.division_id === divisionId ? { ...it, isPoolsLoading: true } : it
        ),
      };
    }
    case LOAD_POOLS_SUCCESS: {
      const { divisionId, pools } = action.payload;

      return {
        ...state,
        divisions: state.divisions.map(it =>
          it.division_id === divisionId
            ? { ...it, isPoolsLoading: false, isPoolsLoaded: true }
            : it
        ),
        pools: [...state.pools, ...pools],
      };
    }
    case EDIT_TEAM_SUCCESS: {
      const { team } = action.payload;

      return {
        ...state,
        teams: state.teams.map(it => (it.team_id === team.team_id ? team : it)),
      };
    }
    case DELETE_TEAM_SUCCESS: {
      const { teamId } = action.payload;

      return {
        ...state,
        teams: state.teams.filter(it => it.team_id !== teamId),
      };
    }
    default:
      return state;
  }
};

export default scoringReducer;
