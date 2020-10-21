import { unionBy, findIndex, orderBy, groupBy, keys } from "lodash-es";
import { IGame } from "components/common/matrix-table/helper";
import { IDivision, IField, IPool, ITeam } from "common/models";
import { ITeamCard } from "common/models/schedule/teams";
import { getVarcharEight } from "helpers";
import { IPlayoffSortedTeams } from "./logic/actions";
import { ISeedDictionary } from ".";

export interface IBracketGame {
  id: string;
  index: number;
  round: number;
  gridNum: number;
  divisionId: string;
  divisionName?: string;
  gameType?: string;
  gameNote?: string;
  // Seed
  awaySeedId?: number;
  homeSeedId?: number;
  // Team
  awayTeamId?: string;
  homeTeamId?: string;
  // Display Name
  awayDisplayName?: string;
  homeDisplayName?: string;
  //
  awayDependsUpon?: number;
  homeDependsUpon?: number;
  // score
  awayTeamScore?: number;
  homeTeamScore?: number;
  // venue time date
  fieldId?: string;
  facilitiesId?: string;
  fieldName?: string;
  startTime?: string;
  gameDate?: string;
  //
  hidden?: boolean;
  isCancelled: boolean;
  createDate: string;
  poolId?: string;
  poolName?: string;
  // rendering
  xLeft?: number;
  yTop?: number;
  xWidth?: number;
  yHeight?: number;
  gameNum?: number;
  direction?: bracketDirectionEnum;
  // custom playoff
  homeSourceType?: bracketSourceTypeEnum;
  homeSourceId?: string;
  homeSourceValue?: string;
  awaySourceType?: bracketSourceTypeEnum;
  awaySourceId?: string;
  awaySourceValue?: string;
  isChecked?: boolean;
  connectedBrackets?: IBracketConnector[];
}

export interface IAdvancedGame extends IBracketGame {
  isChecked: boolean;
  x: number;
  y: number;
}

export interface IBracketSeed {
  id: number;
  name: string;
  teamId?: string;
  teamName?: string;
  divisionId?: string;
  poolId?: string;
}

export interface IBracketConnector {
  direction: bracketDirectionEnum;
  id: string;
  index: number;
  y: number;
  x: number;
}

export enum bracketDirectionEnum {
  "Left" = "Left",
  "Right" = "Right",
  "Both" = "Both",
}

export enum bracketSourceTypeEnum {
  "Bye" = "Bye",
  "Winner" = "Winner",
  "Loser" = "Loser",
  "Division" = "Division",
  "Pool" = "Pool",
  "Team" = "Team",
}

interface IFacilityData {
  division: string;
  facility: string;
}

export const createSeedsFromBrackets = (
  bracketGames: IBracketGame[],
  teams?: ITeam[]
) => {
  const dict = groupBy(bracketGames, "divisionId");
  const seedsDictionary = {};

  Object.keys(dict).forEach((divisionId) => {
    const seeds = dict[divisionId]
      .map((item) => [
        item.awaySeedId
          ? { seedId: item.awaySeedId, teamId: item.awayTeamId }
          : null,
        item.homeSeedId
          ? { seedId: item.homeSeedId, teamId: item.homeTeamId }
          : null,
      ])
      .flat()
      .filter((v) => v);

    const sortedSeeds = orderBy(seeds, "seedId");

    seedsDictionary[divisionId] = [...Array(sortedSeeds.length || 0)].map(
      (_, i) =>
        ({
          id: sortedSeeds[i]?.seedId,
          name: `Seed ${sortedSeeds[i]?.seedId}`,
          teamId: sortedSeeds[i]?.teamId,
          poolId: teams?.find((item) => item.team_id === sortedSeeds[i]?.teamId)
            ?.pool_id,
          teamName: teams?.find(
            (item) => item.team_id === sortedSeeds[i]?.teamId
          )?.short_name,
        } as IBracketSeed)
    );
  });

  return seedsDictionary;
};

