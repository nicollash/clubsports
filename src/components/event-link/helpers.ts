import api from "api/api";
import { IPool, IDivision, ITeam } from 'common/models';
import { IMessageTemplate } from "common/models/event-link";
import { IMultiSelectOption } from 'components/common/multi-select';
import { findIndex, find } from 'lodash-es';
import { IResponse } from ".";
import { IPollOption, IRecipientDetails } from "./create-message";
import { IScheduleFilter } from "./create-message/filter";

export enum Type {
  TEXT = 'Text',
  EMAIL = 'Email',
};

export enum MessageType {
  ONE_WAY = 'Notification (1 Way)',
  TWO_WAY = 'Poll (2 Way Q & A)',
};

export enum Recipient {
  ONE = 'One',
  MANY = 'Many',
};

export enum Group {
  COACHES = 'COACHES',
  REGISTRANTS = 'REGISTRANTS',
  PLAYERS = 'PLAYERS',
};

export enum GroupLabels {
  COACHES = 'Coaches',
  REGISTRANTS = 'Registrants',
  PLAYERS = 'Players',
};

export const typeOptions = [Type.TEXT, Type.EMAIL];
export const messageTypeOptions = [MessageType.ONE_WAY, MessageType.TWO_WAY];
export const recipientOptions = [Recipient.ONE, Recipient.MANY];
export const insertFormFieldButtonsLabels = [
  "First Name",
  "Last Name",
  "Event Name",
  "Division Name",
  "Pool Name",
  "Team Name",
  "Link to division schedule",
  "Download app link",
];

export const sortBySendDatetime = (arr: any[]) => {
  return arr.sort((a: any, b: any) =>
    new Date(a.send_datetime).getTime() < new Date(b.send_datetime).getTime()
      ? 1
      : -1
  );
};

const mapDivisionsToOptions = (values: IDivision[], checked = true) =>
  values
    .map((item) => ({
      label: item.short_name,
      value: item.division_id,
      checked,
    }))
    .sort((a, b) => {
      if (a.label > b.label) return 1;
      if (a.label < b.label) return -1;
      return 0;
    });

const mapPoolsToOptions = (values: IPool[], checked = true) =>
  values
    .map(item => ({
      label: item.pool_name,
      value: item.pool_id,
      checked,
    }))
    .sort((a, b) => {
      if (a.label > b.label) return 1;
      if (a.label < b.label) return -1;
      return 0;
    });

const mapTeamsToOptions = (values: ITeam[], checked = true) =>
  values
    .map(item => ({
      label: item.long_name!,
      value: item.team_id!,
      checked,
    }))
    .sort((a, b) => {
      if (a.label > b.label) return 1;
      if (a.label < b.label) return -1;
      return 0;
    });

export const applyFilters = (params: any, event?: string) => {
  const { divisions, pools, teams } = params;

  const filteredDivisions = divisions?.filter(
    (division: IDivision) => division.event_id === event
  );
  const filteredDivisionsIds = filteredDivisions?.map(
    (division: IDivision) => division.division_id
  );
  const filteredPools = pools?.filter((pool: IPool) =>
    filteredDivisionsIds.includes(pool.division_id)
  );
  const filteredTeams = teams?.filter((team: ITeam) => team.event_id === event);

  const divisionsOptions: IMultiSelectOption[] = mapDivisionsToOptions(
    filteredDivisions
  );
  const poolsOptions: IMultiSelectOption[] = mapPoolsToOptions(filteredPools);
  const teamsOptions: IMultiSelectOption[] = mapTeamsToOptions(filteredTeams);

  const groupsOptions = [
    {
      label: GroupLabels.COACHES,
      value: Group.COACHES,
      checked: true,
    },
    {
      label: GroupLabels.PLAYERS,
      value: Group.PLAYERS,
      checked: true,
    },
    {
      label: GroupLabels.REGISTRANTS,
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

export const mapValuesByFilter = (filterValues: IScheduleFilter) => {
  const {
    divisionsOptions,
    poolsOptions,
    teamsOptions,
    groupsOptions,
  } = filterValues;

  const divisionIds = mapCheckedValues(divisionsOptions);
  const poolIds = mapCheckedValues(poolsOptions);
  const teamIds = mapCheckedValues(teamsOptions);
  const groups = mapCheckedValues(groupsOptions);

  return {
    divisionIds,
    poolIds,
    teamIds,
    groups,
  };
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

export const getAnswerText = (answerOptionId: string, options: any[]) => {
  const currentOption = options.find(
    (opt: any) => opt.answer_option_id === answerOptionId
  );
  return currentOption?.answer_text ? currentOption?.answer_text : "No Response";
};

export const getRecipient = (
  recipientDetails: IRecipientDetails,
  messageType: string
) => {
  if (messageType === Type.EMAIL) {
    return recipientDetails.email;
  };
  if (messageType === Type.TEXT) {
    return recipientDetails.phoneNumber;
  };
};

export const getListOfNames = (
  ids: string[],
  items: any[],
  fieldName: string,
  fieldID: string
) => {
  return items
    .filter((item: any) => ids.includes(item[fieldID]))
    .map((item: ITeam | IPool | IDivision) => item[fieldName])
    .sort((a, b) => a.localeCompare(b))
    .join(", ");
};

export const refreshMessage = async (messageId: string) => {
  return (await api.get(`/messaging?message_id=${messageId}`)) as IResponse[];
};

export const mapResponses = (responses: any[], options: any[]) => {
  return responses.map((mess: any) => {
    return {
      recipientTarget: mess.recipient_target,
      sendDatetime: mess.send_datetime,
      receivedDatetime: mess.received_datetime,
      answerText: getAnswerText(mess.answer_option_id, options),
      messageStatus: mess.message_status.toLocaleUpperCase(),
      messageId: mess.message_id,
      statusMessage: mess.status_message,
    } as IResponse;
  });
};

export const mapTemplates = (templates: any[]) => {
  return templates.map((temp: any) => {
    return {
      messageTemplateId: temp.message_template_id,
      messageType: temp.message_type,
      messageContent: temp.message_content,
      subject: temp.subject,
      responseOptions: temp.response_options,
      type: temp.type,
    } as IMessageTemplate;
  });
};

export const getMessageTail = (options: IPollOption[] | undefined) => {
  const tail = `\n\nPlease respond:`;
  return !options
    ? ""
    : tail +
        options
          .map((option: IPollOption) => {
            return `\n${option.answerCode} = ${option.answerText}`;
          })
          .join('');
};
