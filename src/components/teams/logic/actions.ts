import { ThunkAction } from "redux-thunk";
import { ActionCreator, Dispatch } from "redux";
import * as Yup from "yup";
import { IAppState } from "reducers/root-reducer.types";
import Api from "api/api";
import { teamSchema, playerSchema, coacheSchema } from "validations";
import { mapScheduleGamesWithNames, getVarcharEight } from "helpers";
import history from "browserhistory";
import { ScheduleStatuses } from "common/enums";
import { Toasts } from "components/common";
import { ITeamsRegister } from "common/models/register";
import {
  IGame,
  ITeam,
  IPlayer,
  ICoache,
  IDivision,
  IFacility,
  ISchedule,
  IGameBracket,
  ISchedulesDetails,
  IPool,
} from "common/models";
import {
  TeamsAction,
  LOAD_TEAMS_DATA_START,
  LOAD_TEAMS_DATA_SUCCESS,
  LOAD_TEAMS_DATA_FAILURE,
  LOAD_POOLS_START,
  LOAD_POOLS_SUCCESS,
  LOAD_POOLS_FAILURE,
  SAVE_TEAMS_SUCCESS,
  SAVE_TEAMS_FAILURE,
  CREATE_COACHES_SUCCESS,
  SAVE_COACHES_SUCCESS,
  DELETE_COACHE_SUCCESS,
  CREATE_TEAMS_SUCCESS,
  CREATE_PLAYERS_SUCCESS,
  SAVE_PLAYER_SUCCESS,
  DELETE_PLAYER_SUCCESS,
  CHECK_DELETE_TEAM_START,
  CHECK_DELETE_TEAM_SUCCESS,
  DELETE_TEAM_SUCCESS,
  CANCELED_DELETE,
} from "./action-types";

