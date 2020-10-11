import { IDivision, ITeam, IPool } from 'common/models';

export const DIVISIONS_TEAMS_FETCH_START = 'DIVISIONS_TEAMS_FETCH_START';
export const DIVISIONS_TEAMS_FETCH_SUCCESS = 'DIVISIONS_TEAMS_FETCH_SUCCESS';
export const DIVISIONS_TEAMS_FETCH_FAILURE = 'DIVISIONS_TEAMS_FETCH_FAILURE';
export const POOLS_FETCH_SUCCESS = 'POOLS_FETCH_SUCCESS';
export const ALL_POOLS_FETCH_SUCCESS = 'ALL_POOLS_FETCH_SUCCESS';
export const TEAMS_FETCH_SUCCESS = 'TEAMS_FETCH_SUCCESS';
export const FETCH_DETAILS_START = 'FETCH_DETAILS_START';
export const ADD_DIVISION_SUCCESS = 'ADD_DIVISION_SUCCESS';
export const UPDATE_DIVISION_SUCCESS = 'UPDATE_DIVISION_SUCCESS';
export const DELETE_DIVISION_SUCCESS = 'DELETE_DIVISION_SUCCESS';
export const DELETE_ALL_DIVISIONS_SUCCESS = 'DELETE_ALL_DIVISIONS_SUCCESS';
export const ADD_POOL_SUCCESS = 'ADD_POOL_SUCCESS';
export const REGISTRATION_FETCH_SUCCESS =
  'DIVISIONS_REGISTRATION_FETCH_SUCCESS';
export const DIVISION_SAVE_SUCCESS = 'DIVISION_SAVE_SUCCESS';

export const UPDATE_TEAMS_SUCCESS = 'DIVISION_AND_POOLS:UPDATE_TEAMS_SUCCESS';
export const SAVE_TEAMS_FAILURE = 'DIVISION_AND_POOLS:SAVE_TEAMS_FAILURE';

export const EDIT_POOL_SUCCESS = 'DIVISION_AND_POOLS:EDIT_POOL_SUCCESS';
export const EDIT_POOL_FAILURE = 'DIVISION_AND_POOLS:EDIT_POOL_FAILURE';

export const DELETE_POOL_SUCCESS = 'DIVISION_AND_POOLS:DELETE_POOL_SUCCESS';
export const DELETE_POOL_FAILURE = 'DIVISION_AND_POOLS:DELETE_POOL_FAILURE';

export const ADD_NEW_POOL_IN_PROGRESS = 'ADD_NEW_POOL_IN_PROGRESS';
export const ADD_NEW_POOL_SUCCESS = 'ADD_NEW_POOL_SUCCESS';
export const ADD_NEW_POOL_FAILURE = 'ADD_NEW_POOL_FAILURE';

export interface loadDivisionsTeamsSuccess {
  type: 'DIVISIONS_TEAMS_FETCH_SUCCESS';
  payload: {
    divisions: IDivision[];
    teams: ITeam[];
  };
}

export interface saveDivisionsSuccess {
  type: 'DIVISION_SAVE_SUCCESS';
  payload: IDivision[];
}

export interface ISaveTeamSuccess {
  type: 'DIVISION_AND_POOLS:UPDATE_TEAMS_SUCCESS';
  payload: {
    teams: ITeam[];
  };
}

export interface IEditPoolSuccess {
  type: 'DIVISION_AND_POOLS:EDIT_POOL_SUCCESS';
  payload: {
    pool: IPool;
  };
}

export interface IDeletePoolSuccess {
  type: 'DIVISION_AND_POOLS:EDIT_POOL_SUCCESS';
  payload: {
    deletedPool: IPool;
    unassignedTeams: ITeam[];
  };
}

export interface addNewPoolInProgress {
  type: 'ADD_NEW_POOL_IN_PROGRESS',
}

export interface addNewPoolSuccess {
  type: 'ADD_NEW_POOL_SUCCESS',
  payload: IPool
}

export interface addNewPoolFailure {
  type: 'ADD_NEW_POOL_FAILURE',
}

export type DivisionsPoolsAction =
  | loadDivisionsTeamsSuccess
  | saveDivisionsSuccess
  | ISaveTeamSuccess
  | IEditPoolSuccess
  | IDeletePoolSuccess
  | addNewPoolInProgress
  | addNewPoolSuccess
  | addNewPoolFailure;
