import { ISchedule, IConfigurableSchedule } from "common/models/schedule";
import { IGame } from "components/common/matrix-table/helper";
import { Auth } from "aws-amplify";
import api from "api/api";
import { IMember } from "common/models";
import { ISchedulesDetails } from "common/models/schedule/schedules-details";
import { dateToShortString, getVarcharEight } from "helpers";
import { ITeam, ITeamCard } from "common/models/schedule/teams";
import { ISchedulesGame } from "common/models/schedule/game";
import { ISchedulingSchedule } from "components/scheduling/types";
import { unionWith, isEqual } from "lodash-es";
import { GameType } from "components/common/matrix-table/dnd/drop";

export const mapScheduleData = (
  scheduleData: IConfigurableSchedule
): ISchedule => {
  const data = {
    ...scheduleData,
  };

  delete data?.num_fields;
  delete data?.periods_per_game;
  return data;
};

export const mapSchedulingScheduleData = (
  scheduleData: ISchedulingSchedule
) => {
  const data = { ...scheduleData };
  delete data?.createdByName;
  delete data?.updatedByName;
  return data;
};

const getVersionId = (
  gameId: number,
  gameDate?: string,
  schedulesDetails?: ISchedulesDetails[]
) => {
  if (schedulesDetails) {
    return schedulesDetails.find(
      (item: ISchedulesDetails) =>
        Number(item.matrix_game_id) === Number(gameId) &&
        gameDate &&
        dateToShortString(item.game_date) === dateToShortString(gameDate)
    )?.game_id;
  }
  return false;
};

const getMember = async () => {
  const currentSession = await Auth.currentSession();
  const userEmail = currentSession.getIdToken().payload.email;
  const members = await api.get(`/members?email_address=${userEmail}`);
  const member: IMember = members?.find(
    (it: IMember) => it.email_address === userEmail
  );
  return member;
};

const getLockedValue = (team?: ITeamCard, game?: IGame) =>
  team &&
  game &&
  team?.games?.find(
    (teamGame) =>
      teamGame.id === game?.id &&
      dateToShortString(teamGame.date) === dateToShortString(game?.gameDate)
  )?.isTeamLocked
    ? 1
    : 0;

export const mapSchedulesTeamCards = async (
  scheduleData: ISchedule,
  games: IGame[],
  isDraft: boolean,
  schedulesDetails?: ISchedulesDetails[]
) => {
  const member = await getMember();
  const memberId = member.member_id;

  const scheduleId = scheduleData.schedule_id;
  const eventId = scheduleData.event_id;

  const scheduleDetails: ISchedulesDetails[] = games.map((game) => ({
    game_id:
      getVersionId(game.id, game.gameDate, schedulesDetails) ||
      getVarcharEight(),
    schedule_version_desc: null,
    schedule_id: scheduleId,
    schedule_desc: null,
    event_id: eventId,
    division_id: game.divisionId || game.homeTeam?.divisionId || null,
    pool_id: game.homeTeam?.poolId || null,
    matrix_game_id: game.id,
    game_date: dateToShortString(game.gameDate) || null,
    game_time: game.startTime || null,
    field_id: game.fieldId,
    facilities_id: game.facilityId || null,
    away_team_id: game.awayTeamId || game.awayTeam?.id || null,
    home_team_id: game.homeTeamId || game.homeTeam?.id || null,
    game_locked_YN: null,
    away_team_locked: getLockedValue(game.awayTeam, game),
    home_team_locked: getLockedValue(game.homeTeam, game),
    is_draft_YN: isDraft ? 1 : 0,
    created_by: memberId,
    created_datetime: game.createDate || new Date().toISOString(),
    updated_by: memberId,
    updated_datetime: new Date().toISOString(),
  }));

  return scheduleDetails;
};

export const getGameIdFromPublished = (
  game: IGame,
  games?: ISchedulesGame[]
) => {
  return games
    ? games.find(
        (item: ISchedulesGame) =>
          item.game_time === game.startTime &&
          dateToShortString(item.game_date) ===
            dateToShortString(game.gameDate) &&
          item.field_id === game.fieldId
      )?.game_id
    : null;
};

export const getGameIdFromPublishedSchedulesGame = (
  game: ISchedulesGame,
  games?: ISchedulesGame[]
) => {
  return games
    ? games.find(
        (item: ISchedulesGame) =>
          item.game_time === game.game_time &&
          dateToShortString(item.game_date) ===
            dateToShortString(game.game_date) &&
          item.field_id === game.field_id
      )?.game_id
    : null;
};