export const createSeedsFromNum = (
  bracketGames: IBracketGame[],
  divisions: IDivision[],
  teams: ITeam[] | undefined,
  sortedTeams: IPlayoffSortedTeams | null | undefined
): ISeedDictionary => {
  const seedsDictionary = {};

  divisions.forEach((item: IDivision) => {
    const getTeamId = (divisionId: string, seedId: number) => {
      const awayTeamId = bracketGames.find(
        (bracketGame: IBracketGame) =>
          bracketGame.divisionId === divisionId &&
          bracketGame.awaySeedId === seedId
      )?.awayTeamId;

      const homeTeamId = bracketGames.find(
        (bracketGame: IBracketGame) =>
          bracketGame.divisionId === divisionId &&
          bracketGame.homeSeedId === seedId
      )?.homeTeamId;

      return awayTeamId || homeTeamId;
    };

    const getTeamName = (teamId?: string) =>
      teams?.find((team) => team.team_id === teamId)?.short_name;

    const getTeamDivision = (teamId?: string) =>
      teams?.find((team) => team.team_id === teamId)?.division_id;

    const getTeamPool = (teamId?: string) =>
      teams?.find((team) => team.team_id === teamId)?.pool_id;

    const divisionTeams = sortedTeams && sortedTeams[item.division_id];
    seedsDictionary[item.division_id] = [...Array(16)].map((_, i) => {
      const teamId = getTeamId(item.division_id, i + 1);
      const teamName = getTeamName(teamId);
      const teamDivision = getTeamDivision(teamId);
      const teamPool = getTeamPool(teamId);

      return {
        id: i + 1,
        name: `Seed ${i + 1}`,
        teamId: divisionTeams ? divisionTeams[i]?.team_id : teamId,
        poolId:
          divisionTeams && divisionTeams[i]?.pool_id
            ? divisionTeams[i]?.pool_id
            : teamPool,
        teamName: divisionTeams ? divisionTeams[i]?.short_name : teamName,
        divisionId: divisionTeams
          ? divisionTeams[i]?.division_id
          : teamDivision,
      } as IBracketSeed;
    });
  });
  return seedsDictionary;
};

export const advanceBracketGamesWithTeams = (
  bracketGames: IBracketGame[],
  seeds: ISeedDictionary
) => {
  return bracketGames.map((item) => {
    const foundAwaySeed = seeds[item.divisionId].find(
      (v) =>
        v.id ===
        (item.awaySeedId ||
          (item.awaySourceType === bracketSourceTypeEnum.Division ||
          item.awaySourceType === bracketSourceTypeEnum.Pool
            ? +(item.awaySourceValue || 0)
            : false))
    );
    const foundHomeSeed = seeds[item.divisionId].find(
      (v) =>
        v.id ===
        (item.homeSeedId ||
          (item.homeSourceType === bracketSourceTypeEnum.Division ||
          item.homeSourceType === bracketSourceTypeEnum.Pool
            ? +(item.homeSourceValue || 0)
            : false))
    );

    return {
      ...item,
      awayTeamId: foundAwaySeed?.teamId,
      homeTeamId: foundHomeSeed?.teamId,
    };
  });
};

const getRoundBy = (
  index: number,
  numberOfPreGames: number,
  firstRoundGamesNum: number
) => {
  const rounds = [];
  let roundCounter = 1;
  if (numberOfPreGames) {
    for (let i = 0; i < numberOfPreGames; i++) {
      rounds.push(roundCounter);
    }
    roundCounter++;
  }

  const recursor = (games: number, counter: number): any => {
    if (games < 1) {
      return;
    }
    for (let i = 0; i < games; i++) {
      rounds.push(counter);
    }
    return recursor(games / 2, ++counter);
  };

  recursor(firstRoundGamesNum, roundCounter);

  return rounds[index] || 0;
};

