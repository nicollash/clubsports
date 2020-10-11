import {
  ADD_TEAM,
  DELETE_TEAM,
  UPDATE_TEAM,
  TOGGLE_MULTIPLE_TEAMS,
  TeamAction,
} from './action-types';
import { ITeamItem } from 'common/models';
import { getVarcharEight } from 'helpers';

export interface ITeamsState {
  teams: ITeamItem[];
  multipleTeams: boolean;
}

const initialState = {
  teams: [{ id: getVarcharEight() }],
  multipleTeams: true,
};

const teamsReducer = (
  state: ITeamsState = initialState,
  action: TeamAction
) => {
  switch (action.type) {
    case TOGGLE_MULTIPLE_TEAMS: {
      return {
        ...state,
        multipleTeams: !state.multipleTeams,
      };
    }
    case ADD_TEAM: {
      const team = action.payload;

      const updatedTeams = [...state.teams, team];

      return {
        ...state,
        teams: updatedTeams,
      };
    }

    case UPDATE_TEAM: {
      const team = action.payload;

      const updatedTeams = state.teams.map(t => (t.id === team.id ? team : t));

      return {
        ...state,
        teams: updatedTeams,
      };
    }

    case DELETE_TEAM: {
      const team = action.payload;

      const updatedTeams = state.teams.filter(t => t.id !== team.id);

      return {
        ...state,
        teams: updatedTeams,
      };
    }

    default:
      return state;
  }
};

export default teamsReducer;