const loadTeamsData: ActionCreator<ThunkAction<void, {}, null, TeamsAction>> = (
  eventId: string
) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LOAD_TEAMS_DATA_START,
    });

    const divisions = await Api.get(`/divisions?event_id=${eventId}`);
    const teams = await Api.get(`/teams?event_id=${eventId}`);
    const facilities = await Api.get(`/facilities?event_id=${eventId}`);
    const fields = (
      await Promise.all(
        facilities.map((it: IFacility) =>
          Api.get(`/fields?facilities_id=${it.facilities_id}`)
        )
      )
    ).flat();
    const schedules = await Api.get(`/schedules?event_id=${eventId}`);
    const publishedSchedule = schedules.find(
      (it: ISchedule) => it.is_published_YN === ScheduleStatuses.Published
    );

    const schedulesGames = publishedSchedule
      ? await Api.get(`/games?schedule_id=${publishedSchedule.schedule_id}`)
      : [];

    const mappedGames = mapScheduleGamesWithNames(
      teams,
      fields,
      schedulesGames
    );

    const players = await Api.get(`/teams_players_events?event_id=${eventId}`);

    const coaches = await Api.get(`/teams_contacts`);

    dispatch({
      type: LOAD_TEAMS_DATA_SUCCESS,
      payload: {
        schedules,
        divisions,
        teams,
        players,
        coaches,
        games: mappedGames,
      },
    });
  } catch {
    dispatch({
      type: LOAD_TEAMS_DATA_FAILURE,
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

const saveTeams = (teams: ITeam[], cb?: (param?: object) => void) => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  try {
    const { divisions, coaches } = getState().teams;
    let currentCoaches = coaches;
    for await (const division of divisions) {
      await Yup.array()
        .of(teamSchema)
        .unique(
          (team) => team.long_name,
          "Oops! It looks like you already have team in that division with the same long name. The team must have a unique long name within a division."
        )
        .validate(
          teams.filter((team) => team.division_id === division.division_id)
        );
    }

    const currentTeams: ITeam[] = [];

    let progress = 0;
    let isDeleted = false;
    let isChanged = false;
    for await (const team of teams) {
      if (team.isDelete) {
        await Api.delete(`/teams?team_id=${team.team_id}`);
        // Remove connection from registrants
        let registrants = await Api.get(
          `/reg_responses_teams?team_id=${team.team_id}`
        );
        if (registrants.length > 0) {
          registrants = registrants.map((registrant: ITeamsRegister) => ({
            ...registrant,
            team_id: null,
          }));
          await Api.put(`/reg_responses_teams`, registrants);
        }
        const deletedDivisionName = divisions.find((it) => it.division_id === team.division_id)?.long_name;
        const deletedCoaches = coaches.filter(
          (it) => (it.division_name === deletedDivisionName &&
                 it.team_name === team.long_name) 
        )
        for (let index = 0; index < deletedCoaches.length; index ++) {
          const deleteCoache = deletedCoaches[index];
          await Api.delete(`/teams_contacts?team_contact_id=${deleteCoache.team_contact_id}`);
          currentCoaches.splice(index,1);
        }
        isDeleted = true;
      } else {
        currentTeams.push(team);
      }

      if (team.isChange && !team.isDelete) {
        delete team.isChange;
        await Api.put(`/teams?team_id=${team.team_id}`, team);
        isChanged = true;
      }
      progress += 1;

      if (cb) {
        cb({
          type: "progress",
          data: [
            {
              status: "Deleting Existing Teams...",
              msg: `${progress / teams.length}`,
            },
          ],
        });
      }
    }

    dispatch({
      type: SAVE_TEAMS_SUCCESS,
      payload: {
        teams: currentTeams,
      },
    });

    dispatch({
      type: SAVE_COACHES_SUCCESS,
      payload: {
        coaches: currentCoaches,
      },
    });

    if (isDeleted && !isChanged) Toasts.successToast("Teams deleted successfully");
    else Toasts.successToast("Teams saved successfully");

  } catch (err) {
    dispatch({
      type: SAVE_TEAMS_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

const saveTeamContact = (contactId: string, team: ITeam, cb?: (param?: object) => void) => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  try {
    const { divisions, teams, coaches } = getState().teams;
    const coache = coaches.find((it) => it.team_contact_id === contactId);
    if (!coache) {
      Toasts.errorToast('Not Found Contact name');
      return;
    }

    let division_name_changed = '' ;
    let team_name_index = -1 ;
    for await (const division of divisions) {
      if (team.division_id === division.division_id) {
       division_name_changed = division.long_name;
       const findTeams = teams.filter((it) => it.division_id === division.division_id);
       team_name_index = findTeams.findIndex((it) => it.long_name === team.long_name);
      }
    }
    if (division_name_changed === '') {
      Toasts.errorToast('Not Found Division name');
      return;
    };
    if (team_name_index < 0) {
      Toasts.errorToast('Not Found Team name');
      return;
    }

    await Yup.array()
      .of(coacheSchema)
      .unique(
        (coache) => `${coache.first_name}_${coache.last_name}`,
        "Oops! It looks like you already have team in that division with the same long name. The team must have a unique long name within a division."
      )
      .validate(
        coaches.filter((it) => (it.division_name ===division_name_changed &&
                                it.team_name ===team.long_name
                      ))      
      );

    const currentTeams: ITeam[] = teams;
    const currentCoaches: ICoache[] = coaches;

    let progress = 0;
    let isDeleted = false;
    let isChanged = false;
    if (team.isDelete) { 
      await Api.delete(`/teams_contacts?team_contact_id=${contactId}`);
      const index = coaches.findIndex(it => it.team_contact_id === contactId)
      if (index) currentCoaches.splice(index,1);
      isDeleted = true;
      delete team.isDelete;
    }
    
    if (team.isChange && !team.isDelete) {
      const updated_coache: ICoache = {
        ...coache,
        division_name: division_name_changed,
        team_name: team.long_name ? team.long_name : '',
        first_name: team.contact_first_name ? team.contact_first_name : '',
        last_name: team.contact_last_name ? team.contact_last_name : '',
        phone_num: team.phone_num,
        contact_email: team.contact_email,
      };
      delete team.isChange;
      await Api.put(`/teams_contacts?team_contact_id=${contactId}`, updated_coache);
      const index = coaches.findIndex(it => it.team_contact_id === contactId)
      if (index) {
        currentCoaches[index] = updated_coache;
      }

      isChanged = true;
    }

    if (cb) {
      cb({
        type: "progress",
        data: [
          {
            status: "Processing ...",
            msg: `${progress / 1}`,
          },
        ],
      });
    }
    dispatch({
      type: SAVE_COACHES_SUCCESS,
      payload: {
        coaches: currentCoaches,
      },
    });

    dispatch({
      type: SAVE_TEAMS_SUCCESS,
      payload: {
        teams: currentTeams,
      },
    });

    if (isDeleted && !isChanged) Toasts.successToast("Team contact deleted successfully");
    else Toasts.successToast("Team contact saved successfully");

  } catch (err) {
    dispatch({
      type: SAVE_TEAMS_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

const setTeamFieldsToNull = (arr: any, teamId: string) => {
  const updatedArr: any = [];
  arr.map((item: any) => {
    if (item.away_team_id === teamId) {
      item.away_team_id = null;
      item.updated_datetime = new Date().toISOString();
      updatedArr.push(item);
    }
    if (item.home_team_id === teamId) {
      item.home_team_id = null;
      item.updated_datetime = new Date().toISOString();
      updatedArr.push(item);
    }
  });
  return updatedArr;
};

export const createTeams: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (teams: Partial<ITeam>[], eventId: string) => async () => {
  try {
    const allTeams = await Api.get(`/teams?event_id=${eventId}`);
    const mappedDivisionTeams = Object.values(
      [...allTeams, ...teams].reduce((acc, it: ITeam) => {
        const divisionId = it.division_id;
        const mappedTeam = {
          ...it,
          phone_num: it.phone_num ? it.phone_num : "",
        };

        acc[divisionId] = [...(acc[divisionId] || []), mappedTeam];

        return acc;
      }, {})
    );

    for await (const mappedTeams of mappedDivisionTeams) {
      await Yup.array()
        .of(teamSchema)
        .unique(
          (team) => team.long_name,
          "Oops. It looks like you already have team with the same long name. The team must have a unique long name."
        )
        .validate(mappedTeams);
    }

    for await (const team of teams) {
      const data = {
        ...team,
        event_id: eventId,
        team_id: getVarcharEight(),
      };

      const response = await Api.post(`/teams`, data);

      if (response?.errorType === "Error" || response?.message === false) {
        return Toasts.errorToast("Couldn't create a team");
      }
    }

    history.goBack();

    Toasts.successToast("The Team(s) have been successfully created!");
  } catch (err) {
    Toasts.errorToast(err.message);
  }
};

const checkTeamInSchedule = (teamId: string, eventId: string) => async (
  dispatch: Dispatch
) => {
  dispatch({
    type: CHECK_DELETE_TEAM_START,
  });

  const updatedGames: IGame[] = [];
  const schedulesDetails: ISchedulesDetails[][] = [];
  const updatedGameBrackets: IGameBracket[] = [];
  const schedulesInfo: object[] = [];
  const schedulesIdSet = new Set();
  const schedulesNamesSet = new Set();

  const schedules = await Api.get(`/schedules?event_id=${eventId}`);

  schedules.map((schedule: ISchedule) => {
    schedulesInfo.push({
      scheduleId: schedule.schedule_id,
      scheduleName: schedule.schedule_name,
    });
  });

  const schedulesDetailsResp = await Promise.all(
    schedulesInfo.map(
      async (schedule: any) =>
        await Api.get(`/schedules_details?schedule_id=${schedule.scheduleId}`)
    )
  );
  const gamesResp = await Promise.all(
    schedulesInfo.map(
      async (schedule: any) =>
        await Api.get(`/games?schedule_id=${schedule.scheduleId}`)
    )
  );
  const gamesBracketsResp = await Api.get(
    `/v_brackets_details?event_id=${eventId}`
  );

  schedulesDetailsResp.map((schedule) => {
    const newSchedulesDetails = setTeamFieldsToNull(schedule, teamId);

    if (newSchedulesDetails.length > 0) {
      schedulesDetails.push(newSchedulesDetails);
    }
  });

  schedulesDetails.map((scheduleArr: ISchedulesDetails[]) => [
    scheduleArr.map((details: ISchedulesDetails) => {
      schedulesIdSet.add(details.schedule_id);
    }),
  ]);

  gamesResp.map((gameArr) => {
    const newUpdatedGames = setTeamFieldsToNull(gameArr, teamId);
    if (newUpdatedGames.length > 0) {
      updatedGames.push(newUpdatedGames);
    }
  });

  const newUpdatedGameBrackets = setTeamFieldsToNull(gamesBracketsResp, teamId);
  if (newUpdatedGameBrackets.length > 0) {
    updatedGameBrackets.push(newUpdatedGameBrackets);
  }

  schedulesInfo.map((schedule: any) => {
    for (const id of schedulesIdSet) {
      if (schedule.scheduleId === id) {
        schedulesNamesSet.add(schedule.scheduleName);
      }
    }
  });

  const schedulesNames = Array.from(schedulesNamesSet);
  const schedulesId = Array.from(schedulesIdSet);

  dispatch({
    type: CHECK_DELETE_TEAM_SUCCESS,
    payload: {
      schedulesId,
      updatedGames,
      schedulesNames,
      schedulesDetails,
      updatedGameBrackets,
    },
  });
};

const deleteTeam = () => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  const schedulesDetails = getState().teams.schedulesDetails;
  const games = getState().teams.updatedGames;
  const gamesBrackets = getState().teams.updatedGameBrackets;

  if (schedulesDetails.length !== 0) {
    await Promise.all(
      schedulesDetails.map((schedule) =>
        Api.put(
          `/schedules_details?schedule_id=${schedule.schedule_id}`,
          schedule
        )
      )
    );
  }

  if (games.length !== 0) {
    await Promise.all(games.map((game) => Api.put(`/games`, game)));
  }

  if (gamesBrackets.length !== 0) {
    await Promise.all(
      gamesBrackets.map((bracket) => Api.put(`/brackets_details`, bracket))
    );
  }

  dispatch({
    type: DELETE_TEAM_SUCCESS,
  });
};

const canceledDelete = () => async (dispatch: Dispatch) => {
  dispatch({
    type: CANCELED_DELETE,
  });
};

export const createPlayers = (players: Partial<IPlayer>[]) => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  try {
    await Yup.array().of(playerSchema).validate(players);

    for await (const player of players) {
      // check if user selected correct division.
      const selectedDivision = getState().teams.divisions.find(
        (division) => division.short_name === player.division_name
      );
      if (!selectedDivision) {
        throw { message: "Division Should be selected" };
      }

      // check if user selected available team.
      const filteredTeamByDivision = getState().teams.teams.filter(
        (team) => team.division_id === selectedDivision.division_id
      );
      const selectedTeam = filteredTeamByDivision.find(
        (team) => team.short_name === player.team_name
      );
      if (!selectedTeam) {
        throw {
          message: `There is a team in the csv file named the ${player.team_name}. But that team doesn't exist in the division specified. Please add the team first and try to import again.`,
        };
      }

      // post player data
      const data = {
        team_id: selectedTeam.team_id,
        player_id: getVarcharEight(),
        reg_response_id: getVarcharEight(),
        first_name: player.first_name,
        last_name: player.last_name,
        jersey_number: player.jersey_number,
        player_email: player.player_email,
        player_mobile: player.player_mobile,
        position: player.position,
      };
      const response = await Api.post("/teams_players", data);
      if (response?.errorType === "Error" || response?.message === false) {
        return Toasts.errorToast("Couldn't create a player");
      }
    }

    history.goBack();
    Toasts.successToast("The Player(s) have been successfully created!");
    dispatch({
      type: CREATE_PLAYERS_SUCCESS,
      payload: {
        data: players,
      },
    });
  } catch (err) {
    Toasts.errorToast(err.message);
  }
};

export const savePlayer = (players: IPlayer[]) => async (
  dispatch: Dispatch,
  getState: () => IAppState
) => {
  try {
    const { divisions, teams } = getState().teams;
    for await (const player of players) {
      const selectedDivision = divisions.find(
        (division) => division.short_name === player.division_name
      );
      if (!selectedDivision) {
        throw { message: "Please select Division" };
      }

      // check if user selected available team.
      const filteredTeamByDivision = teams.filter(
        (team) => team.division_id === selectedDivision.division_id
      );
      const selectedTeam = filteredTeamByDivision.find(
        (team) => team.short_name === player.team_name
      );
      if (!selectedTeam) {
        throw {
          message: `There is a team in the form names the ${player.team_name}. But that team doesn't exist. Please address this issue and try to import again.`,
        };
      }

      const data = {
        team_player_id: player.team_player_id,
        team_id: selectedTeam.team_id,
        player_id: player.player_id,
        reg_response_id: player.reg_response_id,
        first_name: player.first_name,
        last_name: player.last_name,
        jersey_number: player.jersey_number,
        player_email: player.player_email,
        player_mobile: player.player_mobile,
        position: player.position,
      };
      await Api.put(
        `/teams_players?team_player_id=${player.team_player_id}`,
        data
      );
      dispatch({
        type: SAVE_PLAYER_SUCCESS,
        payload: {
          player: data,
        },
      });
    }
    Toasts.successToast("The Player(s) have been successfully updated!");
  } catch (err) {
    Toasts.errorToast(err.message);
  }
};

export const deletePlayer = (players: IPlayer[]) => async (
  dispatch: Dispatch
) => {
  try {
    for await (const player of players) {
      await Api.delete(
        `/teams_players?team_player_id=${player.team_player_id}`
      );

      dispatch({
        type: DELETE_PLAYER_SUCCESS,
        payload: {
          player,
        },
      });
    }
    Toasts.successToast("The Player(s) have been removed successfully.");
  } catch (err) {
    Toasts.errorToast(err.message);
  }
};

export const createTeamsCsv: ActionCreator<ThunkAction<
  void,
  {},
  null,
  { type: string }
>> = (teams: Partial<ITeam>[], cb: (param?: object) => void) => async (
  dispatch: Dispatch
) => {
  const allDivisions = await Api.get(
    `/divisions?event_id=${teams[0].event_id}`
  );
  const allTeams = await Api.get(`/teams?event_id=${teams[0].event_id}`);

  let poolsPerDivision: any = {};
  for await (const division of allDivisions) {
    const pools = await Api.get(`/pools?division_id=${division.division_id}`);
    poolsPerDivision = {
      ...poolsPerDivision,
      [division.division_id]: pools,
    };
  }

  for (const [index, team] of teams.entries()) {
    if (!team.division_id) {
      return Toasts.errorToast(
        `Record ${index + 1}: Division Name is required to fill!`
      );
    }
  }

  const data = teams.map((team) => {
    const divisionId = allDivisions.find(
      (div: IDivision) =>
        div.long_name.toLowerCase() === team.division_id?.toLowerCase()
    )?.division_id;

    let poolId = null;
    if (poolsPerDivision[divisionId]) {
      poolId = poolsPerDivision[divisionId].find(
        (it: IPool) => it.pool_name === team.pool_id
      )?.pool_id;
    }

    if (team.phone_num) {
      const orgin: any = team.phone_num;
      const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
      let str = orgin.replace(regex, "");
      str = str.replace(/\s/g, "");

      if (str && str.indexOf("1") === 0) {
        str = str.substring(1);
      }

      team.phone_num = str;
    } else {
      team.phone_num = "";
    }

    return { ...team, division_id: divisionId, pool_id: poolId };
  });

  const dupList = [];

  for (const [index, team] of data.entries()) {
    if (!team.division_id) {
      return Toasts.errorToast(
        `Record ${
          index + 1
        }: There is no division with the supplied "long name". Please, create a division first or address the data issue.`
      );
    }
    const teamsInDivision = allTeams.filter(
      (t: ITeam) => t.division_id === team.division_id
    );

    try {
      await Yup.array()
        .of(teamSchema)
        .unique(
          (t) => t.long_name,
          "Within a division, Long Names must be unique."
        )
        .validate([...teamsInDivision, team]);
    } catch (err) {
      if (err.value) {
        const invalidTeam = err.value[err.value.length - 1];
        const index = teams.findIndex(
          (team) => team.team_id === invalidTeam.team_id
        );

        dupList.push({
          index,
          msg: err.message,
        });
      }
    }

    try {
      await Yup.array()
        .of(teamSchema)
        .unique(
          (t) => t.long_name,
          "Within a division, Long Names must be unique."
        )
        .validate([...data, team]);
    } catch (err) {
      const invalidTeam = err.value[err.value.length - 1];
      const index = teams.findIndex(
        (team) => team.team_id === invalidTeam.team_id
      );

      dupList.push({
        index,
        msg: err.message,
      });
    }
  }

  if (dupList.length !== 0) {
    cb({ type: "error", data: dupList });
  } else {
    let progress = 0;
    for (const team of data) {
      const postData = {
        event_id: team.event_id,
        division_id: team.division_id,
        pool_id: team.pool_id,
        long_name: team.long_name,
        short_name: team.short_name,
        team_tag: team.team_tag,
        team_id: team.team_id,
        contact_first_name: team.contact_first_name,
        contact_last_name: team.contact_last_name,
        phone_num: team.phone_num,
        contact_email: team.contact_email,
        city: team.city,
        state: team.state,
        level: team.level,
        org_id: team.org_id,
        schedule_restrictions: team.schedule_restrictions,
        is_active_YN: team.is_active_YN,
        is_library_YN: team.is_library_YN,
      };

      const response = await Api.post(`/teams`, postData);
      if (response?.errorType === "Error" || response?.message === false) {
        return Toasts.errorToast("Couldn't create a team");
      }
      progress += 1;

      cb({
        type: "progress",
        data: [
          {
            status: "Importing New Data...",
            msg: `${progress / data.length}`,
          },
        ],
      });
    }

    dispatch({
      type: CREATE_TEAMS_SUCCESS,
      payload: {
        data,
      },
    });

    if (!teams[0].pool_id) {
      cb({
        type: "info",
        data: [
          {
            index: 0,
            msg: `Import Summary; Of the ${teams.length} teams you imported, ${data.length} rows mapped to existing divisions. No pool were mapped. Be sure to map them under "Division & Pools".`,
          },
        ],
      });
    } else {
      let poolTeamCount = 0;
      data.forEach((it) => {
        if (it.pool_id) {
          poolTeamCount += 1;
        }
      });
      cb({
        type: "info",
        data: [
          {
            index: 0,
            msg: `Import Summary; Of the ${teams.length} teams you imported, ${
              data.length
            } rows mapped successfully to existing divisions and ${poolTeamCount} rows successfully mapped to existing Pools. If needed, map them under "Division & Pools". ${
              data.length - poolTeamCount
            } were unassigned and need assignment.`,
          },
        ],
      });
    }

    const successMsg = `(${data.length}) teams were successfully imported.`;
    Toasts.successToast(successMsg);
  }
};

export const createTeamsContactsCsv = (
  teamsContacts: Partial<ICoache>[],
  cb: (param?: object) => void
) => async (dispatch: Dispatch, getState: () => IAppState) => {

  if (!teamsContacts || !teamsContacts[0]) return;

  let comingCoaches: any[] = [];
  comingCoaches = teamsContacts.map(
    (coache) =>
      ({
        first_name: coache.first_name?.trim(),
        last_name: coache.last_name?.trim(),
        division_name: coache.division_name?.trim(),
        team_name: coache.team_name?.trim(),
        allow_sms_YN: 1,
        contact_email: coache.contact_email?.trim(),
        phone_num: coache.phone_num?.trim(),
        role: coache.role?.trim(),
      })
  );
  let dupsCoaches: any[] = [];
  const reportedRows: string[] = [];
  try {
    const currentCoaches = getState().teams.coaches;
    if (currentCoaches && currentCoaches[0]) {
      const currentCoacheskeys = currentCoaches.map(
        (coache) =>
          `${coache.division_name}_${coache.team_name}_${coache.first_name}_${coache.last_name}`
      );

      const teamsInEvent = getState().teams;
      for (let index = 0; index < comingCoaches.length; index ++ ) {
        const coache = comingCoaches[index];
        // check if user selected correct division.
        const selectedDivision = teamsInEvent.divisions.find(
          (division) => division.long_name === coache.division_name
        );
        if (!selectedDivision) {
          reportedRows.push(`${index + 1}th row is invalid Division Name.`);
          continue;
        }

        // check if user selected available team.
        const filteredTeamByDivision = teamsInEvent.teams.filter(
          (team) => team.division_id === selectedDivision.division_id
        );
        const selectedTeam = filteredTeamByDivision.find(
          (team) => team.long_name === coache.team_name
        );
        if (!selectedTeam) {
          reportedRows.push(`${index + 1}th row is invalid Team Name.`);
          continue;
        }

        const key = `${coache.division_name}_${coache.team_name}_${coache.first_name}_${coache.last_name}`;
        if (currentCoacheskeys.includes(key)) {
          reportedRows.push(`${index + 1}th row already exists.`);
        } else {
          dupsCoaches.push(comingCoaches[index]);
          reportedRows.push(`Importing`);
        }
      };

      if (reportedRows.length !== 0) {
        cb({
          type: "error",
          data: reportedRows.map((report: string, index: number) => ({
            index,
            msg: report,
          })),
        });
      if (reportedRows.length > 1) {
        throw {
          message: `${reportedRows.join(", ")} rows are already existed.`,
        };
      } else if (reportedRows.length === 1) {
        throw {
          message: `${reportedRows.join(", ")} row is already existed.`,
        };
      }
    }
    } else {
      dupsCoaches = comingCoaches;
    }

  } catch (err) {
    Toasts.errorToast(err.message);
  }

  try{
    // await Yup.array().of(coacheSchema).validate(teamsContacts);
    let cleanedCoaches = dupsCoaches;
    try {
      await Yup.array()
        .of(coacheSchema)
        .unique(
          (coache: any) => `${coache.division_name}_${coache.team_name}_${coache.first_name}_${coache.last_name}`,
          "Within your Teat contracts, the Division + Team + Firstname + LastName should be unique."
        )
        .validate(comingCoaches);
    } catch (err) {
      const invalidCoache = err.value[err.value.length - 1];
      const conflictedCoache = comingCoaches.find(
        (coache) =>
          coache.division_name === invalidCoache.division_name &&
          coache.team_name === invalidCoache.team_name &&
          coache.first_name === invalidCoache.first_name &&
          coache.last_name === invalidCoache.last_name 
      );
      if (conflictedCoache) {
        const indexConflicted = comingCoaches.lastIndexOf(conflictedCoache);
        reportedRows[indexConflicted] = 'Conflicted';
        const index = cleanedCoaches.lastIndexOf(conflictedCoache);
        if (index) cleanedCoaches.splice(index,1);
      }
    }
    // await Yup.array().of(reporterSchemaCsv).validate(comingReporters);
    if (reportedRows.length !== 0) {
      cb({
        type: "error",
        data: reportedRows.map((report: string, index: number) => ({
          index,
          msg: report,
        })),
      });
    }

    const addedCoaches: ICoache[] = [];
    let progress = 0;
    for await (const coache of cleanedCoaches) {
       // post coache data
      const data = {
        team_contact_id: getVarcharEight(),
        team_id: getVarcharEight(),
        first_name: coache.first_name,
        last_name: coache.last_name,
        division_name: coache.division_name,
        team_name: coache.team_name,
        // team_id: "",
        allow_sms_YN: 1,
        contact_email: coache.contact_email,
        phone_num: coache.phone_num,
        role: coache.role,
      };
      const response = await Api.post("/teams_contacts", data);
      if (!response || response?.errorType === "Error" || response?.message === false) {
        Toasts.errorToast("Couldn't create a teams contacts");
        const indexFailed = comingCoaches.findIndex(
          (coache) =>
            coache.division_name === data.division_name &&
            coache.team_name === data.team_name &&
            coache.first_name === data.first_name &&
            coache.last_name === data.last_name 
        );
         reportedRows[indexFailed] = 'Import failed';
      } else {
        const indexSuccessed = comingCoaches.findIndex(
          (coache) =>
            coache.division_name === data.division_name &&
            coache.team_name === data.team_name &&
            coache.first_name === data.first_name &&
            coache.last_name === data.last_name 
        );
        reportedRows[indexSuccessed] = 'Import successed';
        addedCoaches.push(data as ICoache);
        progress += 1;

        cb({
          type: "progress",
          data: [
            {
              status: "Importing New SMS Scorers...",
              msg: `${progress / cleanedCoaches.length}`,
            },
          ],
        });

        if (reportedRows.length !== 0) {
          cb({
            type: "error",
            data: reportedRows.map((report: string, index: number) => ({
              index,
              msg: report,
            })),
          });
        }
      }
      
    }

    cb({
      type: "info",
      data: [
        {
          index: 0,
          msg: `Import Summary; Of the ${cleanedCoaches.length} reporters you imported, ${addedCoaches.length} rows mapped to existing teams contacts.`,
        },
      ],
    });
    if ( addedCoaches.length > 0) {
      Toasts.successToast("The Team Contacts(s) have been successfully created!");
      dispatch({
        type: CREATE_COACHES_SUCCESS,
        payload: {
          coaches: addedCoaches,
        },
      });
    } else {
      Toasts.errorToast("Couldn't create a teams contacts");
    }
  } catch (err) {
    Toasts.errorToast(err.message);
  }

  // cb();
};

export const deleteCoache = (coaches: ICoache[]) => async (
  dispatch: Dispatch
) => {
  try {
    for await (const coache of coaches) {
      await Api.delete(
        `/team_contacts?first_name=${coache.first_name}&last_name=${coache.first_name}&division_name=${coache.division_name}&team_name=${coache.team_name}`
      );

      dispatch({
        type: DELETE_COACHE_SUCCESS,
        payload: {
          coache,
        },
      });
    }
    Toasts.successToast("The Coache(s) have been removed successfully.");
  } catch (err) {
    Toasts.errorToast(err.message);
  }
};

export const createPlayersCsv = (
  players: Partial<IPlayer>[],
  cb: (param?: object) => void
) => async (dispatch: Dispatch, getState: () => IAppState) => {
  try {
    const currentPlayers = getState().teams.players;
    const currentPlayerskeys = currentPlayers.map(
      (player) =>
        `${player.player_email}_${player.first_name}_${player.last_name}`
    );

    const comingPlayerkeys = players.map(
      (player) =>
        `${player.player_email}_${player.first_name}_${player.last_name}`
    );

    let isAlreadyExisted = false;
    const duplicatedRows: string[] = [];
    comingPlayerkeys.forEach((key, index) => {
      if (currentPlayerskeys.includes(key)) {
        isAlreadyExisted = true;
        duplicatedRows.push(`${index + 1}th`);
      }
    });
    if (isAlreadyExisted) {
      if (duplicatedRows.length > 1) {
        throw {
          message: `${duplicatedRows.join(", ")} rows are already existed.`,
        };
      } else if (duplicatedRows.length === 1) {
        throw {
          message: `${duplicatedRows.join(", ")} row is already existed.`,
        };
      }
    }


    await Yup.array().of(playerSchema).validate(players);

    const teamPlayers: IPlayer[] = [];
    for await (const player of players) {
      // check if user selected correct division.
      const selectedDivision = getState().teams.divisions.find(
        (division) => division.short_name === player.division_name
      );
      if (!selectedDivision) {
        throw { message: "Division Should be selected" };
      }

      // check if user selected available team.
      const filteredTeamByDivision = getState().teams.teams.filter(
        (team) => team.division_id === selectedDivision.division_id
      );
      const selectedTeam = filteredTeamByDivision.find(
        (team) => team.short_name === player.team_name
      );
      if (!selectedTeam) {
        throw {
          message: `There is a team in the form names the ${player.team_name}. But that team doesn't exist. Please address this issue and try to import again.`,
        };
      }

      // post player data
      const data = {
        team_id: selectedTeam.team_id,
        player_id: getVarcharEight(),
        reg_response_id: getVarcharEight(),
        first_name: player.first_name,
        last_name: player.last_name,
        jersey_number: player.jersey_number,
        player_email: player.player_email,
        player_mobile: player.player_mobile,
        position: player.position,
      };
      teamPlayers.push(data as IPlayer);
      const response = await Api.post("/teams_players", data);
      if (response?.errorType === "Error" || response?.message === false) {
        return Toasts.errorToast("Couldn't create a player");
      }
    }

    Toasts.successToast("The Player(s) have been successfully created!");
    dispatch({
      type: CREATE_PLAYERS_SUCCESS,
      payload: {
        data: teamPlayers,
      },
    });
  } catch (err) {
    Toasts.errorToast(err.message);
  }

  cb();
};

export {
  loadPools,
  saveTeams,
  saveTeamContact,
  deleteTeam,
  loadTeamsData,
  canceledDelete,
  checkTeamInSchedule,
};
