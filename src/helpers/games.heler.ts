import { updateGameSlot } from "components/playoffs/helper";
import {
  IGame,
  settleTeamsPerGames,
} from "components/common/matrix-table/helper";
import { ITeamCard } from "common/models/schedule/teams";
import { DefaultSelectValues } from "common/enums";
import { IBracketGame } from "components/playoffs/bracketGames";
import ITimeSlot from "common/models/schedule/timeSlots";
import { IDivision } from "common/models";
import { populateDefinedGamesWithPlayoffState } from "components/schedules/definePlayoffs";
import { dateToShortString } from "./date.helper";

const getAllTeamCardGames = (
  teamCards: ITeamCard[],
  games: IGame[],
  eventDays: string[],
  bracketGames?: IBracketGame[],
  playoffTimeSlots?: ITimeSlot[],
  divisions?: IDivision[]
) => {
  return eventDays
    .map((dayValue, idx) => {
      let definedGames = [...games];
      const day = `${idx + 1}`;

      if (+day === eventDays.length && playoffTimeSlots) {
        definedGames = populateDefinedGamesWithPlayoffState(
          games,
          playoffTimeSlots
        );
      }
      definedGames = definedGames.map((item) => {
        const foundBracketGame = bracketGames?.find(
          (bg: IBracketGame) =>
            bg.fieldId === item.fieldId &&
            dateToShortString(bg.gameDate) === dateToShortString(dayValue) &&
            bg.startTime === item.startTime
        );

        return foundBracketGame
          ? updateGameSlot(item, foundBracketGame, divisions)
          : item;
      });

      return settleTeamsPerGames(definedGames, teamCards, eventDays, day);
    })
    .flat();
};

const getGamesByDays = (games: IGame[], activeDay: string[]) => {
  return games?.filter(
    (it) =>
      activeDay.includes(DefaultSelectValues.ALL) ||
      activeDay.includes(dateToShortString(it.gameDate))
  );
};

export { getAllTeamCardGames, getGamesByDays };
