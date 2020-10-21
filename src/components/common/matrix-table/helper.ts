import { findIndex, orderBy, union } from "lodash-es";
import { IField } from "common/models/schedule/fields";
import { ITeamCard } from "common/models/schedule/teams";
import ITimeSlot from "common/models/schedule/timeSlots";
import { dateToShortString } from "../../../helpers";
import { GameType } from "./dnd/drop";
import {
  bracketSourceTypeEnum,
  IBracketGame,
} from "components/playoffs/bracketGames";

export enum TeamPositionEnum {
  "awayTeam" = 1,
  "homeTeam" = 2,
}

export interface IGame {
  id: number;
  varcharId?: string | number;
  startTime?: string;
  facilityId?: string;
  homeTeam?: ITeamCard;
  awayTeam?: ITeamCard;
  timeSlotId: number;
  fieldId: string;
  isPremier?: boolean;
  // PLAYOFFS
  awayDependsUpon?: number;
  homeDependsUpon?: number;
  isPlayoff?: boolean;
  playoffRound?: number;
  playoffIndex?: number;
  awaySeedId?: number;
  homeSeedId?: number;
  awayTeamId?: string;
  homeTeamId?: string;
  awayDisplayName?: string;
  homeDisplayName?: string;
  divisionName?: string;
  poolId?: string;
  poolHex?: string;
  divisionHex?: string;
  divisionId?: string;
  bracketGameId?: string;
  gameDate?: string;
  scheduleVersionId?: string;
  createDate?: string;
  isCancelled?: boolean;
  // custom playoff
  homeSourceType?: bracketSourceTypeEnum;
  homeSourceId?: string;
  homeSourceValue?: string;
  awaySourceType?: bracketSourceTypeEnum;
  awaySourceId?: string;
  awaySourceValue?: string;
  //
  awayTeamScore?: number;
  homeTeamScore?: number;
  gameType?: string | GameType | null;
}

export interface IConfigurableGame extends IGame {
  isAssigned?: boolean;
}

export interface IDefinedGames {
  gameTimeSlots: number;
  gameFields: number;
  games: IGame[];
}

export const sortFieldsByPremier = (fields: IField[]) => {
  return fields.sort(
    (a, b): any =>
      (b.isPremier ? 1 : 0) - (a.isPremier ? 1 : 0) ||
      a.facilityName.localeCompare(b.facilityName, undefined, {
        numeric: true,
      }) ||
      a.name?.localeCompare(b.name!, undefined, { numeric: true })
  );
};

export const defineGames = (
  fields: IField[],
  timeSlots: ITimeSlot[]
): IDefinedGames => {
  const fieldsNumber = fields.length;
  const timeSlotsNumber = timeSlots.length;
  const gamesNumber = fieldsNumber * timeSlotsNumber;

  const games: IGame[] = [];
  for (let i = 1; i <= gamesNumber; i++) {
    const timeSlotId = Math.ceil(i / fieldsNumber) - 1;
    const startTime = timeSlots.find(
      (timeSlot: ITimeSlot) => timeSlot.id === timeSlotId
    )?.time;
    const field = fields[i - Math.ceil(timeSlotId * fieldsNumber) - 1];
    const fieldId = field.id;
    const facilityId = field.facilityId;

    games.push({
      id: i,
      startTime,
      timeSlotId,
      fieldId,
      facilityId,
    });
  }

  return {
    gameTimeSlots: timeSlotsNumber,
    gameFields: gamesNumber <= fieldsNumber ? gamesNumber : fieldsNumber,
    games,
  };
};

const getScore = (
  teamCards: ITeamCard[],
  gameId: number,
  day: string | Date | null | undefined,
  position: 1 | 2
) => {
  let currentScore;
  teamCards.map((team: ITeamCard) => {
    const score = team.games?.find(
      (g) =>
        g.id === gameId &&
        g.teamPosition === position &&
        dateToShortString(g.date) === dateToShortString(day)
    );
    if (score) {
      currentScore = score.teamScore;
    }
  });
  return currentScore;
};

export const selectProperGamesPerTimeSlot = (
  timeSlot: ITimeSlot,
  games: IGame[]
) => games.filter((game: IGame) => game.timeSlotId === timeSlot.id);

