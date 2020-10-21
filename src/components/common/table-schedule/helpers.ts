import { find, findIndex, groupBy, max, orderBy } from "lodash-es";
import { ITeamCard } from "common/models/schedule/teams";
import { IGame } from "../matrix-table/helper";
import {
  IDivision,
  IEventDetails,
  IEventSummary,
  IPool,
  ISchedule,
  ISchedulesDetails,
} from "common/models";
import { IField } from "common/models/schedule/fields";
import { IMultiSelectOption } from "../multi-select";
import { IModalItem } from "../interactive-tooltip";
import { ScheduleWarningsEnum } from "common/enums";
import { IDiagnosticsInput } from "components/schedules/diagnostics";
import ITimeSlot from "common/models/schedule/timeSlots";
import moment from "moment";
import { bracketSourceTypeEnum } from "../../playoffs/bracketGames";

interface IApplyFilterParams {
  selectedDay?: string;
  divisions: IDivision[];
  pools: IPool[];
  teamCards: ITeamCard[];
  eventSummary: IEventSummary[];
  timeSlots: ITimeSlot[];
}

interface IFilterValues {
  divisionsOptions: IMultiSelectOption[];
  poolsOptions: IMultiSelectOption[];
  teamsOptions: IMultiSelectOption[];
  fieldsOptions: IMultiSelectOption[];
  timeOptions: IMultiSelectOption[];
}

export enum AssignmentType {
  Matchups = "Matchups",
  Teams = "Teams",
}

const getUnsatisfiedTeams = (
  teamCards: ITeamCard[],
  minGamesNum: number | null,
  daysNum: number
) =>
  teamCards.filter(
    (teamCard) => (teamCard.games?.length || 0) < daysNum * (minGamesNum || 3)
  );

const getSatisfiedTeams = (
  teamCards: ITeamCard[],
  minGamesNum: number | null,
  daysNum: number
) =>
  teamCards.filter(
    (teamCard) => (teamCard.games?.length || 0) >= daysNum * (minGamesNum || 3)
  );

const mapCheckedValues = (values: IMultiSelectOption[]) =>
  values.filter((item) => item.checked).map((item) => item.value);

const mapDivisionsToOptions = (values: IDivision[], checked = true) =>
  values.map((item) => ({
    label: item.short_name,
    value: item.division_id,
    checked,
  }));

const mapPoolsToOptions = (values: IPool[], checked = true) =>
  values.map((item) => ({
    label: item.pool_name,
    value: item.pool_id,
    checked,
  }));

const mapTimesToOptions = (values: ITimeSlot[], checked = true) =>
  values.map((item: ITimeSlot) => ({
    label: moment(item.time, "HH:mm:ss").format("hh:mm A"),
    value: item.time,
    checked,
  }));

const mapTeamCardsToOptions = (values: ITeamCard[], checked = true) =>
  values.map((item) => ({
    label: item.name,
    value: item.id,
    checked,
  }));

const mapEventSummaryToOptions = (values: IEventSummary[], checked = true) =>
  values.map((item) => ({
    label: `${item.facilities_initials} - ${item.field_name}`,
    value: item.field_id,
    checked,
  }));

export const applyFilters = (params: IApplyFilterParams) => {
  const {
    selectedDay,
    divisions,
    pools,
    teamCards,
    eventSummary,
    timeSlots,
  } = params;

  const divisionsOptions: IMultiSelectOption[] = mapDivisionsToOptions(
    divisions
  );
  const poolsOptions: IMultiSelectOption[] =
    pools?.length > 0 ? mapPoolsToOptions(pools) : [];
  const timeOptions: IMultiSelectOption[] =
    timeSlots?.length > 0 ? mapTimesToOptions(timeSlots) : [];
  const teamsOptions: IMultiSelectOption[] = mapTeamCardsToOptions(teamCards);
  const fieldsOptions: IMultiSelectOption[] = mapEventSummaryToOptions(
    eventSummary
  );

  const sortedDivisionsOptions = orderBy(divisionsOptions, "label");
  const sortedPoolsOptions = orderBy(poolsOptions, "label");
  const sortedTimesOptions = orderBy(timeOptions, "value");
  const sortedTeamsOptions = orderBy(teamsOptions, "label");
  const sortedFieldsOptions = fieldsOptions.sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { numeric: true })
  );

  return {
    selectedDay: selectedDay || "1",
    divisionsOptions: sortedDivisionsOptions,
    poolsOptions: sortedPoolsOptions,
    teamsOptions: sortedTeamsOptions,
    fieldsOptions: sortedFieldsOptions,
    timeOptions: sortedTimesOptions,
  };
};

