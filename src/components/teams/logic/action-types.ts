import {
  IDivision,
  IPool,
  ITeam,
  ISchedulesGameWithNames,
  IPlayer,
  ICoache,
  ISchedule,
  ISchedulesDetails,
  IGame,
  IGameBracket,
} from '../../../common/models';

export const LOAD_TEAMS_DATA_START = 'TEAMS:LOAD_TEAMS_DATA_START';
export const LOAD_TEAMS_DATA_SUCCESS = 'TEAMS:LOAD_TEAMS_DATA_SUCCESS';
export const LOAD_TEAMS_DATA_FAILURE = 'TEAMS:LOAD_TEAMS_DATA_FAILURE';

export const LOAD_POOLS_START = 'TEAMS:LOAD_POOLS_START';
export const LOAD_POOLS_SUCCESS = 'TEAMS:LOAD_POOLS_SUCCESS';
export const LOAD_POOLS_FAILURE = 'TEAMS:LOAD_POOLS_FAILURE';

export const SAVE_TEAMS_START = 'TEAMS:SAVE_TEAMS_START';
export const SAVE_TEAMS_SUCCESS = 'TEAMS:SAVE_TEAMS_SUCCESS';
export const SAVE_TEAMS_FAILURE = 'TEAMS:SAVE_TEAMS_FAILURE';
export const CREATE_TEAMS_SUCCESS = 'TEAMS:CREATE_TEAMS_SUCCESS';

export const DELETE_COACHE_SUCCESS = 'DELETE_COACHE_SUCCESS';
export const CREATE_COACHES_SUCCESS = 'CREATE_COACHES_SUCCESS';

export const CREATE_PLAYERS_SUCCESS = 'CREATE_PLAYERS_SUCCESS';
export const SAVE_PLAYER_SUCCESS = 'SAVE_PLAYER_SUCCESS';
export const DELETE_PLAYER_SUCCESS = 'DELETE_PLAYER_SUCCESS';

export const CHECK_DELETE_TEAM_START = 'CHECK_DELETE_TEAM_START';
export const CHECK_DELETE_TEAM_SUCCESS = 'CHECK_DELETE_TEAM_SUCCESS';
export const CHECK_DELETE_TEAM_FAILURE = 'CHECK_DELETE_TEAM_FAILURE';

export const DELETE_TEAM_SUCCESS = 'DELETE_TEAM_SUCCESS';
export const CANCELED_DELETE = 'CANCELED_DELETE';

export interface loadDivisionsTeamsStart {
  type: 'TEAMS:LOAD_TEAMS_DATA_START';
};

export interface loadDivisionsTeamsSuccess {
  type: 'TEAMS:LOAD_TEAMS_DATA_SUCCESS';
  payload: {
    schedules: ISchedule[];
    divisions: IDivision[];
    teams: ITeam[];
    players: IPlayer[];
    coaches: ICoache[];
    games: ISchedulesGameWithNames[];
  };
};

export interface loadPoolsStart {
  type: 'TEAMS:LOAD_POOLS_START';
  payload: {
    divisionId: string;
  };
};

export interface loadPoolsSuccess {
  type: 'TEAMS:LOAD_POOLS_SUCCESS';
  payload: {
    divisionId: string;
    pools: IPool[];
  };
};

export interface saveTeamsSuccess {
  type: 'TEAMS:SAVE_TEAMS_SUCCESS';
  payload: {
    teams: ITeam[];
  };
};

export interface createTeamsSuccess {
  type: 'TEAMS:CREATE_TEAMS_SUCCESS';
  payload: {
    data: ITeam[];
  };
};

export interface createPlayersSuccess {
  type: 'CREATE_PLAYERS_SUCCESS';
  payload: {
    data: IPlayer[];
  }
};

export interface createCoachesSuccess {
  type: 'CREATE_COACHES_SUCCESS';
  payload: {
    data: ICoache[];
  }
};

export interface savePlayerSuccess {
  type: 'SAVE_PLAYER_SUCCESS';
  payload: {
    player: IPlayer;
  };
};

export interface deletePlayerSuccess {
  type: 'DELETE_PLAYER_SUCCESS';
  payload: {
    player: IPlayer;
  };
};

export interface deleteCoacheSuccess {
  type: 'DELETE_COACHE_SUCCESS';
  payload: {
    coache: ICoache;
  };
};

export interface checkDeleteTeamStart {
  type: 'CHECK_DELETE_TEAM_START';
};

export interface checkDeleteTeamSuccess {
  type: 'CHECK_DELETE_TEAM_SUCCESS';
  payload: {
    schedulesId: string[];
    updatedGames: IGame[];
    schedulesNames: string[];
    schedulesDetails: ISchedulesDetails[];
    updatedGameBrackets: IGameBracket[];
  }
};

export interface checkDeleteTeamFailure {
  type: 'CHECK_DELETE_TEAM_FAILURE';
};

export interface deleteTeamSuccess {
  type: 'DELETE_TEAM_SUCCESS'; 
};

export interface canceledDelete {
  type: 'CANCELED_DELETE';
};

export type TeamsAction =
  | loadDivisionsTeamsStart
  | loadDivisionsTeamsSuccess
  | loadPoolsStart
  | loadPoolsSuccess
  | saveTeamsSuccess
  | createTeamsSuccess
  | savePlayerSuccess
  | createCoachesSuccess
  | deleteCoacheSuccess
  | deletePlayerSuccess
  | createPlayersSuccess
  | checkDeleteTeamStart
  | checkDeleteTeamSuccess
  | checkDeleteTeamFailure
  | deleteTeamSuccess
  | canceledDelete;