export const rearrangeSeedForGames = (
  bracketTeamsNum: number,
  games: IBracketGame[]
) => {
  const maxPowerOfTwo = 2 ** Math.floor(Math.log2(bracketTeamsNum));
  const numberOfPreGames = bracketTeamsNum - maxPowerOfTwo;
  const firstRoundGamesNum = maxPowerOfTwo / 2;

  const seedsNum = maxPowerOfTwo;
  const preSeedsNum = bracketTeamsNum - maxPowerOfTwo;

  const seeds = [...Array(seedsNum)].map((_, i) => ({
    id: i + 1,
    name: `Seed ${i + 1}`,
  }));

  const preSeeds = [...Array(preSeedsNum)].map((_, i) => ({
    id: i + seedsNum + 1,
    name: `Seed ${i + seedsNum + 1}`,
  }));

  /* Rearrange seeds for pre round games */
  [...Array(numberOfPreGames)].forEach((_, i) => {
    const first = seeds[seeds.length - (i + 1)];
    const last = preSeeds[0];

    const gameIndex = games.findIndex(
      (game) => game.round === 1 && !game.awaySeedId && !game.homeSeedId
    );

    games[gameIndex].awaySeedId = first?.id;
    games[gameIndex].homeSeedId = last?.id;
    games[gameIndex].awaySourceValue = first?.id.toString();
    games[gameIndex].homeSourceValue = last?.id.toString();

    seeds[seeds.length - (i + 1)] = undefined!;
    preSeeds.shift();
  });

  /* Rearrange seeds for regular first round */
  [...Array(Math.floor(firstRoundGamesNum))].forEach(() => {
    const first = seeds[0];
    const last = seeds[seeds.length - 1];
    const round = numberOfPreGames ? 2 : 1;

    const gameIndex = games.findIndex(
      (game) => game.round === round && !game.awaySeedId && !game.homeSeedId
    );

    games[gameIndex].awaySeedId = first?.id;
    games[gameIndex].homeSeedId = last?.id;
    games[gameIndex].awaySourceValue = first?.id.toString();
    games[gameIndex].homeSourceValue = last?.id.toString();

    seeds.shift();
    seeds.pop();
  });

  let winnerIndex = 1;

  games = games.map((game) => {
    const awayDependsUpon = !game.awaySeedId ? winnerIndex++ : undefined;
    const homeDependsUpon = !game.homeSeedId ? winnerIndex++ : undefined;

    return {
      ...game,
      awayDependsUpon,
      homeDependsUpon,
    };
  });

  return games;
};

const generateGamesArray = (
  parent: any[],
  bracketTeamsNum: number,
  division: IDivision,
  poolId?: string
) => {
  const minNumber =
    parent?.length < bracketTeamsNum ? parent.length : bracketTeamsNum;

  const minNumberOfGames = minNumber > 0 ? minNumber : parent?.length;

  const maxPowerOfTwo = 2 ** Math.floor(Math.log2(minNumberOfGames));
  const numberOfPreGames = minNumberOfGames - maxPowerOfTwo;
  const firstRoundGamesNum = maxPowerOfTwo / 2;
  const localGamesLength = minNumberOfGames - 1 || 0;
  let round = 0;
  let roundCount = 0;
  const width = 280;
  const height = 120;

  const localGames = [
    ...Array(localGamesLength > 0 ? localGamesLength : parent?.length),
  ].map((_, index) => {
    const curRound = getRoundBy(index, numberOfPreGames, firstRoundGamesNum);
    if (curRound !== round) {
      round = curRound;
      roundCount = 0;
    } else roundCount++;

    return {
      id: getVarcharEight(),
      index: index + 1,
      gridNum: 1,
      round,
      awayDisplayName: `Away ${division.short_name}`,
      homeDisplayName: `Home ${division.short_name}`,
      divisionName: division.short_name,
      divisionId: division.division_id,
      poolId,
      createDate: new Date().toISOString(),
      isCancelled: false,
      homeSourceType: bracketSourceTypeEnum.Division,
      awaySourceType: bracketSourceTypeEnum.Division,
      xLeft: 20 + round * width,
      yTop: (roundCount - 1) * (height * 1.5),
      xWidth: width,
      yHeight: height,
      direction: bracketDirectionEnum.Right,
    } as IBracketGame;
  });

  return rearrangeSeedForGames(minNumberOfGames, localGames);
};

