import { IField } from "common/models/schedule/fields";
import { IScheduleFacility } from "common/models/schedule/facilities";
import { IGame } from "components/common/matrix-table/helper";
import { IDivision } from "common/models";
import { formatPhoneNumber } from "helpers/formatPhoneNumber";
import api from "api/api";

interface AuthorizedReporter {
  sms_scorer_id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  is_active_YN: 0 | 1;
}

const getFieldsByFacility = (fields: IField[], facility: IScheduleFacility) => {
  const filedsByFacility = fields.filter(
    (field) => field.facilityId === facility.id
  );

  return filedsByFacility;
};

const getGamesByField = (games: IGame[], field: IField) => {
  const gamesByFiled = games.filter((game) => game.fieldId === field.id);

  return gamesByFiled;
};

const getGamesByDivision = (games: IGame[], division: IDivision) => {
  const gamesByDivision = games.map((game) => {
    if (
      game.awayTeam?.divisionId === division.division_id &&
      game.homeTeam?.divisionId === division.division_id
    ) {
      return game;
    } else {
      const newGame = {
        ...game,
        awayTeam: undefined,
        homeTeam: undefined,
      };
      return newGame;
    }
  });

  return gamesByDivision;
};

const isEmptyGames = (games: IGame[]) => {
  const gameEmpties = games.map((game) => {
    return Boolean(game.awayTeam && game.homeTeam);
  });

  return !gameEmpties.includes(true);
};

const getGamesByFacility = (games: IGame[], facility: IScheduleFacility) => {
  const gamesByFacility = games.filter(
    (it: IGame) => it.facilityId === facility.id
  );

  return gamesByFacility;
};

const getGamesByDays = (games: IGame[]) => {
  const gamesByDays = games.reduce((acc, game) => {
    const day = game.gameDate;

    acc[day!] = acc[day!] ? [...acc[day!], game] : [game];

    return acc;
  }, {});

  return gamesByDays;
};

const getScorers = async (eventId: string) => {
  const scorers = (await api.get(
    `sms_authorized_scorers?event_id=${eventId}`
  )) as AuthorizedReporter[];
  const scorer = scorers?.find(
    (it: AuthorizedReporter) => it.is_active_YN === 1
  );
  return formatPhoneNumber(scorer?.mobile || "") as string;
};

export {
  getFieldsByFacility,
  getGamesByField,
  getGamesByFacility,
  getGamesByDays,
  getGamesByDivision,
  isEmptyGames,
  getScorers,
};
