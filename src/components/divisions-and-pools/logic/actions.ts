import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as Yup from 'yup';
import {
  DIVISIONS_TEAMS_FETCH_START,
  DIVISIONS_TEAMS_FETCH_SUCCESS,
  DIVISIONS_TEAMS_FETCH_FAILURE,
  POOLS_FETCH_SUCCESS,
  FETCH_DETAILS_START,
  ADD_DIVISION_SUCCESS,
  UPDATE_DIVISION_SUCCESS,
  DELETE_DIVISION_SUCCESS,
  DELETE_ALL_DIVISIONS_SUCCESS,
  ADD_POOL_SUCCESS,
  REGISTRATION_FETCH_SUCCESS,
  DIVISION_SAVE_SUCCESS,
  ALL_POOLS_FETCH_SUCCESS,
  UPDATE_TEAMS_SUCCESS,
  SAVE_TEAMS_FAILURE,
  EDIT_POOL_SUCCESS,
  EDIT_POOL_FAILURE,
  DELETE_POOL_SUCCESS,
  DELETE_POOL_FAILURE,
  ADD_NEW_POOL_IN_PROGRESS,
  ADD_NEW_POOL_SUCCESS,
  ADD_NEW_POOL_FAILURE,
} from './actionTypes';
import api from 'api/api';
import history from 'browserhistory';
import { divisionSchema, poolSchema, teamSchema } from 'validations';
import { Toasts } from 'components/common';
import { getVarcharEight } from 'helpers';
import { IPool, ITeam, IDivision, BindingAction } from 'common/models';
import { IAppState } from 'reducers/root-reducer.types';
import { EntryPointsWithId } from 'common/enums';
import { PoolColorMatching } from '../division/auto-generate-pools-popup/consts';
import { getAllDatesFromInterval } from '../division/auto-generate-divisions-popup/helper';

export const divisionsTeamsFetchStart = (): { type: string } => ({
  type: DIVISIONS_TEAMS_FETCH_START,
});

export const fetchDetailsStart = (): { type: string } => ({
  type: FETCH_DETAILS_START,
});

export const divisionsTeamsFetchSuccess = (
  divisions: IDivision[],
  teams: ITeam[]
): { type: string; payload: { divisions: IDivision[]; teams: ITeam[] } } => ({
  type: DIVISIONS_TEAMS_FETCH_SUCCESS,
  payload: {
    divisions,
    teams,
  },
});

export const divisionsFetchFailure = (): { type: string } => ({
  type: DIVISIONS_TEAMS_FETCH_FAILURE,
});

export const addDivisionSuccess = (
  payload: IDivision
): { type: string; payload: IDivision } => ({
  type: ADD_DIVISION_SUCCESS,
  payload,
});

export const updateDivisionSuccess = (
  payload: IDivision
): { type: string; payload: IDivision } => ({
  type: UPDATE_DIVISION_SUCCESS,
  payload,
});

export const deleteDivisionSuccess = (
  payload: string
): { type: string; payload: string } => ({
  type: DELETE_DIVISION_SUCCESS,
  payload,
});

export const deleteAllDivisionsSuccess = (): { type: string } => ({
  type: DELETE_ALL_DIVISIONS_SUCCESS,
});

export const addPoolSuccess = (
  payload: IPool
): { type: string; payload: IPool } => ({
  type: ADD_POOL_SUCCESS,
  payload,
});

export const poolsFetchSuccess = (
  payload: IPool[]
): { type: string; payload: IPool[] } => ({
  type: POOLS_FETCH_SUCCESS,
  payload,
});

export const allPoolsFetchSuccess = (
  payload: IPool[]
): { type: string; payload: IPool[] } => ({
  type: ALL_POOLS_FETCH_SUCCESS,
  payload,
});

export const registrationFetchSuccess = (
  payload: any
): { type: string; payload: any } => ({
  type: REGISTRATION_FETCH_SUCCESS,
  payload,
});

export const getDivisionsTeams: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (eventId: string) => async (dispatch: Dispatch) => {
  dispatch(divisionsTeamsFetchStart());

  const divisions = await api.get(`/divisions?event_id=${eventId}`);
  const teams = await api.get(`/teams?event_id=${eventId}`);

  dispatch(divisionsTeamsFetchSuccess(divisions, teams));
};