export const mapTeamCardsToSchedulesGames = async (
  scheduleData: ISchedule,
  games: IGame[],
  publishedGames?: ISchedulesGame[]
) => {
  const member = await getMember();
  const memberId = member.member_id;

  const scheduleId = scheduleData.schedule_id;
  const eventId = scheduleData.event_id;

  const schedulesGames: ISchedulesGame[] = games.map((game: IGame) => ({
    game_id: (
      getGameIdFromPublished(game, publishedGames) ||
      game.varcharId ||
      getVarcharEight()
    )?.toString(),
    game_type: game.gameType,
    event_id: eventId,
    schedule_id: scheduleId,
    sport_id: 1,
    facilities_id: game.facilityId || null,
    field_id: game.fieldId,
    game_date: dateToShortString(game.gameDate) || "",
    game_time: game.startTime || "",
    division_id: game.awayTeam?.divisionId || null,
    pool_id: game.awayTeam?.poolId || null,
    away_team_id: game.awayTeam?.id || null,
    home_team_id: game.homeTeam?.id || null,
    away_team_score:
      game.awayTeam?.games?.find(
        (g) =>
          g.id === game.id &&
          dateToShortString(game.gameDate) === dateToShortString(g.date)
      )?.teamScore || null,
    home_team_score:
      game.homeTeam?.games?.find(
        (g) =>
          g.id === game.id &&
          dateToShortString(game.gameDate) === dateToShortString(g.date)
      )?.teamScore || null,
    is_active_YN: 1,
    is_final_YN: null,
    finalized_by: null,
    finalized_datetime: null,
    is_bracket_YN: null,
    is_cancelled_YN: game.awayTeam?.games?.find(
      (g) =>
        g.id === game.id &&
        dateToShortString(game.gameDate) === dateToShortString(g.date)
    )?.isCancelled
      ? 1
      : 0,
    created_by: memberId,
    created_datetime: game.createDate || new Date().toISOString(),
    updated_by: memberId,
    updated_datetime: new Date().toISOString(),
  }));

  return schedulesGames;
};

export const mapTeamsFromSchedulesDetails = (
  schedulesDetails: ISchedulesDetails[],
  teams: ITeam[]
) => {
  const sd = schedulesDetails.map((item: ISchedulesDetails) => ({
    matrixGameId: item.matrix_game_id,
    awayTeamId: item.away_team_id,
    homeTeamId: item.home_team_id,
    date: dateToShortString(item.game_date) || undefined,
    awayTeamLocked: item.away_team_locked,
    homeTeamLocked: item.home_team_locked,
    gameType: String(item.game_type) || GameType.game,
  }));

  const runGamesSelection = (team: ITeam) => {
    const games = [
      ...sd
        .filter(
          ({ awayTeamId, homeTeamId }) =>
            awayTeamId === team.id || homeTeamId === team.id
        )
        .map(
          ({
            matrixGameId,
            awayTeamId,
            homeTeamId,
            date,
            awayTeamLocked,
            homeTeamLocked,
            gameType,
          }) => ({
            id: Number(matrixGameId),
            awayTeamId: awayTeamId!,
            homeTeamId: homeTeamId!,
            teamPosition: awayTeamId === team.id ? 1 : 2,
            isTeamLocked:
              awayTeamId === team.id
                ? Boolean(awayTeamLocked)
                : Boolean(homeTeamLocked),
            date,
            gameType,
          })
        ),
    ];

    return unionWith(games, isEqual);
  };

  return (
    teams.map((team) => ({
      ...team,
      games: runGamesSelection(team),
    })) || []
  );
};

export const mapTeamsFromShedulesGames = (
  schedulesGames: ISchedulesGame[],
  teams: ITeam[],
  games: IGame[]
) => {
  const sg = schedulesGames.map((item: ISchedulesGame) => ({
    awayTeamId: item.away_team_id,
    homeTeamId: item.home_team_id,
    awayTeamScore: item.away_team_score,
    homeTeamScore: item.home_team_score,
    startTime: item.game_time,
    fieldId: item.field_id,
    facilities_id: item.facilities_id,
    date: dateToShortString(item.game_date),
    isCancelled: Boolean(item.is_cancelled_YN),
  }));

  const runGamesSelection = (team: ITeam) => {
    const localGames = [
      ...sg
        .filter(
          ({ awayTeamId, homeTeamId }) =>
            awayTeamId === team.id || homeTeamId === team.id
        )
        .map((scheduleGame) => ({
          id: games.find(
            (game) =>
              game.startTime === scheduleGame.startTime &&
              game.fieldId === scheduleGame.fieldId
          )?.id!,
          date: dateToShortString(scheduleGame.date),
          isCancelled: scheduleGame.isCancelled,
          teamPosition: scheduleGame.awayTeamId === team.id ? 1 : 2,
          teamScore:
            scheduleGame.awayTeamId === team.id
              ? scheduleGame.awayTeamScore
              : scheduleGame.homeTeamScore,
        })),
    ];

    return unionWith(localGames, isEqual);
  };

  return teams.map((team) => ({
    ...team,
    games: runGamesSelection(team),
  }));
};
