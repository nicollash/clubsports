import { find, orderBy, union, findIndex } from 'lodash-es';
import { getTimeFromString, timeToString } from 'helpers';
import { IScheduleDivision } from 'common/models/schedule/divisions';
import { ITeamCard } from 'common/models/schedule/teams';
import { IField } from 'common/models/schedule/fields';
import { IGame } from 'components/common/matrix-table/helper';

export interface ITeamsDiagnosticsProps {
  teamCards: ITeamCard[];
  fields: IField[];
  games: IGame[];
  divisions: IScheduleDivision[];
  totalGameTime: number;
}

export const calculateTeamTournamentTime = (
  teamCard: ITeamCard,
  games: IGame[],
  totalGameTime: number
) => {
  const teamGames = games.filter(
    game => findIndex(teamCard.games, { id: game.id }) >= 0
  );
  const teamGameTimes = teamGames
    .map(game => game.startTime)
    .map(startTime =>
      startTime ? getTimeFromString(startTime, 'minutes') : 0
    );

  let lastGameTime = 0;
  let firstGameTime = 0;

  if (teamGameTimes.length > 1) {
    lastGameTime = teamGameTimes[teamGameTimes.length - 1] + totalGameTime;
    firstGameTime = teamGameTimes[0];
  }

  return timeToString(lastGameTime - firstGameTime);
};

const calculateBackToBacks = (teamCard: ITeamCard, games: IGame[]) => {
  const teamGames = games.filter(
    game => findIndex(teamCard.games, { id: game.id }) >= 0
  );
  const timeSlots = teamGames.map(game => game.timeSlotId);
  const timeSlotsSorted = orderBy(timeSlots, [], 'asc');
  const backToBacks: number[] = [];

  timeSlotsSorted.map((ts, index, arr) =>
    arr[index] === arr[index + 1] || arr[index + 1] - arr[index] === 1
      ? backToBacks.push(arr[index], ts)
      : null
  );

  const backToBackUnique = union(backToBacks);
  return backToBackUnique.length;
};

export const calculateNumOfTimeSlots = (
  gap: number,
  teamCard: ITeamCard,
  games: IGame[]
) => {
  if (!teamCard.games?.length) return 0;

  const timeSlotIds = games
    .filter(item => findIndex(teamCard.games, { id: item.id }) >= 0)
    .map(item => item.timeSlotId);

  const numOfTimeSlots = timeSlotIds
    .map((v, i, a) => a[i + 1] - v || 0)
    .filter(item => item);

  return numOfTimeSlots.filter(item => item - 1 === gap).length;
};

const calculateTeamDiagnostics = (
  teamCard: ITeamCard,
  diagnosticsProps: ITeamsDiagnosticsProps
) => {
  const { fields, games, divisions, totalGameTime } = diagnosticsProps;

  const name = teamCard.name;
  const division = find(divisions, { id: teamCard.divisionId });
  const divisionName = division?.name || '';
  const premierDivision = division?.isPremier ? 'True' : 'False';
  const numOfGames = teamCard.games?.length || 0;
  const teamGames = games.filter(
    game => findIndex(teamCard.games, { id: game.id }) >= 0
  );

  const tournamentTime = calculateTeamTournamentTime(
    teamCard,
    games,
    totalGameTime
  );

  const numOfBackToBacks = calculateBackToBacks(teamCard, games);
  const fieldIds = teamGames.map(game => game.fieldId);
  const fieldNames = fields
    .filter(field => fieldIds.includes(field.id))
    .map(field => field.name);

  const numOfTimeSlots1 = calculateNumOfTimeSlots(1, teamCard, games);
  const numOfTimeSlots2 = calculateNumOfTimeSlots(2, teamCard, games);
  const numOfTimeSlots3 = calculateNumOfTimeSlots(3, teamCard, games);
  const numOfTimeSlots4 = calculateNumOfTimeSlots(4, teamCard, games);

  const numOfFields: string = fieldNames?.length ? fieldNames.join(', ') : '-';

  return [
    name,
    divisionName,
    premierDivision,
    numOfGames,
    tournamentTime,
    numOfBackToBacks,
    numOfTimeSlots1,
    numOfTimeSlots2,
    numOfTimeSlots3,
    numOfTimeSlots4,
    numOfFields,
  ];
};

const formatTeamsDiagnostics = (diagnosticsProps: ITeamsDiagnosticsProps) => {
  const { teamCards } = diagnosticsProps;
  const teamsArr = teamCards.map(teamCard =>
    calculateTeamDiagnostics(teamCard, diagnosticsProps)
  );

  const orderedData = orderBy(teamsArr, arr => [arr[1], arr[0]]);

  const header = [
    'Team Name',
    'Division Name',
    'Premier Division',
    '# of Games',
    'Tournament Time',
    '# of Back-to-Back games',
    '1 Time Slots between games',
    '2 Time Slots between games',
    '3 Time Slots between games',
    '4 Time Slots between games',
    'Field Name(s)',
  ];

  return {
    header,
    body: orderedData,
  };
};

export default formatTeamsDiagnostics;