export const getPools: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (divisionId: string) => async (dispatch: Dispatch) => {
  dispatch(fetchDetailsStart());

  const data = await api.get(`/pools?division_id=${divisionId}`);
  dispatch(poolsFetchSuccess(data));
};

export const getAllPools: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (divisionIds: string[]) => async (dispatch: Dispatch) => {
  dispatch(fetchDetailsStart());
  const pools: any[] = [];
  await Promise.all(
    divisionIds.map(async item => {
      const response = await api.get(`/pools?division_id=${item}`);
      pools.push(response);
    })
  );
  dispatch(allPoolsFetchSuccess(pools.flat()));
};

export const updateDivision: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (division: IDivision) => async (dispatch: Dispatch) => {
  try {
    const allDivisions = await api.get(
      `/divisions?event_id=${division.event_id}`
    );

    await Yup.array()
      .of(divisionSchema)
      .unique(
        division => division.long_name,
        'Oops. It looks like you already have division with the same long name. The division must have a unique long name.'
      )
      .unique(
        division => division.short_name,
        'Oops. It looks like you already have division with the same short name. The division must have a unique short name.'
      )
      .validate(
        allDivisions.map((it: IDivision) =>
          it.division_id === division.division_id ? division : it
        )
      );

    const response = await api.put(
      `/divisions?division_id=${division.division_id}`,
      division
    );

    dispatch(updateDivisionSuccess(division));

    if (response?.errorType === 'Error') {
      return Toasts.errorToast("Couldn't update a division");
    }

    history.goBack();

    Toasts.successToast('Division is successfully updated');
  } catch (err) {
    Toasts.errorToast(err.message);
  }
};

export const saveDivisionsSuccess = (divisions: IDivision[]) => ({
  type: DIVISION_SAVE_SUCCESS,
  payload: divisions,
});

export const saveDivisions: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (divisions: IDivision[], eventId: string) => async (
  dispatch: Dispatch
) => {
  try {
    const allDivisions = await api.get(`/divisions?event_id=${eventId}`);

    await Yup.array()
      .of(divisionSchema)
      .unique(
        division => division.long_name,
        'Oops. It looks like you already have division with the same long name. The division must have a unique long name.'
      )
      .unique(
        division => division.short_name,
        'Oops. It looks like you already have division with the same short name. The division must have a unique short name.'
      )
      .validate([...allDivisions, ...divisions]);

    for await (const division of divisions) {
      const data = {
        ...division,
        event_id: eventId,
        division_id: getVarcharEight(),
      };

      await divisionSchema.validate(division);

      const response = await api.post(`/divisions`, data);

      dispatch(addDivisionSuccess(data));

      if (response?.errorType === 'Error') {
        return Toasts.errorToast("Couldn't add a division");
      }
    }

    dispatch(saveDivisionsSuccess(divisions));

    history.push(`/event/divisions-and-pools/${eventId}`);

    Toasts.successToast('Division is successfully added');
  } catch (err) {
    Toasts.errorToast(err.message);
  }
};

export const deleteDivision: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (divisionId: string, pools: IPool[], teams: ITeam[]) => async (
  dispatch: Dispatch
) => {
  await api.delete('/pools', pools);
  await api.delete('teams', teams);

  const response = await api.delete(`/divisions?division_id=${divisionId}`);

  if (response?.errorType === 'Error') {
    return Toasts.errorToast("Couldn't delete a division");
  }

  dispatch(deleteDivisionSuccess(divisionId));

  history.goBack();

  Toasts.successToast('Division is successfully deleted');
};

export const deleteAllDivisions: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (divisions: IDivision[], pools: IPool[], teams: ITeam[]) => async (
  dispatch: Dispatch
) => {
  if (pools.length) {
    await api.delete('/pools', pools);
  }
  if (teams.length) {
    await api.delete('teams', teams);
  }

  const response = await Promise.all(
    divisions.map(division =>
      api.delete(`/divisions?division_id=${division.division_id}`)
    )
  );

  if (response.some(res => res && res.errorType === 'Error')) {
    return Toasts.errorToast("Couldn't delete divisions");
  }

  dispatch(deleteAllDivisionsSuccess());

  Toasts.successToast('Divisions are successfully deleted');
};

