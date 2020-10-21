import { Auth } from "aws-amplify";
import api from "api/api";
import { IBracket, IFetchedBracket } from "common/models/playoffs/bracket";
import { dateToShortString, getVarcharEight } from "helpers";
import { IField, IMember } from "common/models";
import {
  bracketDirectionEnum,
  bracketSourceTypeEnum,
  IBracketConnector,
  IBracketGame,
} from "./bracketGames";
import { IPlayoffGame } from "common/models/playoffs/bracket-game";

const YN = (v: boolean) => (v ? 1 : 0);

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
    use_facil_abbr_YN: bracket.useFacilAbbr ? 1 : 0,
    custom_playoffs_YN: bracket.customPlayoff ? 1 : 0,
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

const getGameDependency = (
  game: IBracketGame,
  isHome: boolean = false
): number | null => {
  if (!game.connectedBrackets) return null;
  const connectors = game.connectedBrackets
    .filter((c: IBracketConnector) =>
      game.direction === bracketDirectionEnum.Right
        ? (game.xLeft || c.x) > c.x
        : game.direction === bracketDirectionEnum.Left
        ? (game.xLeft || c.x) < c.x
        : false
    )
    .sort((a: IBracketConnector, b: IBracketConnector) => a.y - b.y);
  const connector =
    connectors && connectors.length > 0
      ? connectors[isHome ? connectors.length - 1 : 0]
      : null;
  return connector &&
    ((isHome && connector.y > (game.yTop || connector.y)) ||
      (!isHome && connector.y < (game.yTop || connector.y)))
    ? connector.index
    : null;
};

const getGameConnections = (
  bracketGames: IPlayoffGame[],
  game: IPlayoffGame
): IBracketConnector[] | undefined => {
  return (
    [
      ...bracketGames
        .filter(
          (g: IPlayoffGame) =>
            g.game_num === game.away_depends_upon ||
            g.game_num === game.home_depends_upon
        )
        .map(
          (g: IPlayoffGame) =>
            ({
              id: g.game_id,
              index: g.game_num,
              y: g.y_top,
              x: g.x_left,
              direction:
                (g.x_left || 0) > (game.x_left || 0)
                  ? bracketDirectionEnum.Right
                  : bracketDirectionEnum.Left,
            } as IBracketConnector)
        ),
    ] || undefined
  );
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
      grid_num: game.gridNum || 1,
      round_num: game.round || 1,
      field_id: game.fieldId || null,
      facilities_id: game.facilitiesId || null,
      pool_id: game.poolId || null,
      game_date: dateToShortString(game.gameDate!),
      game_num: game.index,
      game_note: game.gameNote || null,
      away_depends_upon: bracket.customPlayoff
        ? getGameDependency(game)
        : game.awayDependsUpon || null,
      home_depends_upon: bracket.customPlayoff
        ? getGameDependency(game, true)
        : game.homeDependsUpon || null,
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
      home_source_type: game.homeSourceType || null,
      home_source_id: game.homeSourceId || null,
      home_source_value: game.homeSourceValue || null,
      away_source_type: game.awaySourceType || null,
      away_source_id: game.awaySourceId || null,
      away_source_value: game.awaySourceValue || null,
      x_left: game.xLeft || null,
      x_width: game.xWidth || null,
      y_top: game.yTop || null,
      y_height: game.yHeight || null,
      direction: game.direction || null,
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
    useFacilAbbr: bracketData.use_facil_abbr_YN || 0,
    customPlayoff: bracketData.custom_playoffs_YN || 0,
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
  const fetchedBracketGames = bracketGames.map(
    (game: IPlayoffGame): IBracketGame =>
      mapFetchedBracketGame(game, fields, bracketGames)
  );
  return fetchedBracketGames?.map((g: IBracketGame) => ({
    ...g,
    connectedBrackets: [
      ...g.connectedBrackets,
      ...fetchedBracketGames
        .filter(
          (fB: IBracketGame) =>
            fB.divisionId === g.divisionId &&
            fB.connectedBrackets?.find((c: IBracketConnector) => c.id === g.id)
        )
        .map(
          (fB: IBracketGame) =>
            ({
              id: fB.id,
              index: fB.index,
              y: fB.yTop,
              x: fB.xLeft,
              direction: fB.direction,
            } as IBracketConnector)
        ),
    ],
  }));
};

export const mapFetchedBracketGame = (
  bracketGame: IPlayoffGame,
  fields: IField[],
  bracketGames: IPlayoffGame[] = []
): IBracketGame => {
  return {
    id: bracketGame.game_id,
    index: bracketGame.game_num,
    round: bracketGame.round_num,
    gridNum: bracketGame.grid_num || 1,
    gameNote: bracketGame.game_note || "",
    divisionId: bracketGame.division_id,
    divisionName: bracketGame.bracket_year || undefined,
    awaySeedId: bracketGame.seed_num_away || undefined,
    homeSeedId: bracketGame.seed_num_home || undefined,
    awayTeamId: bracketGame.away_team_id || undefined,
    homeTeamId: bracketGame.home_team_id || undefined,
    awayTeamScore: bracketGame.away_team_score || undefined,
    homeTeamScore: bracketGame.home_team_score || undefined,
    awayDependsUpon: bracketGame.away_depends_upon || undefined,
    homeDependsUpon: bracketGame.home_depends_upon || undefined,
    awayDisplayName: bracketGame.away_display || "",
    homeDisplayName: bracketGame.home_display || "",
    poolId: bracketGame.pool_id || undefined,
    fieldId: bracketGame.field_id || undefined,
    facilitiesId:
      fields.find((item) => item.field_id === bracketGame.field_id)
        ?.facilities_id || undefined,
    fieldName: fields.find((item) => item.field_id === bracketGame.field_id)
      ?.field_name,
    startTime: bracketGame.start_time || undefined,
    gameDate: dateToShortString(bracketGame.game_date.toString()),
    hidden: !bracketGame.is_active_YN,
    isCancelled: Boolean(bracketGame.is_cancelled_YN),
    createDate: bracketGame.created_datetime,
    homeSourceType: bracketGame.home_source_type
      ? bracketSourceTypeEnum[bracketGame.home_source_type]
      : undefined,
    homeSourceId: bracketGame.home_source_id || undefined,
    homeSourceValue: bracketGame.home_source_value || undefined,
    awaySourceType: bracketGame.away_source_type
      ? bracketSourceTypeEnum[bracketGame.away_source_type]
      : undefined,
    awaySourceId: bracketGame.away_source_id || undefined,
    awaySourceValue: bracketGame.away_source_value || undefined,
    xLeft: bracketGame.x_left || undefined,
    xWidth: bracketGame.x_width || undefined,
    yTop: bracketGame.y_top || undefined,
    yHeight: bracketGame.y_height || undefined,
    direction: bracketGame.direction
      ? bracketDirectionEnum[bracketGame.direction]
      : undefined,
    connectedBrackets: getGameConnections(
      bracketGames?.filter(
        (g: IPlayoffGame) => g.division_id === bracketGame.division_id
      ) || [],
      bracketGame
    ),
  };
};