export const mapGamesByFilter = (
  games: IGame[],
  filterValues: IFilterValues
) => {
  const {
    divisionsOptions,
    poolsOptions,
    teamsOptions,
    fieldsOptions,
    timeOptions,
  } = filterValues;

  const divisionIds = mapCheckedValues(divisionsOptions);
  const poolIds = mapCheckedValues(poolsOptions);
  const timeIds = mapCheckedValues(timeOptions);
  const teamIds = mapCheckedValues(teamsOptions);
  const fieldIds = mapCheckedValues(fieldsOptions);
  const filteredGamesIds = games
    .filter(
      (game) =>
        checkDivisions(game, divisionIds) &&
        (!poolsOptions ||
          poolsOptions.length === 0 ||
          checkPools(game, poolIds)) &&
        (!timeOptions ||
          timeOptions.length === 0 ||
          checkTime(game, timeIds)) &&
        checkTeams(game, teamIds) &&
        checkFields(game, fieldIds)
    )
    .map((game) => game.id);

  return games.map((game) => {
    if (!filteredGamesIds.includes(game.id)) {
      delete game.awayTeam;
      delete game.homeTeam;
    }

    if (!filteredGamesIds.includes(game.id) && game.isPlayoff) {
      delete game.bracketGameId;
    }

    return game;
  });
};

const checkDivisions = (game: IGame, divisionIds: string[]) => {
  const { awayTeam, homeTeam, divisionId } = game;
  return divisionIds.includes(
    awayTeam?.divisionId! || homeTeam?.divisionId! || divisionId!
  );
};

const checkPools = (game: IGame, poolIds: string[]) => {
  const {
    awayTeam,
    homeTeam,
    isPlayoff,
    awaySourceId,
    awaySourceType,
    homeSourceType,
    homeSourceId,
  } = game;
  return (
    isPlayoff ||
    poolIds.includes(
      awayTeam?.poolId! ||
        homeTeam?.poolId! ||
        (awaySourceType === bracketSourceTypeEnum.Pool ? awaySourceId! : "") ||
        (homeSourceType === bracketSourceTypeEnum.Pool ? homeSourceId! : "")
    )
  );
};

const checkTime = (game: IGame, timeIds: string[]) => {
  const { startTime, isPlayoff } = game;
  return isPlayoff || (startTime && timeIds.includes(startTime));
};

const checkTeams = (game: IGame, teamIds: string[]) => {
  const {
    awayTeam,
    homeTeam,
    isPlayoff,
    homeTeamId,
    awayTeamId,
    awaySeedId,
    homeSeedId,
    homeDependsUpon,
    awayDependsUpon,
    homeSourceType,
    homeSourceValue,
    awaySourceType,
    awaySourceValue,
  } = game;

  return (
    (isPlayoff && awayTeamId && teamIds.includes(awayTeamId)) ||
    (isPlayoff && homeTeamId && teamIds.includes(homeTeamId)) ||
    (isPlayoff && (awaySeedId || awayDependsUpon) && !awayTeamId) ||
    (isPlayoff && (homeSeedId || homeDependsUpon) && !homeTeamId) ||
    teamIds.includes(awayTeam?.id!) ||
    teamIds.includes(homeTeam?.id!) ||
    (!!homeSourceType &&
      (homeSourceType !== bracketSourceTypeEnum.Team ||
        teamIds.includes(homeSourceValue!))) ||
    (!!awaySourceType &&
      (awaySourceType !== bracketSourceTypeEnum.Team ||
        teamIds.includes(awaySourceValue!)))
  );
};

const checkFields = (game: IGame, fieldIds: string[]) => {
  return fieldIds.includes(game.fieldId);
};

const filterPoolsByDivisionIds = (pools: IPool[], divisionIds: string[]) =>
  pools.filter((pool) => divisionIds.includes(pool.division_id));

const filterPoolsOptionsByPools = (
  poolOptions: IMultiSelectOption[],
  options: IMultiSelectOption[],
  pools: IPool[]
) =>
  poolOptions
    .filter((item) => findIndex(pools, { pool_id: item.value }) >= 0)
    .map((item) => ({
      ...item,
      checked: find(options, { value: item.value })
        ? !!find(options, { value: item.value })?.checked
        : true,
    }));

const filterTeamsByDivisionsAndPools = (
  teams: ITeamCard[],
  divisionIds: string[],
  poolIds: string[]
) =>
  teams.filter(
    (item) =>
      divisionIds.includes(item.divisionId) && poolIds.includes(item.poolId!)
  );