export const savePool: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (pool: IPool) => async (dispatch: Dispatch) => {
  try {
    const data = {
      ...pool,
      pool_id: getVarcharEight(),
    };
    const allPools = await api.get(`/pools?division_id=${pool.division_id}`);

    await Yup.array()
      .of(poolSchema)
      .unique(
        pool => pool.pool_name,
        'Oops. It looks like you already have pool with the same name. The pool must have a unique name.'
      )
      .validate([...allPools, data]);

    const response = await api.post(`/pools`, data);

    if (response?.errorType === 'Error') {
      return Toasts.errorToast("Couldn't add a pool division");
    }

    dispatch(addPoolSuccess(data));

    Toasts.successToast('Pool is successfully added');
  } catch (err) {
    Toasts.errorToast(err.message);
  }
};

export const editPool: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (editedPool: IPool, pools: IPool[]) => async (dispatch: Dispatch) => {
  try {
    const mappedPools = pools.map(it =>
      it.pool_id === editedPool.pool_id ? editedPool : it
    );

    await Yup.array()
      .of(poolSchema)
      .unique(
        pool => pool.pool_name,
        'Oops. It looks like you already have pool with the same name. The pool must have a unique name.'
      )
      .validate(mappedPools);

    await api.put(
      `${EntryPointsWithId.POOLS}${editedPool.pool_id}`,
      editedPool
    );

    dispatch({
      type: EDIT_POOL_SUCCESS,
      payload: {
        pool: editedPool,
      },
    });

    Toasts.successToast('Pool is successfully changed');
  } catch (err) {
    dispatch({
      type: EDIT_POOL_FAILURE,
    });

    Toasts.successToast(err.message);
  }
};

export const deletePool: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (deletedPool: IPool, unassignedTeams: ITeam[]) => async (
  dispatch: Dispatch
) => {
  try {
    await api.delete(`${EntryPointsWithId.POOLS}${deletedPool.pool_id}`);

    await Promise.all(
      unassignedTeams.map(it =>
        api.put(`${EntryPointsWithId.TEAMS}${it.team_id}`, it)
      )
    );

    dispatch({
      type: DELETE_POOL_SUCCESS,
      payload: {
        deletedPool,
        unassignedTeams,
      },
    });

    Toasts.successToast('Pool is successfully deleted');
  } catch (err) {
    dispatch({
      type: DELETE_POOL_FAILURE,
    });

    Toasts.successToast(err.message);
  }
};

export const getRegistration: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (eventId: string) => async (dispatch: Dispatch) => {
  const data = await api.get(`/registrations?event_id=${eventId}`);
  dispatch(registrationFetchSuccess(data));
};

