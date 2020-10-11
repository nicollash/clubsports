import { ITeamItem } from 'common/models';
import { getVarcharEight } from 'helpers';
import {
  ADD_TEAM,
  DELETE_TEAM,
  UPDATE_TEAM,
  TOGGLE_MULTIPLE_TEAMS,
} from './action-types';

const addBlankTeam = (): { type: string; payload: ITeamItem } => ({
  type: ADD_TEAM,
  payload: { id: getVarcharEight() },
});

const addTeam = (payload: ITeamItem): { type: string; payload: ITeamItem } => ({
  type: ADD_TEAM,
  payload: { ...payload, id: getVarcharEight() },
});

const updateTeam = (
  payload: ITeamItem
): { type: string; payload: ITeamItem } => ({
  type: UPDATE_TEAM,
  payload,
});

const deleteTeam = (
  payload: ITeamItem
): { type: string; payload: ITeamItem } => ({
  type: DELETE_TEAM,
  payload,
});

const toggleMultipleTeams = (): { type: string } => ({
  type: TOGGLE_MULTIPLE_TEAMS,
});

export { deleteTeam, updateTeam, addBlankTeam, addTeam, toggleMultipleTeams };
