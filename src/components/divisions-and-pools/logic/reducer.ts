import {
  DIVISIONS_TEAMS_FETCH_START,
  DIVISIONS_TEAMS_FETCH_SUCCESS,
  DIVISIONS_TEAMS_FETCH_FAILURE,
  POOLS_FETCH_SUCCESS,
  FETCH_DETAILS_START,
  ADD_DIVISION_SUCCESS,
  DIVISION_SAVE_SUCCESS,
  UPDATE_DIVISION_SUCCESS,
  DELETE_DIVISION_SUCCESS,
  DELETE_ALL_DIVISIONS_SUCCESS,
  ADD_POOL_SUCCESS,
  REGISTRATION_FETCH_SUCCESS,
  ALL_POOLS_FETCH_SUCCESS,
  UPDATE_TEAMS_SUCCESS,
  EDIT_POOL_SUCCESS,
  DELETE_POOL_SUCCESS,
  DivisionsPoolsAction,
  ADD_NEW_POOL_SUCCESS,
} from './actionTypes';
import {
  ADD_ENTITIES_TO_LIBRARY_SUCCESS,
  AuthPageAction,
} from 'components/authorized-page/authorized-page-event/logic/action-types';
import { sortByField } from 'helpers';
import { IPool, ITeam, IDivision, IRegistration } from 'common/models';
import { SortByFilesTypes, EntryPoints } from 'common/enums';
import { mapTeamWithUnassignedTeams } from '../helpers';

export interface IDivisionAndPoolsState {
  data: IDivision[];
  pools: IPool[];
  teams: ITeam[];
  registration?: IRegistration;
  isLoading: boolean;
  areDetailsLoading: boolean;
  error: boolean;
}

const defaultState: IDivisionAndPoolsState = {
  data: [],
  pools: [],
  teams: [],
  registration: undefined,
  isLoading: true,
  areDetailsLoading: true,
  error: false,
};

export default (
  state = defaultState,
  action:
    | { type: string; payload?: any }
    | AuthPageAction
    | DivisionsPoolsAction
) => {
  switch (action.type) {
    case DIVISIONS_TEAMS_FETCH_START: {
      return { ...defaultState };
    }
    case FETCH_DETAILS_START: {
      return { ...state, pools: [], areDetailsLoading: true };
    }
    case DIVISIONS_TEAMS_FETCH_SUCCESS: {
      const { divisions, teams } = action.payload;

      return {
        ...state,
        data: sortByField(divisions, SortByFilesTypes.DIVISIONS),
        isLoading: false,
        error: false,
        teams,
      };
    }
    case DIVISIONS_TEAMS_FETCH_FAILURE: {
      return {
        ...state,
        isLoading: false,
        error: true,
      };
    }
    case DIVISION_SAVE_SUCCESS: {
      return {
        ...state,
        data: sortByField(action.payload, SortByFilesTypes.DIVISIONS),
        isLoading: false,
        error: false,
      };
    }
    case ADD_DIVISION_SUCCESS: {
      return {
        ...state,
        data: [...state.data, action.payload],
        isLoading: false,
        error: false,
      };
    }
    case UPDATE_DIVISION_SUCCESS: {
      return {
        ...state,
        data: [
          ...state.data?.map(division =>
            division.division_id === action.payload.division_id
              ? action.payload
              : division
          ),
        ],
        isLoading: false,
        error: false,
      };
    }
    case DELETE_DIVISION_SUCCESS: {
      return {
        ...state,
        data: [
          ...state.data?.filter(
            division => division.division_id !== action.payload
          ),
        ],
        isLoading: false,
        error: false,
      };
    }
    case DELETE_ALL_DIVISIONS_SUCCESS: {
      return {
        ...state,
        data: [],
        isLoading: false,
        error: false,
      };
    }
    case ADD_POOL_SUCCESS: {
      return {
        ...state,
        pools: [...state.pools, action.payload],
        isLoading: false,
        error: false,
      };
    }
    case POOLS_FETCH_SUCCESS: {
      return {
        ...state,
        pools: [...state.pools, ...action.payload],
        error: false,
        areDetailsLoading: false,
      };
    }
    case ALL_POOLS_FETCH_SUCCESS:
      return {
        ...state,
        pools: action.payload,
        error: false,
      };
    case REGISTRATION_FETCH_SUCCESS: {
      return {
        ...state,
        registration: action.payload[0],
        isLoading: false,
        error: false,
      };
    }
    case UPDATE_TEAMS_SUCCESS: {
      const { teams } = action.payload;

      return {
        ...state,
        teams,
      };
    }
    case ADD_ENTITIES_TO_LIBRARY_SUCCESS: {
      const { entities, entryPoint } = action.payload;

      if (entryPoint === EntryPoints.DIVISIONS) {
        const updatedDivisions = entities as IDivision[];

        const divisions = state.data?.map(division => {
          const updatedDivision = updatedDivisions.find(
            it => it.division_id === division.division_id
          );

          return updatedDivision ? updatedDivision : division;
        });

        return {
          ...state,
          data: divisions,
        };
      } else {
        return state;
      }
    }
    case EDIT_POOL_SUCCESS: {
      const { pool } = action.payload;

      return {
        ...state,
        pools: state.pools.map(it => (it.pool_id === pool.pool_id ? pool : it)),
      };
    }
    case DELETE_POOL_SUCCESS: {
      const { deletedPool, unassignedTeams } = action.payload;
      const mappedTeam = mapTeamWithUnassignedTeams(
        state.teams,
        unassignedTeams
      );

      return {
        ...state,
        pools: state.pools.filter(it => it.pool_id !== deletedPool.pool_id),
        teams: mappedTeam,
      };
    }
    case ADD_NEW_POOL_SUCCESS: {
      return {
        ...state,
        pools: [...state.pools, action.payload]
      }
    }
    default:
      return state;
  }
};