export const saveTeams = (teams: ITeam[]) => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  try {
    const { data } = getState().divisions;

    for await (let division of data!) {
      await Yup.array()
        .of(teamSchema)
        .unique(
          team => team.long_name,
          'Oops. It looks like you already have team with the same long name. The team must have a unique long name.'
        )
        //        .unique(
        //          team => team.short_name,
        //          'Oops. It looks like you already have team with the same short name. The team must have a unique short name.'
        //        )
        .validate(
          teams.filter(team => team.division_id === division.division_id)
        );
    }

    for await (let team of teams) {
      if (team.isDelete) {
        await api.delete(`/teams?team_id=${team.team_id}`);
      }

      if (team.isChange && !team.isDelete) {
        delete team.isChange;

        await api.put(`/teams?team_id=${team.team_id}`, team);
      }
    }

    const newTeams = await api.get(`/teams?event_id=${teams[0].event_id}`);

    dispatch({
      type: UPDATE_TEAMS_SUCCESS,
      payload: {
        teams: newTeams,
      },
    });

    Toasts.successToast('Teams saved successfully');
  } catch (err) {
    dispatch({
      type: SAVE_TEAMS_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

export const createDivisions: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (divisions: IDivision[], cb: BindingAction) => async (
  dispatch: Dispatch
) => {
  try {
    const allDivisions = await api.get(
      `/divisions?event_id=${divisions[0].event_id}`
    );
    for (const division of divisions) {
      await Yup.array()
        .of(divisionSchema)
        .unique(
          div => div.long_name,
          'You already have a division with the same long name. The division must have a unique long name.'
        )
        .unique(
          div => div.short_name,
          'You already have division with the same short name. The division must have a unique short name.'
        )
        .validate([...allDivisions, division]);
    }
    for (const division of divisions) {
      await api.post('/divisions', division);
      dispatch(addDivisionSuccess(division));
    }

    dispatch(saveDivisionsSuccess(divisions));

    const successMsg = `Divisions are successfully created (${divisions.length})`;
    Toasts.successToast(successMsg);
    cb();
  } catch (err) {
    const invalidDivision = err.value[err.value.length - 1];
    const index = divisions.findIndex(
      division => division.division_id === invalidDivision.division_id
    );
    const errMessage = `Record ${index + 1}: ${err.message}`;
    return Toasts.errorToast(errMessage);
  }
};

export const addNewPool = (newPool: IPool) => async(dispatch: Dispatch) => {
  dispatch({
    type: ADD_NEW_POOL_IN_PROGRESS,
  });

  const response = await api.post(`/pools`, newPool);

  if (response?.errorType === 'Error') {
    dispatch({
      type: ADD_NEW_POOL_FAILURE,
    });
    return;
  }

  dispatch({
    type: ADD_NEW_POOL_SUCCESS,
    payload: newPool
  })
}

export const generateDivisions = (
  eventId: string,
  divisionsYears: number | number[],
) => async(dispatch: Dispatch) => {
  dispatch(divisionsTeamsFetchStart());
  
  const allDates = getAllDatesFromInterval(divisionsYears[0], divisionsYears[1]);
  const divisions = allDates.map((div: string, index) => {
    return {
      division_id: getVarcharEight(),
      event_id: eventId,
      long_name: div,
      short_name: div,
      division_hex: index < 10 ? PoolColorMatching[index].hex : '1c315f',
    };
  });

  const response = await api.post(`/divisions`, divisions);
  if (response?.errorType === 'Error') {
    return Toasts.errorToast('Can\'t post divisions.');
  }

  Toasts.successToast('Divisions are successfully created.');

  const currentDivisions = await api.get(`/divisions?event_id=${eventId}`);
  dispatch(saveDivisionsSuccess(currentDivisions));
}

export const generatePools = (
  divisions: IDivision[],
  count: number,
  names: string[],
  isDeleteAllPools: boolean
) => async(dispatch: Dispatch) => {
  dispatch(fetchDetailsStart());

  if (isDeleteAllPools && divisions) {

    await Promise.all(
      divisions.map(async (it: IDivision) => {
        const pools = await api.get(`/pools?division_id=${it.division_id}`);
        await api.delete(`/pools`, pools);

        const currentTeams =  await api.get(`/teams?division_id=${it.division_id}`);
        const unassignedTeams = currentTeams.map((team: ITeam) => {
          team.pool_id = null;
          return team;
        });
        await api.put(`/teams`, unassignedTeams);
      })
    );

    const newTeams = await api.get(`/teams?event_id=${divisions[0].event_id}`);
    dispatch({
      type: UPDATE_TEAMS_SUCCESS,
      payload: {
        teams: newTeams,
      },
    });
  }

  await Promise.all(
    divisions.map(async (div: IDivision) => {
      const newPools: IPool[] = [];
      names.map((it, index) => {
        if(index < count) {
          newPools.push({
            pool_hex: PoolColorMatching[index].hex,
            division_id: div.division_id,
            pool_id: getVarcharEight(),
            pool_name: it,
          } as IPool);
        }
      });
    
      const response = await api.post(`/pools`, newPools);
    
      if (response?.errorType === 'Error') {
        return Toasts.errorToast('Can\'t post pools.');
      }
    })
  );

  const currentDivisions = await api.get(`/divisions?event_id=${divisions[0].event_id}`);
  const filteredPools: IPool[] = [];
  await Promise.all(
    currentDivisions.map(async (it: IDivision) => {
      const pools = await api.get(`/pools?division_id=${it.division_id}`);
      filteredPools.push(pools);
    })
  );

  dispatch(poolsFetchSuccess(filteredPools.flat()));
}
