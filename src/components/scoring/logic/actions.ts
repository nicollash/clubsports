import { ThunkAction } from 'redux-thunk';
import { ActionCreator, Dispatch } from 'redux';
import * as Yup from 'yup';
import {
  TeamsAction,
  LOAD_SCORING_DATA_START,
  LOAD_SCORING_DATA_SUCCESS,
  LOAD_SCORING_DATA_FAILURE,
  LOAD_POOLS_START,
  LOAD_POOLS_SUCCESS,
  LOAD_POOLS_FAILURE,
  EDIT_TEAM_SUCCESS,
  EDIT_TEAM_FAILURE,
  DELETE_TEAM_SUCCESS,
  DELETE_TEAM_FAILURE,
} from './action-types';
import { IAppState } from 'reducers/root-reducer.types';
import Api from 'api/api';
import { teamSchema } from 'validations';
import {
  mapScheduleGamesWithNames,
  getTeamsWithResults,
  removeObjKeysByKeys,
} from 'helpers';
import {
  ITeam,
  ISchedule,
  ITeamWithResults,
  IFacility,
  IEventDetails,
} from 'common/models';
import { Toasts } from 'components/common';
import { ITeamFields, ScheduleStatuses } from 'common/enums';
import { getScoringSettings } from 'helpers/scoring';

const loadScoringData: ActionCreator<ThunkAction<
  void,
  {},
  null,
  TeamsAction
>> = (eventId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_SCORING_DATA_START,
    });

    const events = await Api.get(`events?event_id=${eventId}`);
    const divisions = await Api.get(`/divisions?event_id=${eventId}`);
    const schedules = await Api.get(`/schedules?event_id=${eventId}`);
    const publishedSchedule = schedules.find(
      (it: ISchedule) => it.is_published_YN === ScheduleStatuses.Published
    );
    const teams = await Api.get(`/teams?event_id=${eventId}`);
    const schedulesGames = await Api.get(
      `/games?schedule_id=${publishedSchedule.schedule_id}`
    );
    const facilities = await Api.get(`/facilities?event_id=${eventId}`);
    const fields = (
      await Promise.all(
        facilities.map((it: IFacility) =>
          Api.get(`/fields?facilities_id=${it.facilities_id}`)
        )
      )
    ).flat();
    const currentEvent: IEventDetails = events.find(
      (it: IEventDetails) => it.event_id === eventId
    );

    const scoringSettings = getScoringSettings(currentEvent);

    const mappedTeams = getTeamsWithResults(
      teams,
      schedulesGames,
      scoringSettings
    );
    const mappedGames = mapScheduleGamesWithNames(
      teams,
      fields,
      schedulesGames
    );

    dispatch({
      type: LOAD_SCORING_DATA_SUCCESS,
      payload: {
        divisions,
        teams: mappedTeams,
        games: mappedGames,
      },
    });
  } catch {
    dispatch({
      type: LOAD_SCORING_DATA_FAILURE,
    });
  }
};

const loadPools: ActionCreator<ThunkAction<void, {}, null, TeamsAction>> = (
  divisionId: string
) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_POOLS_START,
      payload: {
        divisionId,
      },
    });

    const pools = await Api.get(`/pools?division_id=${divisionId}`);

    dispatch({
      type: LOAD_POOLS_SUCCESS,
      payload: {
        divisionId,
        pools,
      },
    });
  } catch {
    dispatch({
      type: LOAD_POOLS_FAILURE,
    });
  }
};

const editTeam = (team: ITeamWithResults) => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  try {
    const clearTeam = removeObjKeysByKeys(
      team,
      Object.values(ITeamFields)
    ) as ITeam;
    const { teams } = getState().scoring;

    await Yup.array()
      .of(teamSchema)
      .unique(
        team => team.long_name,
        'Oops. It looks like you already have team with the same long name. The team must have a unique long name.'
      )
//      .unique(
//        team => team.short_name,
//        'Oops. It looks like you already have team with the same short name. The team must have a unique short name.'
//     )
      .validate(
        teams.reduce((acc, it) => {
          if (it.team_id === team.team_id) {
            return [...acc, clearTeam];
          }

          return it.division_id === team.division_id ? [...acc, it] : acc;
        }, [] as ITeam[])
      );

    await Api.put(`/teams?team_id=${team.team_id}`, clearTeam);

    const updatedTeam = { ...team, ...clearTeam };

    dispatch({
      type: EDIT_TEAM_SUCCESS,
      payload: {
        team: updatedTeam,
      },
    });

    Toasts.successToast('Teams saved successfully');
  } catch (err) {
    dispatch({
      type: EDIT_TEAM_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

const deleteTeam: ActionCreator<ThunkAction<void, {}, null, TeamsAction>> = (
  teamId: string
) => async (dispatch: Dispatch) => {
  try {
    await Api.delete(`/teams?team_id=${teamId}`);

    dispatch({
      type: DELETE_TEAM_SUCCESS,
      payload: {
        teamId,
      },
    });
  } catch {
    dispatch({
      type: DELETE_TEAM_FAILURE,
    });
  }
};

export { loadScoringData, loadPools, editTeam, deleteTeam };
