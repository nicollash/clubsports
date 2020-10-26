import {
  TeamsAction,
  LOAD_TEAMS_DATA_START,
  LOAD_TEAMS_DATA_SUCCESS,
  LOAD_POOLS_START,
  LOAD_POOLS_SUCCESS,
  SAVE_TEAMS_SUCCESS,
  SAVE_PLAYER_SUCCESS,
  CREATE_TEAMS_SUCCESS,
  CREATE_PLAYERS_SUCCESS,
  CREATE_COACHES_SUCCESS,
  SAVE_COACHES_SUCCESS,
  DELETE_PLAYER_SUCCESS,
  DELETE_COACHE_SUCCESS,
  CHECK_DELETE_TEAM_START,
  CHECK_DELETE_TEAM_SUCCESS,
  CHECK_DELETE_TEAM_FAILURE,
  DELETE_TEAM_SUCCESS,
  CANCELED_DELETE,
} from "./action-types";
import {
  IGame,
  IPool,
  ITeam,
  IPlayer,
  ICoache,
  IDivision,
  IGameBracket,
  ISchedulesDetails,
  ISchedulesGameWithNames,
} from "common/models";

export interface ITeamsState {
  pools: IPool[];
  teams: ITeam[];
  games: ISchedulesGameWithNames[];
  players: IPlayer[];
  coaches: ICoache[];
  divisions: IDivision[];
  schedulesId: string[];
  updatedGames: IGame[];
  schedulesNames: string[];
  schedulesDetails: ISchedulesDetails[];
  updatedGameBrackets: IGameBracket[];
  isLoading: boolean;
  isLoaded: boolean;
  isLoadingNames: boolean;
  isOpenConfirm: boolean;
  isOpenDeleteConfirm: boolean;
}

const initialState = {
  pools: [],
  teams: [],
  games: [],
  players: [],
  coaches: [],
  divisions: [],
  schedulesId: [],
  updatedGames: [],
  schedulesNames: [],
  schedulesDetails: [],
  updatedGameBrackets: [],
  isLoaded: false,
  isLoading: false,
  isOpenConfirm: false,
  isLoadingNames: false,
  isOpenDeleteConfirm: false,
};

const teamsReducer = (
  state: ITeamsState = initialState,
  action: TeamsAction
) => {
  switch (action.type) {
    case LOAD_TEAMS_DATA_START: {
      return { ...initialState, isLoading: true };
    }
    case LOAD_TEAMS_DATA_SUCCESS: {
      const { schedules, divisions, teams, players, games, coaches } = action.payload;

      return {
        ...state,
        schedules,
        divisions,
        teams,
        coaches,
        players,
        games,
        isLoading: false,
        isLoaded: true,
      };
    }
    case LOAD_POOLS_START: {
      const { divisionId } = action.payload;

      return {
        ...state,
        divisions: state.divisions.map((it) =>
          it.division_id === divisionId ? { ...it, isPoolsLoading: true } : it
        ),
      };
    }
    case LOAD_POOLS_SUCCESS: {
      const { pools, divisionId } = action.payload;

      return {
        ...state,
        divisions: state.divisions.map((it) =>
          it.division_id === divisionId
            ? { ...it, isPoolsLoading: false, isPoolsLoaded: true }
            : it
        ),
        pools: [...state.pools, ...pools],
      };
    }
    case SAVE_TEAMS_SUCCESS: {
      const { teams } = action.payload;

      return { ...state, teams };
    }
    case CREATE_TEAMS_SUCCESS: {
      const { data } = action.payload;
      return { ...state, teams: [...state.teams, ...data] };
    }
    case CREATE_PLAYERS_SUCCESS: {
      const { data } = action.payload;
      return {
        ...state,
        players: [...state.players, ...data],
      };
    }
    case CREATE_COACHES_SUCCESS: {
      const { coaches } = action.payload;
      return {
        ...state,
        coaches: [...state.coaches, ...coaches],
      };
    }
    case SAVE_COACHES_SUCCESS: {
      const { coaches } = action.payload;
      return { ...state, coaches };
    }
    case SAVE_PLAYER_SUCCESS: {
      const { player } = action.payload;
      const newPlayers = state.players.filter(
        (p) => p.team_player_id !== player.team_player_id
      );
      newPlayers.push(player);
      return {
        ...state,
        players: newPlayers
      };
    }
    case DELETE_PLAYER_SUCCESS: {
      const { player } = action.payload;
      const newPlayers = state.players.filter(
        (p) => p.team_player_id !== player.team_player_id
      );
      return {
        ...state,
        players: newPlayers
      };
    }
    case DELETE_COACHE_SUCCESS: {
      const { coache } = action.payload;
      const deletedCoache = state.coaches.filter(
        (p) => p.team_contact_id !== coache.team_contact_id
      );
      return {
        ...state,
        coache: deletedCoache
      };
    }
    case CHECK_DELETE_TEAM_START: {
      return {
        ...state,
        isLoadingNames: true,
        isOpenConfirm: false,
      }
    }
    case CHECK_DELETE_TEAM_SUCCESS: {
      const { schedulesId, updatedGames, schedulesNames, schedulesDetails, updatedGameBrackets, } = action.payload;

      if(schedulesNames.length === 0 ){
        return {
          ...state,
          isOpenConfirm: false,
          isLoadingNames: false,
          isOpenDeleteConfirm: true,
        }
      }

      return {
        ...state,
        schedulesId,
        updatedGames,
        schedulesNames,
        schedulesDetails,
        updatedGameBrackets,
        isOpenConfirm: true,
        isLoadingNames: false,
      }
    }
    case CHECK_DELETE_TEAM_FAILURE: {
      return {
        ...state,
        isLoadingNames: false,
      };
    }
    case DELETE_TEAM_SUCCESS: {
      return {
        ...state,
        schedulesId: [],
        updatedGames: [],
        schedulesNames: [],
        schedulesDetails: [],
        updatedGameBrackets: [],
        isOpenConfirm: false,
        isLoadingNames: false,
      };
    }

    case CANCELED_DELETE: {
      return {
        ...state,
        schedulesId: [],
        schedulesNames: [],
        schedulesDetails: [],
        isOpenConfirm: false,
        isLoadingNames: false,
        isOpenDeleteConfirm: false,
      }
    }
    default:
      return state;
  }
};

export default teamsReducer;