export const settleTeamsPerGamesDays = (
  games: IGame[],
  teamCards: ITeamCard[],
  day: string
) => {
  return games.map((game: IGame) => ({
    ...game,
    gameDate: day,
    awayTeam: teamCards.find((team: ITeamCard) =>
      team.games?.find(
        (g) =>
          g.id === game.id &&
          g.teamPosition === 1 &&
          dateToShortString(g.date) === dateToShortString(day)
      )
    ),
    awayTeamScore: getScore(teamCards, game.id, day, 1),
    homeTeam: teamCards.find((team: ITeamCard) =>
      team.games?.find(
        (g) =>
          g.id === game.id &&
          g.teamPosition === 2 &&
          dateToShortString(g.date) === dateToShortString(day)
      )
    ),
    homeTeamScore: getScore(teamCards, game.id, day, 2),
    gameType:
      teamCards
        .map((teamCard: ITeamCard) => teamCard.games)
        .find((games) =>
          games?.find((teamCardGame) => teamCardGame.id === game.id)
        )
        ?.find((teamCardGame) => teamCardGame.id === game.id)?.gameType ||
      GameType.game,
  }));
};

export const settleTeamsPerGames = (
  games: IGame[],
  teamCards: ITeamCard[],
  days?: string[],
  selectedDay?: string
) => {
  if (days?.length && selectedDay) {
    return games.map((game: IGame) => ({
      ...game,
      bracketGameId: game.bracketGameId,
      gameDate: days[+selectedDay - 1],
      awayTeam: teamCards.find((team: ITeamCard) =>
        team.games?.find(
          (g) =>
            g.id === game.id &&
            g.teamPosition === 1 &&
            dateToShortString(g.date) ===
              dateToShortString(days[+selectedDay - 1])
        )
      ),
      homeTeam: teamCards.find((team: ITeamCard) =>
        team.games?.find(
          (g) =>
            g.id === game.id &&
            g.teamPosition === 2 &&
            dateToShortString(g.date) ===
              dateToShortString(days[+selectedDay - 1])
        )
      ),
      gameType:
        teamCards
          .map((teamCard: ITeamCard) => teamCard.games)
          .find((games) =>
            games?.find(
              (teamCardGame) =>
                teamCardGame.id === game.id &&
                teamCardGame.date === days[+selectedDay - 1]
            )
          )
          ?.find((teamCardGame) => teamCardGame.id === game.id)?.gameType ||
        GameType.game,
    }));
  }

  return games.map((game: IGame) => ({
    ...game,
    awayTeam: teamCards.find(
      (team: ITeamCard) =>
        findIndex(team.games, { id: game.id, teamPosition: 1 }) >= 0
    ),
    homeTeam: teamCards.find(
      (team: ITeamCard) =>
        findIndex(team.games, { id: game.id, teamPosition: 2 }) >= 0
    ),
  }));
};

export const arrayAverageOccurrence = (array: any[]) => {
  if (array.length === 0) return null;
  const modeMap = {};
  let maxCount = 1;
  let modes = [];

  for (const el of array) {
    if (modeMap[el] == null) modeMap[el] = 1;
    else modeMap[el]++;

    if (modeMap[el] > maxCount) {
      modes = [el];
      maxCount = modeMap[el];
    } else if (modeMap[el] === maxCount) {
      modes.push(el);
      maxCount = modeMap[el];
    }
  }

  return modes[0];
};

export const getSortedByGamesNum = (data: any) =>
  Object.keys(data).sort((a, b) =>
    data[a].gamesNum < data[b].gamesNum ? 1 : -1
  );

export const getSortedDesc = (data: any) =>
  Object.keys(data).sort((a, b) => (data[a] < data[b] ? 1 : -1));

export const calculateDays = (teamCards: ITeamCard[]) => {
  const games = teamCards.map((item: ITeamCard) => item.games).flat();
  const gamesDates = games
    .map((item) => item.date)
    .filter((date) => date !== undefined);
  const uniqueDates = union(gamesDates);
  return orderBy(uniqueDates, [], "asc");
};

const hexToRgb = (hex?: string) => {
  if (!hex) {
    return null;
  }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const getContrastingColor = (color?: string) => {
  const colorRGB = hexToRgb(color);
  if (colorRGB) {
    const luminance =
      // Original: 0.299 + 0.587 + 0.114.
      colorRGB.r * 0.29 + colorRGB.g * 0.58 + colorRGB.b * 0.1;
    return luminance >= 123 ? "#000" : "#FFF";
  }
  return "#FFF";
};

export const mapBracketGameToGame = (
  games: IGame[],
  bracketGames: IBracketGame[]
) => {
  return games.map((game: IGame) => {
    const addedGame = bracketGames.find(
      (bracketGame: IBracketGame) =>
        bracketGame.fieldId === game.fieldId &&
        game.startTime === bracketGame.startTime &&
        game.gameDate === bracketGame.gameDate
    );
    if (addedGame) {
      return {
        ...game,
        awaySourceType: addedGame.awaySourceType,
        homeSourceType: addedGame.homeSourceType,
        awaySourceId: addedGame.awaySourceId,
        homeSourceId: addedGame.homeSourceId,
        awaySourceValue: addedGame.awaySourceValue,
        homeSourceValue: addedGame.homeSourceValue,
      };
    }
    return game;
  });
};