export const createBracketGames = (
  divisions: IDivision[],
  bracketTeamsNum: number,
  isPoolMode?: boolean
) => {
  const games: any[] = [];
  divisions.map((division: IDivision) => {
    if (isPoolMode) {
      const pools = groupBy(division.teams!, "pool_id") || [];
      keys(pools).map((pool: string) =>
        games.push(
          generateGamesArray(pools[pool], bracketTeamsNum, division, pool)
        )
      );
    } else {
      games.push(generateGamesArray(division.teams, bracketTeamsNum, division));
    }
  });
  return games.flat();
};

export const getFacilityData = (teamCards: ITeamCard[], games: IGame[]) => {
  const data = teamCards
    .map((item) => ({
      division: item.divisionId,
      gameIds: item.games?.map((item2) => item2.id),
    }))
    .map((item) => ({
      division: item.division,
      facility: games.find((game) => item.gameIds?.includes(game.id))
        ?.facilityId,
    }))
    .filter((item) => item.division && item.facility);
  const divisionsPerFacilities = unionBy(data, "division");
  return divisionsPerFacilities as IFacilityData[];
};

export const populatePlayoffGames = (
  games: IGame[],
  bracketGames: IBracketGame[],
  divisions: IDivision[],
  facilityData: IFacilityData[],
  gameDate?: string,
  pools?: IPool[]
) => {
  const localBracketGames = orderBy(
    bracketGames,
    ({ divisionId, round, index }) => [divisionId, Math.abs(round), index]
  );

  const timeSlotRound = {};

  return games.map((game: IGame) => {
    if (game.isPlayoff) {
      const index = [...localBracketGames].findIndex(
        (item) =>
          findIndex(facilityData, {
            facility: game.facilityId,
            division: item.divisionId,
          }) >= 0 &&
          (!timeSlotRound[item.divisionId] ||
            timeSlotRound[item.divisionId][game.timeSlotId] === undefined ||
            timeSlotRound[item.divisionId][game.timeSlotId] ===
              Math.abs(item.round))
      );
      const bracketGame = [...localBracketGames][index];
      const division = divisions.find(
        (v: IDivision) => v.division_id === bracketGame?.divisionId
      );
      const pool = pools?.find((v: IPool) => v.pool_id === bracketGame?.poolId);

      if (index >= 0) {
        localBracketGames.splice(index, 1);
      }

      timeSlotRound[bracketGame?.divisionId || 0] = {
        ...(timeSlotRound[bracketGame?.divisionId || 0] || {}),
        [game.timeSlotId]: Math.abs(bracketGame?.round),
      };

      return {
        ...game,
        bracketGameId: bracketGame?.id,
        playoffIndex: bracketGame?.index,
        playoffRound: bracketGame?.round,
        awaySeedId: bracketGame?.awaySeedId,
        homeSeedId: bracketGame?.homeSeedId,
        awayDependsUpon: bracketGame?.awayDependsUpon,
        homeDependsUpon: bracketGame?.homeDependsUpon,
        awayDisplayName: bracketGame?.awayDisplayName,
        homeDisplayName: bracketGame?.homeDisplayName,
        divisionId: bracketGame?.divisionId,
        divisionName: division?.short_name,
        divisionHex: division?.division_hex,
        poolHex: pool?.pool_hex,
        poolId: bracketGame?.poolId,
        gameDate,
      } as IGame;
    }
    return game;
  });
};

export const populateBracketGamesWithData = (
  bracketGames: IBracketGame[],
  games: IGame[],
  fields: IField[],
  gameDate?: string
) => {
  return bracketGames.map((game: IBracketGame) => {
    const playoffGame = games.find(
      (item: IGame) =>
        item.playoffIndex === game.index &&
        item.divisionId === game.divisionId &&
        (!item.poolId || !game.poolId || item.poolId === game.poolId)
    );
    const field = fields.find(
      (item: IField) => item.field_id === playoffGame?.fieldId
    );

    return {
      ...game,
      fieldName: field?.field_name,
      fieldId: playoffGame?.fieldId,
      startTime: playoffGame?.startTime,
      gameDate: playoffGame?.gameDate || gameDate,
    };
  });
};
