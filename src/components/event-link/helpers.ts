import { IPool, IDivision, ITeam } from 'common/models';
import { IMultiSelectOption } from 'components/common/multi-select';
import { findIndex, find } from 'lodash-es';

export enum Type {
  TEXT = 'Text',
  EMAIL = 'Email',
};

export enum MessageType {
  ONE_WAY = 'Notification (one way)',
  TWO_WAY = 'Poll (two way)',
};

export enum Recipient {
  ONE = 'One',
  MANY = 'Many',
};

export enum Group {
  COACHES = 'Coaches',
  REGISTRANTS = 'Registrants',
  PHYSICAL_ATTENDEES = 'Physical Attendees',
  FOLLOWERS_ON_THE_APP = 'Followers on the App',
};

export const typeOptions = [Type.TEXT, Type.EMAIL];
export const messageTypeOptions = [MessageType.ONE_WAY, MessageType.TWO_WAY];
export const recipientOptions = [Recipient.ONE, Recipient.MANY];

const mapDivisionsToOptions = (values: IDivision[], checked = true) =>
  values.map(item => ({
    label: item.short_name,
    value: item.division_id,
    checked,
  }));

const mapPoolsToOptions = (values: IPool[], checked = true) =>
  values.map(item => ({
    label: item.pool_name,
    value: item.pool_id,
    checked,
  }));

const mapTeamsToOptions = (values: ITeam[], checked = true) =>
  values.map(item => ({
    label: item.long_name!,
    value: item.team_id!,
    checked,
  }));

export const applyFilters = (params: any, event?: string) => {
  const { divisions, pools, teams } = params;

  const filteredDivisions = divisions.filter(
    (division: IDivision) => division.event_id === event
  );
  const filteredDivisionsIds = filteredDivisions.map(
    (division: IDivision) => division.division_id
  );
  const filteredPools = pools.filter((pool: IPool) =>
    filteredDivisionsIds.includes(pool.division_id)
  );
  const filteredTeams = teams.filter((team: ITeam) => team.event_id === event);

  const divisionsOptions: IMultiSelectOption[] = mapDivisionsToOptions(
    filteredDivisions
  );
  const poolsOptions: IMultiSelectOption[] = mapPoolsToOptions(filteredPools);
  const teamsOptions: IMultiSelectOption[] = mapTeamsToOptions(filteredTeams);

  const groupsOptions = [
    {
      label: Group.COACHES,
      value: Group.COACHES,
      checked: true,
    },
    {
      label: Group.FOLLOWERS_ON_THE_APP,
      value: Group.FOLLOWERS_ON_THE_APP,
      checked: true,
    },
    {
      label: Group.PHYSICAL_ATTENDEES,
      value: Group.PHYSICAL_ATTENDEES,
      checked: true,
    },
    {
      label: Group.REGISTRANTS,
      value: Group.REGISTRANTS,
      checked: true,
    },
  ];

  return {
    divisionsOptions,
    poolsOptions,
    teamsOptions,
    groupsOptions,
  };
};

const mapCheckedValues = (values: IMultiSelectOption[]) =>
  values.filter(item => item.checked).map(item => item.value);

const filterPoolsByDivisionIds = (pools: IPool[], divisionIds: string[]) =>
  pools.filter(pool => divisionIds.includes(pool.division_id));

const filterPoolsOptionsByPools = (
  poolOptions: IMultiSelectOption[],
  options: IMultiSelectOption[],
  pools: IPool[]
) =>
  poolOptions
    .filter(item => findIndex(pools, { pool_id: item.value }) >= 0)
    .map(item => ({
      ...item,
      checked: find(options, { value: item.value })
        ? !!find(options, { value: item.value })?.checked
        : true,
    }));

const filterTeamsByDivisionsAndPools = (
  teams: ITeam[],
  divisionIds: string[],
  poolIds: string[]
) =>
  teams.filter(
    item =>
      divisionIds.includes(item.division_id) && poolIds.includes(item.pool_id!)
  );

const filterTeamsOptionsByTeams = (
  teamsOptions: IMultiSelectOption[],
  options: IMultiSelectOption[],
  teams: ITeam[]
) =>
  teamsOptions
    .filter(item => findIndex(teams, { team_id: item.value }) >= 0)
    .map(item => ({
      ...item,
      checked: find(options, { value: item.value })
        ? !!find(options, { value: item.value })?.checked
        : true,
    }));

export const mapFilterValues = (
  params: {
    teams: ITeam[];
    pools: IPool[];
  },
  filterValues: any
) => {
  const { teams, pools } = params;
  const { divisionsOptions, teamsOptions, poolsOptions } = filterValues;
  const divisionIds = mapCheckedValues(divisionsOptions);

  const allPoolsOptions: IMultiSelectOption[] = mapPoolsToOptions(pools);
  const allTeamsOptions: IMultiSelectOption[] = mapTeamsToOptions(teams);

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
    teams,
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

export const mapTeamsByFilter = (
  teams: ITeam[],
  filterValues: any,
  type: string
) => {
  const { divisionsOptions, poolsOptions, teamsOptions } = filterValues;

  const divisionIds = mapCheckedValues(divisionsOptions);
  const poolIds = mapCheckedValues(poolsOptions);
  const teamIds = mapCheckedValues(teamsOptions);

  const filteredTeams = teams.filter(
    team =>
      checkDivisions(team, divisionIds) &&
      checkPools(team, poolIds) &&
      checkTeams(team, teamIds)
  );

  if (filteredTeams.length && type === 'Text') {
    return filteredTeams
      .filter(team => team.phone_num)
      .map(team => team.phone_num);
  } else if (filteredTeams.length && type === 'Email') {
    return filteredTeams
      .filter(team => team.contact_email)
      .map(team => team.contact_email);
  } else {
    return [];
  }
};

const checkDivisions = (team: ITeam, divisionIds: string[]) => {
  return divisionIds.includes(team.division_id);
};

const checkPools = (team: ITeam, poolIds: string[]) => {
  return poolIds.includes(team.pool_id!);
};

const checkTeams = (team: ITeam, teamIds: string[]) => {
  return teamIds.includes(team.team_id);
};
