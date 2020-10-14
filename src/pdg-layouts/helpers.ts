import { IField } from "common/models/schedule/fields";
import { IScheduleFacility } from "common/models/schedule/facilities";
import { IScheduleTeamDetails } from 'common/models/schedule/schedule-team-details';
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

const GetSortOrderByKeyIndex = (index: any, sort = 'ASC') => {
  return function (a: any, b: any) {
    const x = isNaN(index) ? a[index] : a[Object.keys(a)[index]];
    const y = isNaN(index) ? b[index] : b[Object.keys(b)[index]];
    const xx = isNaN(x) ? x.toLowerCase() : x;
    const yy = isNaN(y) ? y.toLowerCase() : y;
    if (sort === 'ASC') return xx - yy;
    else return yy - xx;
  };
}

const getDetailsByKey = (details: any[], key: string) => {
  // console.log(`before getDetailsByKey (${key}) => `, details)
  const sortedArray = details.sort(GetSortOrderByKeyIndex(key));
  // console.log(`after getDetailsByKey (${key}) => `, details)
  const groupByKey = sortedArray.reduce((acc, detail) => {
    const value = detail[key];
    acc[value!] = acc[value!] ? [...acc[value!], detail] : [detail];
    return acc;
  }, {});
  return groupByKey;
};

const parseJsonGames = (scheduleTeamDetails: IScheduleTeamDetails[]) => {
  let parsedDetailsList: any[] = [];
  scheduleTeamDetails.map((detail) => {
    const jsonGames = JSON.parse(detail.json_games);
    delete detail.json_games;
    jsonGames.map((opposeTeam: any) => {
      const onlyOneTeam = {...detail, ...opposeTeam };
      parsedDetailsList.push(onlyOneTeam);
    } )  
  }) 
  return parsedDetailsList;
}
const sortJsonGames = (parsedJsonGames: any[]) => {
  let parsedDetailsList: any[] = parsedJsonGames;
  // console.log('total parsedDetailsList ->', parsedDetailsList) // 
  const divisionArrangedDetails = getDetailsByKey(parsedDetailsList,'division_name');
  parsedDetailsList = [];
  Object.keys(divisionArrangedDetails).map((divisionKey) => {
    const teamArrangedDetails = getDetailsByKey(divisionArrangedDetails[divisionKey],'team_name');
    let teamArrangedList: any[] = [];
    Object.keys(teamArrangedDetails).map((teamKey) => {
      const dateArrangedDetails = getDetailsByKey(teamArrangedDetails[teamKey],'game_date');
      let dateArrangedList: any[] = [];
      Object.keys(dateArrangedDetails).map((dateKey) => {
        const timeArrangedDetails = getDetailsByKey(dateArrangedDetails[dateKey],'game_time');
        let timeArrangedList: any[] = [];
        Object.keys(timeArrangedDetails).map((timeKey) => {
          const fieldArrangedDetails = getDetailsByKey(timeArrangedDetails[timeKey],'field');
          const newTimeDetail = new Object();
          newTimeDetail[timeKey]=fieldArrangedDetails;
          timeArrangedList.push(newTimeDetail);
        })
        const newDateDetail = new Object();
        newDateDetail[dateKey]=timeArrangedList;
        dateArrangedList.push(newDateDetail);
      })
      const newTeamDetail = new Object();
      newTeamDetail[teamKey]=dateArrangedList;
      teamArrangedList.push(newTeamDetail);
    })
    const newDivisionDetail = new Object();
    newDivisionDetail[divisionKey]=teamArrangedList;
    parsedDetailsList.push(newDivisionDetail);
  })
  return parsedDetailsList;

}
const getUniqueKeyArray = (array: any[], key: string | number ) => {
  const retArray: string[] = [];
  array.forEach((element) => {
    const index = retArray.findIndex(
      (item) => element[key] === item
    );
    if (index === -1) {
      retArray.push(element[key]);
    } 
  });
  retArray.sort();
  return retArray;
}

const getGamesCountForDay = (sortJsonGames: any[], day: string): any => {
  let countGames = 0;
  sortJsonGames.forEach((division) => {
    const divisionKey =  Object.keys(division)[0];
    division[divisionKey].forEach((team: string) => {
      const teamKey =  Object.keys(team)[0];
      team[teamKey].forEach((date: string) => {
        const dateKey =  Object.keys(date)[0];
        if (day === dateKey) {
          if (date[dateKey].length > countGames ) countGames = date[dateKey].length
        }
      })
    })
  })
  return countGames;
}
const getTeamCount = (sortJsonGames: any[]): any => {
  let countGames = 0;
  sortJsonGames.forEach((division) => {
    Object.keys(division).map(divisionKey => {
      countGames += division[divisionKey].length;
    })
  })
  return countGames;
}

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
  parseJsonGames,
  getUniqueKeyArray,
  sortJsonGames,
  getGamesCountForDay,
  getTeamCount,
};
