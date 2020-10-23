import { ISchedulesGame, ISchedulesDetails } from "common/models";
import { IGame } from "components/common/matrix-table/helper";
import { IBracketGame } from "components/playoffs/bracketGames";
import { orderBy } from "lodash-es";
import { formatTimeSlot, dateToShortString } from "helpers";

const mapGamesWithSchedulesGames = (
  games: IGame[],
  schedulesGames: ISchedulesGame[],
  selectedDay?: string
) => {
  const mappedGames = games?.map((game: IGame) => ({
    ...game,
    gameDate: game.gameDate || selectedDay,
    varcharId: schedulesGames.find(
      (schedulesGame: ISchedulesGame) =>
        game.fieldId === schedulesGame.field_id &&
        game.startTime === schedulesGame.game_time &&
        dateToShortString(selectedDay || game.gameDate) ===
          dateToShortString(schedulesGame.game_date)
    )?.game_id,
  }));

  return mappedGames;
};

const mapGamesWithSchedulesDetails = (
  games: IGame[],
  schedulesGames: ISchedulesDetails[]
) => {
  const mappedGames = games?.map((game: IGame) => ({
    ...game,
    varcharId: schedulesGames.find(
      (schedulesGame: ISchedulesDetails) =>
        game.fieldId === schedulesGame.field_id &&
        game.startTime === schedulesGame.game_time &&
        dateToShortString(game.gameDate) ===
          dateToShortString(schedulesGame.game_date)
    )?.game_id,
  }));

  return mappedGames;
};

const getSortedWarnGames = (games: IBracketGame[]) => {
  const sortedWarnGames = orderBy(
    games,
    ["index", "divisionName"],
    ["asc", "asc"]
  );

  return sortedWarnGames;
};

const getGamesWartString = (message: string, games: IBracketGame[]) => {
  const gameWarnString = games.map(
    (item: IBracketGame) =>
      `Game ${item.index} (${item.divisionName}) - ${
        item.fieldName
      }, ${formatTimeSlot(item.startTime!)}\n`
  );

  return message.concat(gameWarnString.join(""));
};

export {
  mapGamesWithSchedulesGames,
  mapGamesWithSchedulesDetails,
  getSortedWarnGames,
  getGamesWartString,
};
