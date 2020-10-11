import {
  IField,
  ISchedulesGame,
  ISchedulesGameWithNames,
  ITeam,
} from "common/models";
import { dateToShortString } from "./date.helper";

export const findTeam = (teamId: string, teams: ITeam[]) => {
  return teams.find((team) => team.team_id === teamId);
};

const mapScheduleGamesWithNames = (
  teams: ITeam[],
  fields: IField[],
  games: ISchedulesGame[]
) => {
  return games?.map(
    (game: ISchedulesGame): ISchedulesGameWithNames => {
      const currentField = fields.find(
        (field: IField) => field.field_id === game.field_id
      );

      const findedAwayTeam: ITeam | undefined = game.away_team_id
        ? findTeam(game.away_team_id, teams)
        : undefined;
      const findedHomeTeam: ITeam | undefined = game.home_team_id
        ? findTeam(game.home_team_id, teams)
        : undefined;
      return {
        id: game.game_id,
        fieldId: game.field_id,
        fieldName: currentField?.field_name || "Field",
        awayTeamId: game.away_team_id,
        awayTeamName: findedAwayTeam ? findedAwayTeam.short_name : null,
        awayTeamScore: game.away_team_score,
        homeTeamId: game.home_team_id,
        homeTeamName: findedHomeTeam ? findedHomeTeam.short_name : null,
        homeTeamScore: game.home_team_score,
        gameDate: dateToShortString(game.game_date),
        startTime: game.game_time!,
        createTime: game.created_datetime,
        updatedTime: game.updated_datetime,
      };
    }
  );
};

export { mapScheduleGamesWithNames };