const filterTeamsOptionsByTeams = (
  teamsOptions: IMultiSelectOption[],
  options: IMultiSelectOption[],
  teams: ITeamCard[]
) =>
  teamsOptions
    .filter((item) => findIndex(teams, { id: item.value }) >= 0)
    .map((item) => ({
      ...item,
      checked: find(options, { value: item.value })
        ? !!find(options, { value: item.value })?.checked
        : true,
    }));

export const mapFilterValues = (
  params: {
    teamCards: ITeamCard[];
    pools: IPool[];
  },
  filterValues: IFilterValues
) => {
  const { teamCards, pools } = params;
  const { divisionsOptions, teamsOptions, poolsOptions } = filterValues;
  const divisionIds = mapCheckedValues(divisionsOptions);

  const allPoolsOptions: IMultiSelectOption[] = mapPoolsToOptions(pools);
  const allTeamsOptions: IMultiSelectOption[] = mapTeamCardsToOptions(
    teamCards
  );

  // Pools rely on:
  // Checked divisions
  // - Get all pools and filter them by checked division ids
  // - Get all pools options and filter them by filtered pools and checked pools options
  const filteredPools = filterPoolsByDivisionIds(pools, divisionIds);
  const filteredPoolsOptions = filterPoolsOptionsByPools(
    allPoolsOptions,
    poolsOptions,
    filteredPools
  );

  // Teams realy on:
  // Checked divisions
  // Checked pools
  // - Get all teams and filter them by checked division ids and checked pool ids
  // - Get all teams options and filter them by filtered teams and checked teams options
  const poolIds = mapCheckedValues(filteredPoolsOptions);
  const filteredTeams = filterTeamsByDivisionsAndPools(
    teamCards,
    divisionIds,
    poolIds
  );
  const filteredTeamsOptions = filterTeamsOptionsByTeams(
    allTeamsOptions,
    teamsOptions,
    filteredTeams
  );

  return {
    ...filterValues,
    poolsOptions: filteredPoolsOptions,
    teamsOptions: filteredTeamsOptions,
  };
};

export const mapUnusedFields = (
  fields: IField[],
  games: IGame[],
  filterValues: IFilterValues
) => {
  const arr: IMultiSelectOption[] = [
    ...filterValues.divisionsOptions,
    ...filterValues.poolsOptions,
    ...filterValues.teamsOptions,
    ...filterValues.fieldsOptions,
  ].flat();

  if (arr.every((item) => item.checked)) {
    return fields;
  }

  const filledGames = games.filter(
    (game) =>
      game.awayTeam?.id ||
      game.homeTeam?.id ||
      (game.isPlayoff && game.bracketGameId)
  );
  const usedFieldIds = fields
    .map((field) => field.id)
    .filter((fieldId) => findIndex(filledGames, { fieldId }) >= 0);

  return fields.map((field) => ({
    ...field,
    isUnused: !usedFieldIds.includes(field.id),
  }));
};

const moveCardMessages = {
  playoffSlot:
    "This game slot is located in the Playoffs section. Please choose another one.",
  gameSlotInUse: "Game slot is already in use.",
  timeSlotInUseForTeam: "This team is already playing at this time.",
  timeSlotInUseForGame: "One of these teams is already playing at this time.",
  differentFacility:
    "This division is not playing at this facility on this day. Please confirm your intentions.",
  divisionUnmatch:
    "The divisions of the teams do not match. Are you sure you want to continue?",
  poolUnmatch:
    "The pools of the teams do not match. Are you sure you want to continue?",
};

