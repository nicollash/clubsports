import {
  ITeamWithResults,
  IPool,
  IDivision,
  ISchedulesGameWithNames,
} from 'common/models';

export const LOAD_SCORING_DATA_START = 'SCORING:LOAD_SCORING_DATA_START';
export const LOAD_SCORING_DATA_SUCCESS = 'SCORING:LOAD_SCORING_DATA_SUCCESS';
export const LOAD_SCORING_DATA_FAILURE = 'SCORING:LOAD_SCORING_DATA_FAILURE';

export const LOAD_POOLS_START = 'SCORING:LOAD_POOLS_START';
export const LOAD_POOLS_SUCCESS = 'SCORING:LOAD_POOLS_SUCCESS';
export const LOAD_POOLS_FAILURE = 'SCORING:LOAD_POOLS_FAILURE';

export const EDIT_TEAM_SUCCESS = 'SCORING:EDIT_TEAM_SUCCESS';
export const EDIT_TEAM_FAILURE = 'SCORING:EDIT_TEAM_FAILURE';

export const DELETE_TEAM_SUCCESS = 'SCORING:DELETE_TEAM_SUCCESS';
export const DELETE_TEAM_FAILURE = 'SCORING:DELETE_TEAM_FAILURE';

export interface loadDivisionStart {
  type: 'SCORING:LOAD_SCORING_DATA_START';
}

export interface loadDivisionSuccess {
  type: 'SCORING:LOAD_SCORING_DATA_SUCCESS';
  payload: {
    divisions: IDivision[];
    games: ISchedulesGameWithNames[];
    teams: ITeamWithResults;
  };
}

export interface loadPoolsStart {
  type: 'SCORING:LOAD_POOLS_START';
  payload: {
    divisionId: string;
  };
}

export interface loadPoolsSuccess {
  type: 'SCORING:LOAD_POOLS_SUCCESS';
  payload: {
    divisionId: string;
    pools: IPool[];
  };
}

export interface loadTeamsStart {
  type: 'SCORING:LOAD_TEAMS_START';
  payload: {
    poolId: string;
  };
}

export interface editTeamsSuccess {
  type: 'SCORING:EDIT_TEAM_SUCCESS';
  payload: {
    team: ITeamWithResults;
  };
}

export interface deleteTeamSuccess {
  type: 'SCORING:DELETE_TEAM_SUCCESS';
  payload: {
    teamId: string;
  };
}

export type TeamsAction =
  | loadTeamsStart
  | loadPoolsStart
  | loadDivisionStart
  | loadDivisionSuccess
  | loadPoolsSuccess
  | editTeamsSuccess
  | deleteTeamSuccess;
