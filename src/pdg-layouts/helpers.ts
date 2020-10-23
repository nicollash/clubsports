import { IField } from "common/models/schedule/fields";
import { IScheduleFacility } from "common/models/schedule/facilities";
import { IScheduleTeamDetails } from "common/models/schedule/schedule-team-details";
import { IGame } from "components/common/matrix-table/helper";
import { IDivision, IReporter, ISchedulesGame } from "common/models";
import { formatPhoneNumber } from "helpers/formatPhoneNumber";
import api from "api/api";
import { dateToShortString } from "helpers";
import ITimeSlot from "common/models/schedule/timeSlots";

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
  const gamesByDivision = games.map((game: IGame) => {
    if (
      (game.divisionId === division.division_id &&
        (!!game.awaySourceType || !!game.homeSourceType)) ||
      (game.awayTeam?.divisionId === division.division_id &&
        game.homeTeam?.divisionId === division.division_id)
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
    return Boolean(
      (game.awayTeam && game.homeTeam) ||
        !!game.awaySourceType ||
        !!game.homeSourceType
    );
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

const GetSortOrderByKeyIndex = (index: any, sort = "ASC") => {
  return function (a: any, b: any) {
    const x = isNaN(index) ? a[index] : a[Object.keys(a)[index]];
    const y = isNaN(index) ? b[index] : b[Object.keys(b)[index]];
    const xx = isNaN(x) ? x.toLowerCase() : x;
    const yy = isNaN(y) ? y.toLowerCase() : y;
    let comparison = 0;
    if (sort === "ASC") {
      if (xx > yy) {
        comparison = 1;
      } else if (xx < yy) {
        comparison = -1;
      }
    } else {
      if (xx > yy) {
        comparison = -1;
      } else if (xx < yy) {
        comparison = 1;
      }
    }
    return comparison;
  };
};

const getDetailsByKey = (details: any[], key: string) => {
  const sortedArray = details.sort(GetSortOrderByKeyIndex(key));
  const groupByKey = sortedArray.reduce((acc, detail) => {
    const value = detail[key];
    acc[value!] = acc[value!] ? [...acc[value!], detail] : [detail];
    return acc;
  }, {});
  return groupByKey;
};

const parseJsonGames = (scheduleTeamDetails: IScheduleTeamDetails[]) => {
  const parsedDetailsList: any[] = [];
  scheduleTeamDetails.map((detail) => {
    const jsonGames = JSON.parse(detail.json_games);
    delete detail.json_games;
    jsonGames.map((opposeTeam: any) => {
      const onlyOneTeam = { ...detail, ...opposeTeam };
      parsedDetailsList.push(onlyOneTeam);
    });
  });
  return parsedDetailsList;
};

const sortJsonGamesList = (parsedJsonGames: any[]) => {
  let parsedDetailsList: any[] = parsedJsonGames;
  // console.log('total parsedDetailsList ->', parsedDetailsList) //
  const divisionArrangedDetails = getDetailsByKey(
    parsedDetailsList,
    "division_name"
  );
  parsedDetailsList = [];
  Object.keys(divisionArrangedDetails).map((divisionKey) => {
    const teamArrangedDetails = getDetailsByKey(
      divisionArrangedDetails[divisionKey],
      "team_name"
    );
    const teamArrangedList: any[] = [];
    Object.keys(teamArrangedDetails).map((teamKey) => {
      const dateArrangedDetails = getDetailsByKey(
        teamArrangedDetails[teamKey],
        "game_date"
      );
      const dateArrangedList: any[] = [];
      Object.keys(dateArrangedDetails).map((dateKey) => {
        const timeArrangedDetails = getDetailsByKey(
          dateArrangedDetails[dateKey],
          "game_time"
        );
        const timeArrangedList: any[] = [];
        Object.keys(timeArrangedDetails).map((timeKey) => {
          const fieldArrangedDetails = getDetailsByKey(
            timeArrangedDetails[timeKey],
            "field"
          );
          const newTimeDetail = new Object();
          newTimeDetail[timeKey] = fieldArrangedDetails;
          timeArrangedList.push(newTimeDetail);
        });
        const newDateDetail = new Object();
        newDateDetail[dateKey] = timeArrangedList;
        dateArrangedList.push(newDateDetail);
      });
      const newTeamDetail = new Object();
      newTeamDetail[teamKey] = dateArrangedList;
      teamArrangedList.push(newTeamDetail);
    });
    const newDivisionDetail = new Object();
    newDivisionDetail[divisionKey] = teamArrangedList;
    parsedDetailsList.push(newDivisionDetail);
  });
  return parsedDetailsList;
};

const getUniqueKeyArray = (array: any[], key: string | number) => {
  const retArray: string[] = [];
  array.forEach((element) => {
    const index = retArray.findIndex((item) => element[key] === item);
    if (index === -1) {
      retArray.push(element[key]);
    }
  });
  retArray.sort();
  return retArray;
};

const getGamesCountForDay = (sortJsonGames: any[], day: string): any => {
  let countGames = 0;
  sortJsonGames.forEach((division) => {
    const divisionKey = Object.keys(division)[0];
    division[divisionKey].forEach((team: string) => {
      const teamKey = Object.keys(team)[0];
      team[teamKey].forEach((date: string) => {
        const dateKey = Object.keys(date)[0];
        if (day === dateKey) {
          if (date[dateKey].length > countGames)
            countGames = date[dateKey].length;
        }
      });
    });
  });
  return countGames;
};

const getTeamCount = (sortJsonGames: any[]): any => {
  let countGames = 0;
  sortJsonGames.forEach((division) => {
    Object.keys(division).map((divisionKey) => {
      countGames += division[divisionKey].length;
    });
  });
  return countGames;
};

const getScorers = async (eventId: string) => {
  const scorers = (await api.get(
    `sms_authorized_scorers?event_id=${eventId}`
  )) as IReporter[];
  const scorer = scorers?.find((it: IReporter) => it.is_active_YN === 1);
  return formatPhoneNumber(scorer?.mobile || "") as string;
};


const getTimeslotsForDay = (day: string | Date, schedulesGames: any) => {
  const timeslots = schedulesGames
    .filter(
      (game: ISchedulesGame) =>
        dateToShortString(game.game_date) === dateToShortString(day)
    )
    .map((game: ISchedulesGame) => game.game_time);
  const uniqueTimeslots = [...new Set(timeslots)];
  return uniqueTimeslots.sort().map((timeslot: any, index) => {
    return {
      id: index,
      time: timeslot,
    } as ITimeSlot;
  });
};

export {
  getFieldsByFacility,
  getGamesByField,
  getGamesByFacility,
  getGamesByDays,
  getGamesByDivision,
  isEmptyGames,
  getScorers,
  parseJsonGames,
  getUniqueKeyArray,
  sortJsonGamesList,
  getGamesCountForDay,
  getTeamCount,
  getTimeslotsForDay,
};