const getScheduleWarning = (
  schedule: ISchedule,
  timeSlots: ITimeSlot[],
  days: (string | undefined)[],
  schedulesDetails: ISchedulesDetails[],
  event: IEventDetails,
  teamCards: ITeamCard[],
  teamsDiagnostics: IDiagnosticsInput
): IModalItem[] => {
  const items: IModalItem[] = [];

  // If the game times are inconsistent with the event setup
  if (
    schedule.first_game_time !== event.first_game_time ||
    schedule.last_game_end_time !== event.last_game_end
  ) {
    items.push({
      type: "WARN",
      title: ScheduleWarningsEnum.GameTimesDiffer,
    });
  }

  // If the minimum # of games is not met due to the the number of teams in a pool
  const groupedPools = groupBy(teamCards, "poolId");
  const poolsLengthArr = Object.keys(groupedPools).map(
    (key) => groupedPools[key].length
  );
  const avgPoolLength =
    poolsLengthArr.reduce((a, b) => a + b, 0) / poolsLengthArr.length;

  if (Number(schedule.min_num_games) > avgPoolLength) {
    items.push({
      type: "WARN",
      title: ScheduleWarningsEnum.MinGamesNumExceedsPoolLength,
    });
  }

  // If the maximum # of games per day is exceeded
  const gamesLength = teamCards.map((item) => item.games?.length || 0);
  const maxGamesLength = max(gamesLength);

  if ((maxGamesLength || 0) > Number(schedule.max_num_games)) {
    items.push({
      type: "WARN",
      title: ScheduleWarningsEnum.MaxGamesNumExceededPerDay,
    });
  }

  // If there are back to back games
  const backToBackIndex =
    teamsDiagnostics?.header?.findIndex((item) =>
      item.toLowerCase().includes("back-to-back")
    ) || 5;
  const backToBackValues = teamsDiagnostics?.body?.map(
    (item) => item[backToBackIndex]
  );
  const backToBackExist = backToBackValues?.filter((v) => Number(v) > 0).length;

  if (backToBackExist && event.back_to_back_warning) {
    items.push({
      type: "INFO",
      title: ScheduleWarningsEnum.BackToBackGamesExist,
    });
  }

  if (!event.same_coach_timeslot_YN) {
    return items;
  }
  days.forEach((day) => {
    if (!day) return;

    timeSlots.forEach((timeSlot) => {
      if (!timeSlot || !timeSlot.time) return;

      const sameTimSlotTeams: ITeamCard[] = [];
      schedulesDetails.forEach((scheduleDetail) => {
        if (
          !scheduleDetail.away_team_id ||
          !scheduleDetail.home_team_id ||
          !scheduleDetail.game_date ||
          !scheduleDetail.game_time
        ) {
          return;
        }

        if (
          new Date(scheduleDetail.game_date).getTime() ===
            new Date(day).getTime() &&
          timeSlot.time === scheduleDetail.game_time
        ) {
          const homeTeam = teamCards.find(
            (team) => team.id === scheduleDetail.home_team_id
          );
          if (
            homeTeam &&
            (sameTimSlotTeams.find((team) => team.id === homeTeam.id) ||
              sameTimSlotTeams.find(
                (team) =>
                  (team.contactFirstName || team.contactLastName) &&
                  team.contactFirstName === homeTeam.contactFirstName &&
                  team.contactLastName === homeTeam.contactLastName
              ))
          ) {
            const tempTitle = `Coach ${homeTeam.contactFirstName} ${homeTeam.contactLastName} is coaching in > 1 games during the ${day} ${scheduleDetail.game_time} timeslot`;
            if (!items.find((item) => item.title === tempTitle)) {
              items.push({
                type: "WARN",
                title: tempTitle,
              });
            }
          } else if (homeTeam) {
            sameTimSlotTeams.push(homeTeam);
          }

          const awayTeam = teamCards.find(
            (team) => team.id === scheduleDetail.away_team_id
          );
          if (
            awayTeam &&
            (sameTimSlotTeams.find((team) => team.id === awayTeam.id) ||
              sameTimSlotTeams.find(
                (team) =>
                  (team.contactFirstName || team.contactLastName) &&
                  team.contactFirstName === awayTeam.contactFirstName &&
                  team.contactLastName === awayTeam.contactLastName
              ))
          ) {
            const tempTitle = `Coach ${awayTeam.contactFirstName} ${awayTeam.contactLastName} is coaching in > 1 games during the ${day} ${scheduleDetail.game_time} timeslot`;
            if (!items.find((item) => item.title === tempTitle)) {
              items.push({
                type: "WARN",
                title: tempTitle,
              });
            }
          } else if (awayTeam) {
            sameTimSlotTeams.push(awayTeam);
          }
        }
      });
    });
  });

  return items;
};

const mapDupesGames = (dupesGames: IGame[]) => {
  const uniqConcatTeamId = [
    ...new Set(dupesGames.map((g) => `${g.awayTeam?.id}${g.homeTeam?.id}`)),
  ];
  const gamesWithUniqId = uniqConcatTeamId.map((str) => {
    return {
      awayTeamId: str.slice(0, 8),
      homeTeamId: str.slice(8),
    };
  });
  const uniqDupesGames = gamesWithUniqId.map((uniqGame) => {
    const a = dupesGames.filter(
      (game) =>
        uniqGame.awayTeamId === game.awayTeam?.id &&
        uniqGame.homeTeamId === game.homeTeam?.id
    );
    return {
      ...uniqGame,
      games: a,
    };
  });

  return uniqDupesGames;
};

export {
  mapDupesGames,
  getUnsatisfiedTeams,
  getSatisfiedTeams,
  getScheduleWarning,
  moveCardMessages,
};
