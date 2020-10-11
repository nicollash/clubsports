import { union, filter, find, orderBy, findIndex, flatten } from 'lodash-es';
import { getTimeFromString, timeToString } from 'helpers';
import { ITeamCard } from 'common/models/schedule/teams';
import { IField } from 'common/models/schedule/fields';
import { IScheduleDivision } from 'common/models/schedule/divisions';
import { IScheduleFacility } from 'common/models/schedule/facilities';
import { IGame } from 'components/common/matrix-table/helper';
import {
  calculateTeamTournamentTime,
  calculateNumOfTimeSlots,
} from '../teamsDiagnostics/calculateTeamsDiagnostics';

export interface IDivisionsDiagnosticsProps {
  teamCards: ITeamCard[];
  fields: IField[];
  games: IGame[];
  facilities: IScheduleFacility[];
  divisions: IScheduleDivision[];
  totalGameTime: number;
}

interface ITimeSlotsBtwnGames {
  timeSlotsIn0: number;
  timeSlotsIn1: number;
  timeSlotsIn2: number;
  timeSlotsIn3: number;
  timeSlotsIn4: number;
}

const calculateDivisionFieldsNumber = (
  divisionId: string,
  diagnosticsProps: IDivisionsDiagnosticsProps
) => {
  const { teamCards, games } = diagnosticsProps;
  const divisionTeams = filter(teamCards, { divisionId });
  const divisionGames = divisionTeams
    .map(item => item.games)
    .flat()
    .map(item => item?.id);
  const uniqueGameIds = union(divisionGames);
  const fieldIds = games
    .filter(game => uniqueGameIds.includes(game.id))
    .map(game => game.fieldId);
  const uniqueFieldIds = union(fieldIds);
  return uniqueFieldIds.length;
};

const calculateDivisionTournamentTime = (
  divisionId: string,
  diagnosticsProps: IDivisionsDiagnosticsProps
) => {
  const { teamCards, games, totalGameTime } = diagnosticsProps;

  const teams = filter(teamCards, ['divisionId', divisionId]);
  const teamsTournamentTime = teams.map(team =>
    calculateTeamTournamentTime(team, games, totalGameTime)
  );
  const tournamentTimeTotal = teamsTournamentTime
    .map(time => getTimeFromString(time, 'minutes'))
    .reduce((a, b) => a + b);
  const avgTournamentTime = Math.round(tournamentTimeTotal / teams.length);

  return timeToString(avgTournamentTime);
};

const getTournamentTimeBy = (
  divisionId: string,
  diagnosticsProps: IDivisionsDiagnosticsProps,
  orderedBy: 'min' | 'max'
) => {
  const { teamCards, games, totalGameTime } = diagnosticsProps;
  const teams = filter(teamCards, ['divisionId', divisionId]);
  const teamsTournamentTime = teams.map(team =>
    calculateTeamTournamentTime(team, games, totalGameTime)
  );
  switch (orderedBy) {
    case 'max':
      return orderBy(teamsTournamentTime, [], 'desc')[0];
    default:
      return orderBy(teamsTournamentTime, [], 'asc')[0];
  }
};

const calculateTimeSlotsBetweenGames = (
  teamCards: ITeamCard[],
  games: IGame[]
) => {
  const resultObject: Partial<ITimeSlotsBtwnGames> = {};

  [...Array(5)].forEach((_, index) => {
    resultObject[`timeSlotsIn${index}`] = teamCards
      .map(item => calculateNumOfTimeSlots(index, item, games))
      .filter(v => v)
      .reduce((a, b) => a + b, 0);
  });

  return resultObject;
};

const calculateDivisionDiagnostics = (
  divisionId: string,
  diagnosticsProps: IDivisionsDiagnosticsProps
) => {
  const { divisions, facilities, games, teamCards } = diagnosticsProps;

  const divisionName = find(divisions, { id: divisionId })?.name;
  const divisionTeams = filter(teamCards, { divisionId });
  const numOfTeams = divisionTeams?.length;
  const allDivisionGames = teamCards
    .filter(
      teamCard => teamCard.divisionId === divisionId && teamCard.games?.length
    )
    .map(teamCard => teamCard.games)
    .flat()
    .map(game => game.id);
  const numOfGames = union(allDivisionGames).length;

  const numOfFields = calculateDivisionFieldsNumber(
    divisionId,
    diagnosticsProps
  );
  const tournamentTime = calculateDivisionTournamentTime(
    divisionId,
    diagnosticsProps
  );
  const minTournamentTime = getTournamentTimeBy(
    divisionId,
    diagnosticsProps,
    'min'
  );
  const maxTournamentTime = getTournamentTimeBy(
    divisionId,
    diagnosticsProps,
    'max'
  );
  const divisionTeamCardGames = teamCards
    .filter(
      teamCard => teamCard.games?.length && teamCard.divisionId === divisionId
    )
    .map(teamCard => teamCard.games);
  const divisionGames = flatten(divisionTeamCardGames);
  const divisionGame = games.find(
    game => findIndex(divisionGames, { id: game.id }) >= 0
  );

  const timeSlotsBetweenGames = calculateTimeSlotsBetweenGames(
    divisionTeams,
    games
  );

  const {
    timeSlotsIn0,
    timeSlotsIn1,
    timeSlotsIn2,
    timeSlotsIn3,
    timeSlotsIn4,
  } = timeSlotsBetweenGames;

  const facilityId = divisionGame?.facilityId;
  const facility = find(facilities, ['id', facilityId])?.name;

  return [
    divisionName,
    numOfTeams,
    numOfGames,
    numOfFields,
    tournamentTime,
    minTournamentTime,
    maxTournamentTime,
    timeSlotsIn0,
    timeSlotsIn1,
    timeSlotsIn2,
    timeSlotsIn3,
    timeSlotsIn4,
    facility,
  ];
};

const formatDivisionsDiagnostics = (
  diagnosticsProps: IDivisionsDiagnosticsProps
) => {
  const { teamCards } = diagnosticsProps;

  const allDivisionsArr = teamCards.map(teamCard => teamCard.divisionId);
  const allDivisions = union(allDivisionsArr);

  const divisionsArr = allDivisions.map(divisionId =>
    calculateDivisionDiagnostics(divisionId, diagnosticsProps)
  );

  const orderedData = orderBy(divisionsArr, arr => [arr[0]]);

  const header = [
    'Division Name',
    '# of Teams',
    '# of Games',
    '# of Fields',
    'Avg. Time / Team',
    'Min. Time / Team',
    'Max. Time / Team',
    '0 Time Slots between games',
    '1 Time Slots between games',
    '2 Time Slots between games',
    '3 Time Slots between games',
    '4 Time Slots between games',
    'Facility Name',
  ];

  return {
    header,
    body: orderedData,
  };
};

export default formatDivisionsDiagnostics;
