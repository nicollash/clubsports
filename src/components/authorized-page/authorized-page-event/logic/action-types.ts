import { ITournamentData, IEventDetails } from 'common/models';
import { IEntity } from 'common/types';
import { EntryPoints } from 'common/enums';
import { ITeam } from 'common/models/schedule/teams';

export const LOAD_AUTH_PAGE_DATA_START = 'LOAD_AUTH_PAGE_DATA_START';
export const LOAD_AUTH_PAGE_DATA_SUCCESS = 'LOAD_AUTH_PAGE_DATA_SUCCESS';
export const LOAD_AUTH_PAGE_DATA_FAILURE = 'LOAD_AUTH_PAGE_DATA_FAILURE';

export const CLEAR_AUTH_PAGE_DATA = 'CLEAR_AUTH_PAGE_DATA';

export const PUBLISH_EVENT_SUCCESS = 'PUBLISH_EVENT_SUCCESS';
export const PUBLISH_EVENT_FAILURE = 'PUBLISH_EVENT_FAILURE';

export const PUBLISH_GAMECOUNT_SUCCESS = 'PUBLISH_GAMECOUNT_SUCCESS';

export const ADD_ENTITY_TO_LIBRARY_SUCCESS = 'ADD_ENTITY_TO_LIBRARY_SUCCESS';
export const ADD_ENTITY_TO_LIBRARY_FAILURE = 'ADD_ENTITY_TO_LIBRARY_FAILURE';

export const ADD_ENTITIES_TO_LIBRARY_SUCCESS =
  'ADD_ENTITIES_TO_LIBRARY_SUCCESS';
export const ADD_ENTITIES_TO_LIBRARY_FAILURE =
  'ADD_ENTITIES_TO_LIBRARY_FAILURE';

export const UPDATE_MENU = 'UPDATE_MENU';

export const ADD_TEAMS_IN_PROGRESS = 'ADD_TEAMS_IN_PROGRESS';
export const ADD_TEAMS_SUCCESS = 'ADD_TEAMS_SUCCESS';
export const ADD_TEAMS_FAILURE = 'ADD_TEAMS_FAILURE';

export interface loadAuthPageDataStart {
  type: 'LOAD_AUTH_PAGE_DATA_START';
}

export interface loadAuthPageDataSuccess {
  type: 'LOAD_AUTH_PAGE_DATA_SUCCESS';
  payload: {
    tournamentData: ITournamentData;
  };
}

export interface cleatAuthPageData {
  type: 'CLEAR_AUTH_PAGE_DATA';
}

export interface publishEventSuccess {
  type: 'PUBLISH_EVENT_SUCCESS';
  payload: {
    event: IEventDetails;
  };
}

export interface publishGameCountSuccess {
  type: 'PUBLISH_GAMECOUNT_SUCCESS';
  payload: {
    poolLength: number;
    bracketLength: number;
  };
}

export interface addEntityToLibrarySuccess {
  type: 'ADD_ENTITY_TO_LIBRARY_SUCCESS';
  payload: {
    entity: IEntity;
    entryPoint: EntryPoints;
  };
}

export interface addEntitiesToLibrarySuccess {
  type: 'ADD_ENTITIES_TO_LIBRARY_SUCCESS';
  payload: {
    entities: IEntity[];
    entryPoint: EntryPoints;
  };
}

export interface updateMenu {
  type: 'UPDATE_MENU';
  payload: {
    tournamentData: ITournamentData;
  };
}

export interface addTeamsInProgress {
  type: 'ADD_TEAMS_IN_PROGRESS';
}

export interface addTeamsSuccess {
  type: 'ADD_TEAMS_SUCCESS';
  payload: ITeam[];
}

export interface addTeamsFailure {
  type: 'ADD_TEAMS_FAILURE';
}

export type AuthPageAction =
  | loadAuthPageDataStart
  | loadAuthPageDataSuccess
  | cleatAuthPageData
  | publishEventSuccess
  | addEntityToLibrarySuccess
  | addEntitiesToLibrarySuccess
  | publishGameCountSuccess
  | updateMenu
  | addTeamsInProgress
  | addTeamsSuccess
  | addTeamsFailure;
