import { Auth } from "aws-amplify";
import api from "api/api";
import { IBracket, IFetchedBracket } from "common/models/playoffs/bracket";
import { dateToShortString, getVarcharEight } from "helpers";
import { IMember, IField } from "common/models";
import { IBracketGame } from "./bracketGames";
import { IPlayoffGame } from "common/models/playoffs/bracket-game";

const YN = (v: boolean) => (!!v ? 1 : 0);

const getMember = async () => {
  const currentSession = await Auth.currentSession();
  const userEmail = currentSession.getIdToken().payload.email;
  const members = await api.get(`/members?email_address=${userEmail}`);
  const member: IMember = members.find(
    (it: IMember) => it.email_address === userEmail
  );
  return member;
};

export const mapBracketData = async (bracket: IBracket, _isDraft: boolean) => {
  const member = await getMember();
  const memberId = member.member_id;

  return {
    bracket_id: bracket.id,
    schedule_id: bracket.scheduleId,
    event_id: bracket.eventId,
    bracket_name: bracket.name,
    bracket_date: bracket.bracketDate,
    bracket_level: bracket.bracketLevel,
    align_games: YN(bracket.alignItems),
    adjust_columns: YN(bracket.adjustTime),
    start_timeslot: bracket.startTimeSlot,
    custom_warmup: bracket.warmup,
    end_timeslot: bracket.endTimeSlot,
    fields_excluded: null,
    is_active_YN: 1,
    multiday_YN: bracket.multiDay ? 1 : 0,
    is_published_YN: bracket.published ? 1 : 0,
    created_by: memberId,
    created_datetime: bracket.createDate || new Date().toISOString(),
    updated_by: memberId,
    updated_datetime: new Date().toISOString(),
  } as IFetchedBracket;
};

export const mapBracketGames = async (
  bracketGames: IBracketGame[],
  bracket: IBracket
) => {
  const member = await getMember();
  const memberId = member.member_id;

  return bracketGames.map(
    (game: IBracketGame): IPlayoffGame => ({
      game_id: game.id || getVarcharEight(),
      bracket_id: bracket.id,
      event_id: bracket.eventId,
      division_id: game.divisionId,
      bracket_year: game.divisionName || null,
      grid_num: game.gridNum,
      round_num: game.round,
      field_id: game.fieldId || null,
      facilities_id: game.facilitiesId || null,
      pool_id: game.poolId || null,
      game_date: dateToShortString(game.gameDate!),
      game_num: game.index,
      game_note: game.gameNote || null,
      away_depends_upon: game.awayDependsUpon || null,
      home_depends_upon: game.homeDependsUpon || null,
      start_time: game.startTime || null,
      seed_num_away: game.awaySeedId || null,
      seed_num_home: game.homeSeedId || null,
      away_team_id: game.awayTeamId || null,
      home_team_id: game.homeTeamId || null,
      away_team_score: game.awayTeamScore || null,
      home_team_score: game.homeTeamScore || null,
      is_cancelled_YN: game.isCancelled ? 1 : 0,
      is_active_YN: 1,
      created_by: memberId,
      created_datetime: game.createDate || new Date().toISOString(),
      updated_by: memberId,
      updated_datetime: new Date().toISOString(),
    })
  );
};

export const mapFetchedBracket = (bracketData: IFetchedBracket) => {
  return {
    id: bracketData.bracket_id,
    name: bracketData.bracket_name,
    scheduleId: bracketData.schedule_id,
    alignItems: !!bracketData.align_games,
    adjustTime: !!bracketData.adjust_columns,
    warmup: bracketData.custom_warmup,
    bracketDate: bracketData.bracket_date,
    bracketLevel: bracketData.bracket_level || 1,
    eventId: bracketData.event_id,
    published: !!bracketData.is_published_YN,
    multiDay: !!bracketData.multiday_YN,
    createdBy: bracketData.created_by,
    createDate: bracketData.created_datetime,
    updatedBy: bracketData.updated_by,
    updateDate: bracketData.updated_datetime,
    startTimeSlot: bracketData.start_timeslot,
    endTimeSlot: bracketData.end_timeslot,
  } as IBracket;
};

export const mapFetchedBracketGames = (
  bracketGames: IPlayoffGame[],
  fields: IField[]
) => {
  return bracketGames.map(
    (game: IPlayoffGame): IBracketGame => mapFetchedBracketGame(game, fields)
  );
};

export const mapFetchedBracketGame = (
  bracketGames: IPlayoffGame,
  fields: IField[]
) => {
  return {
    id: bracketGames.game_id,
    index: bracketGames.game_num,
    round: bracketGames.round_num,
    gridNum: bracketGames.grid_num || 1,
    gameNote: bracketGames.game_note || "",
    divisionId: bracketGames.division_id,
    divisionName: bracketGames.bracket_year || undefined,
    awaySeedId: bracketGames.seed_num_away || undefined,
    homeSeedId: bracketGames.seed_num_home || undefined,
    awayTeamId: bracketGames.away_team_id || undefined,
    homeTeamId: bracketGames.home_team_id || undefined,
    awayTeamScore: bracketGames.away_team_score || undefined,
    homeTeamScore: bracketGames.home_team_score || undefined,
    awayDependsUpon: bracketGames.away_depends_upon || undefined,
    homeDependsUpon: bracketGames.home_depends_upon || undefined,
    awayDisplayName: "",
    homeDisplayName: "",
    poolId: bracketGames.pool_id || undefined,
    fieldId: bracketGames.field_id || undefined,
    facilitiesId:
      fields.find((item) => item.field_id === bracketGames.field_id)
        ?.facilities_id || undefined,
    fieldName: fields.find((item) => item.field_id === bracketGames.field_id)
      ?.field_name,
    startTime: bracketGames.start_time || undefined,
    gameDate: dateToShortString(bracketGames.game_date.toString()),
    hidden: !bracketGames.is_active_YN,
    isCancelled: Boolean(bracketGames.is_cancelled_YN),
    createDate: bracketGames.created_datetime,
  } as IBracketGame;
};
