import moment from 'moment';
import {
  settleTeamsPerGamesDays,
  IGame,
} from 'components/common/matrix-table/helper';
import { mapSchedulesTeamCards } from 'components/schedules/mapScheduleData';
import { calculateTournamentDays, dateToShortString } from 'helpers';
import {
  IEventDetails,
  ISchedule,
  ISchedulesDetails,
  IPool,
} from 'common/models';
import { ITeamCard } from 'common/models/schedule/teams';
import { IField } from 'common/models/schedule/fields';
import { IScheduleFacility } from 'common/models/schedule/facilities';

interface IScore {
  awayTeamId: string | undefined;
  awayTeamScore: number | null;
  homeTeamId: string | undefined;
  homeTeamScore: number | null;
  gameDate: string | null;
  fieldId: string | null;
  timeSlot: string | null;
};

export enum TableType {
  SCHEDULE,
  SCORING
};

const getScheduleTableRow = (
  schedulesDetails: ISchedulesDetails[],
  facilities: IScheduleFacility[],
  fields: IField[],
  teamCards: ITeamCard[],
  pools: IPool[],
  scores?: IScore[]
) => {
  const rows = schedulesDetails.reduce((acc, it: ISchedulesDetails) => {
    if (!it.away_team_id && !it.home_team_id) {
      return acc;
    }

    const date = it.game_date ? moment(it.game_date).format('L') : '';
    const time = it.game_time;
    const field = fields.find(field => field.id === it.field_id);
    const facility = facilities.find(
      facility => facility.id === field?.facilityId
    );
    const awayTeam = teamCards.find(
      teamCard => teamCard.id === it.away_team_id
    );
    const homeTeam = teamCards.find(
      teamCard => teamCard.id === it.home_team_id
    );
    const divisionName = awayTeam?.divisionShortName;
    const pool = pools.find(pool => pool.pool_id === it.pool_id);

    const row = scores
      ? [
      date,
      time,
      facility?.name,
      field?.name,
      divisionName,
      pool?.pool_name,
      awayTeam?.name,
      scores.find(
        (game: IScore) =>
          game.awayTeamId === it.away_team_id &&
          game.homeTeamId === it.home_team_id &&
          dateToShortString(game.gameDate) === dateToShortString(it.game_date) &&
          game.fieldId === it.field_id &&
          game.timeSlot === it.game_time
      )?.awayTeamScore || '',
      homeTeam?.name,
      scores?.find(
        (game: IScore) =>
          game.awayTeamId === it.away_team_id &&
          game.homeTeamId === it.home_team_id &&
          dateToShortString(game.gameDate) === dateToShortString(it.game_date) &&
          game.fieldId === it.field_id &&
          game.timeSlot === it.game_time
      )?.homeTeamScore || '',
        ]
      : [
      date,
      time,
      facility?.name,
      field?.name,
      divisionName,
      pool?.pool_name,
      awayTeam?.name,
      homeTeam?.name,
    ];

    return [...acc, row];
  }, [] as Array<number | string | null | undefined>[]);

  return rows;
};

const getScores = (schedulesTableGames: IGame[]) => {
  return schedulesTableGames.map((game: IGame) => {
    return {
      awayTeamId: game.awayTeam?.id,
      homeTeamId: game.homeTeam?.id,
      awayTeamScore: game.awayTeamScore,
      homeTeamScore: game.homeTeamScore,
      gameDate: game.gameDate,
      fieldId: game.fieldId,
      timeSlot: game.startTime,
    } as IScore;
  });
}

const getScheduleTableXLSX = async (
  event: IEventDetails,
  schedule: ISchedule,
  games: IGame[],
  teamCards: ITeamCard[],
  facilities: IScheduleFacility[],
  fields: IField[],
  pools: IPool[],
  tableType: TableType
) => {
  const header =
    tableType === TableType.SCHEDULE
      ? [
          "Date",
          'Time',
          'Facility',
          'Field',
          'Division',
          'Pool',
          'Away Team Name',
          'Home Team Name',
        ]
      : [
          'Date',
          'Time',
          'Facility',
          'Field',
          'Division',
          'Pool',
          'Away Team Name',
          'Away Team Score',
          'Home Team Name',
          'Home Team Score',
        ];

  const tournamentDays = calculateTournamentDays(event);

  let schedulesTableGames = [];
  for (const day of tournamentDays) {
    schedulesTableGames.push(settleTeamsPerGamesDays(games, teamCards, day));
  }
  schedulesTableGames = tableType === TableType.SCORING 
                          ? games
                          : schedulesTableGames.flat();
                          
  const scores = getScores(schedulesTableGames);
 
  const schedulesDetails = await mapSchedulesTeamCards(
    schedule,
    schedulesTableGames,
    false,
    undefined
  );
  
  const body =
    tableType === TableType.SCHEDULE
      ? getScheduleTableRow(
          schedulesDetails,
          facilities,
          fields,
          teamCards,
          pools
        )
      : getScheduleTableRow(
          schedulesDetails,
          facilities,
          fields,
          teamCards,
          pools,
          scores
        );

  return {
    header,
    body,
  };
};

export { getScheduleTableXLSX };
