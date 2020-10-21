import { groupBy, max, maxBy, min, minBy, orderBy, union } from "lodash-es";
import { IGame } from "components/common/matrix-table/helper";
import { bracketSourceTypeEnum, IBracketGame } from "./bracketGames";
import { IOnAddGame } from "./add-game-modal";
import { dateToShortString, getVarcharEight } from "helpers";
import {
  IBracket,
  IDivision,
  IEventDetails,
  IField,
  IPool,
  ISchedulesDetails,
} from "common/models";
import { ITeamCard } from "common/models/schedule/teams";
import { MovePlayoffWindowEnum } from ".";
import ITimeSlot from "common/models/schedule/timeSlots";

interface IBracketMoveWarning {
  gameAlreadyAssigned: boolean;
  gamePlayTimeBeforeInvalid: boolean;
  gamePlayTimeAfterInvalid: boolean;
  facilitiesDiffer: boolean;
  gameSourceTypeBye: boolean;
}

export const checkMultiDay = (
  event: IEventDetails | null | undefined,
  bracket: IBracket | null | undefined
): boolean => {
  if (!event || !bracket) return false;
  return (
    (!!bracket?.multiDay && bracket?.isManualCreation === undefined) ||
    (!!event?.multiday_playoffs_YN &&
      (!!bracket?.isManualCreation || !!bracket?.multiDay))
  );
};

export const updateGameBracketInfo = (game: IGame, withGame?: IGame) => ({
  ...game,
  awaySeedId: withGame?.awaySeedId,
  homeSeedId: withGame?.homeSeedId,
  awayDisplayName: withGame?.awayDisplayName,
  homeDisplayName: withGame?.homeDisplayName,
  awayTeam: withGame?.awayTeam,
  homeTeam: withGame?.homeTeam,
  divisionId: withGame?.divisionId,
  divisionName: withGame?.divisionName,
  divisionHex: withGame?.divisionHex,
  playoffIndex: withGame?.playoffIndex,
});

export const advanceTeamsIntoAnotherBracket = (
  bracketGame: IBracketGame,
  bracketGames: IBracketGame[]
) => {
  const whoIsWinner =
    (bracketGame.homeTeamScore || 0) > (bracketGame.awayTeamScore || 0)
      ? bracketGame.homeTeamId
      : bracketGame.awayTeamId;

  const whoIsLoser =
    (bracketGame.homeTeamScore || 0) < (bracketGame.awayTeamScore || 0)
      ? bracketGame.homeTeamId
      : bracketGame.awayTeamId;

  return bracketGames.map((item) => {
    if (
      item.divisionId === bracketGame.divisionId &&
      (item.awayDependsUpon === bracketGame.index ||
        item.homeDependsUpon === bracketGame.index)
    ) {
      const isAwayTeam = item.awayDependsUpon === bracketGame.index;
      const positionedTeam = isAwayTeam ? "awayTeamId" : "homeTeamId";

      return {
        ...item,
        [positionedTeam]: item.round > 0 ? whoIsWinner : whoIsLoser,
      };
    }

    if (item.id === bracketGame.id) return bracketGame;

    return item;
  });
};

export const advanceTeamsFromBrackets = (
  bracketGame: IBracketGame,
  bracketGames: IBracketGame[]
) => {
  const divisionGames = bracketGames.filter(
    (item) => item.divisionId === bracketGame.divisionId
  );
  const awayBracketGame = divisionGames.find(
    (item) => item.index === bracketGame.awayDependsUpon
  );
  const homeBracketGame = divisionGames.find(
    (item) => item.index === bracketGame.homeDependsUpon
  );

  const findTeamId = (bracket: IBracketGame, isWinner: boolean) => {
    if (!bracket.awayTeamScore || !bracket.homeTeamScore) return null;
    if ((bracket.awayTeamScore || 0) > (bracket.homeTeamScore || 0)) {
      return isWinner ? bracket.awayTeamId : bracket.homeTeamId;
    } else {
      return isWinner ? bracket.homeTeamId : bracket.awayTeamId;
    }
  };

  const awayWinner = awayBracketGame ? findTeamId(awayBracketGame, true) : null;
  const awayLoser = awayBracketGame ? findTeamId(awayBracketGame, false) : null;
  const homeWinner = homeBracketGame ? findTeamId(homeBracketGame, true) : null;
  const homeLoser = homeBracketGame ? findTeamId(homeBracketGame, false) : null;

  const awayTeamId = bracketGame.round > 0 ? awayWinner : awayLoser;
  const homeTeamId = bracketGame.round > 0 ? homeWinner : homeLoser;

  return {
    ...bracketGame,
    awayTeamId,
    homeTeamId,
  } as IBracketGame;
};

export const addGameToExistingBracketGames = (
  data: IOnAddGame,
  bracketGames: IBracketGame[],
  divisionId: string
) => {
  const { isWinner, divisionName } = data;
  const awayDependsUpon = Number(data.awayDependsUpon);
  const homeDependsUpon = Number(data.homeDependsUpon);
  let gridNum = data.gridNum;

  // Selected division games
  const divisionGames =
    bracketGames?.filter((v) => v.divisionId === divisionId) || [];

  // Get origin games
  let awayDependent = divisionGames.find((v) => v.index === awayDependsUpon)!;
  let homeDependent = divisionGames.find((v) => v.index === homeDependsUpon)!;
  const bothOriginAreNotFromMainGrid =
    awayDependent?.gridNum !== 1 && homeDependent?.gridNum !== 1;

  // Set round for the new game
  const roundInceremented =
    Math.max(awayDependent?.round, homeDependent?.round) + 1;
  const roundIncerementedLooser = Math.min(
    awayDependent?.round,
    homeDependent?.round
  );
  const round = isWinner
    ? roundInceremented
    : roundIncerementedLooser -
      (gridNum > awayDependent?.gridNum || gridNum > homeDependent?.gridNum
        ? 0
        : 1);

  // Create a new grid or merge existing
  if (bothOriginAreNotFromMainGrid) {
    gridNum = Math.min(awayDependent?.gridNum, homeDependent?.gridNum);
    awayDependent = {
      ...awayDependent,
      round: awayDependent?.round,
      gridNum,
    };
    homeDependent = {
      ...homeDependent,
      round: homeDependent?.round,
      gridNum,
    };
  }

  const newBracketGame: IBracketGame = {
    id: getVarcharEight(),
    index: divisionGames.length + 1,
    round,
    gridNum,
    divisionId,
    divisionName:
      divisionName ||
      (divisionGames.length > 0 ? divisionGames[0].divisionName : undefined),
    awaySeedId: undefined,
    homeSeedId: undefined,
    awayTeamId: undefined,
    homeTeamId: undefined,
    awayDisplayName: "Away",
    homeDisplayName: "Home",
    awayDependsUpon,
    homeDependsUpon,
    fieldId: undefined,
    facilitiesId: undefined,
    fieldName: undefined,
    startTime: undefined,
    gameDate: divisionGames.length > 0 ? divisionGames[0].gameDate : undefined,
    hidden: false,
    isCancelled: false,
    createDate: new Date().toISOString(),
    xLeft: data.size?.xLeft,
    xWidth: data.size?.xWidth,
    yTop: data.size?.yTop,
    yHeight: data.size?.yHeight,
    isChecked: data.isChecked,
  };

  const newBracketGames =
    bracketGames.map((item) => {
      if (item.id === awayDependent.id) return awayDependent;
      if (item.id === homeDependent.id) return homeDependent;
      return item;
    }) || [];

  const newAdvancedBracketGame = advanceTeamsFromBrackets(
    newBracketGame,
    newBracketGames
  );

  newBracketGames.push(newAdvancedBracketGame);

  return {
    newBracketGames,
    id: newBracketGame.id,
  };
};

/* Get games indices that depend upon the given BracketGame */
export const getDependentGames = (
  dependentInds: number[],
  games: IBracketGame[]
): number[] => {
  const foundGames = games.filter(
    (item) =>
      dependentInds.includes(item.awayDependsUpon!) ||
      dependentInds.includes(item.homeDependsUpon!)
  );

  const foundGamesInds = foundGames.map((item) => item.index);
  const newDependentInds = [...dependentInds, ...foundGamesInds];

  const newGames = games.filter((item) => !foundGamesInds.includes(item.index));

  if (!foundGamesInds?.length || !newGames?.length) {
    return union(newDependentInds);
  }

  return getDependentGames(newDependentInds, newGames);
};

/* Get games indices that the given BracketGame depends on */
const getGameDependsUpon = (
  dependentInds: number[],
  games: IBracketGame[]
): number[] => {
  const myGamesDependsUpon = games
    .filter((item) => dependentInds.includes(item.index))
    .map((item) => [item.awayDependsUpon, item.homeDependsUpon])
    .flat();

  const newDependentInds: number[] = [
    ...dependentInds,
    ...myGamesDependsUpon,
  ].filter((v) => v) as number[];

  const newGames = games.filter((item) => !dependentInds.includes(item.index));

  if (!myGamesDependsUpon.filter((v) => v).length || !newGames.length) {
    return union(newDependentInds);
  }

  return getGameDependsUpon(newDependentInds, newGames);
};

export const removeGameFromBracketGames = (
  gameIndex: number,
  games: IBracketGame[],
  divisionId: string
) => {
  const dependentInds = [gameIndex];
  const divisionGames = games.filter((item) => item.divisionId === divisionId);

  const newFound = getDependentGames(dependentInds, divisionGames);

  const removedGames = games
    .filter(
      (item) => item.divisionId === divisionId && newFound.includes(item.index)
    )
    .map((item) => ({ ...item, hidden: true }));

  const updatedDivisionGames = games
    .filter(
      (item) => item.divisionId === divisionId && !newFound.includes(item.index)
    )
    .map((item, index) => ({ ...item, index: index + 1 }));

  const otherGames = games.filter((item) => item.divisionId !== divisionId);

  const allGames = orderBy(
    [...otherGames, ...updatedDivisionGames],
    "divisionId"
  );

  const resultGames: IBracketGame[] = [...allGames, ...removedGames];
  return resultGames;
};

export const updateGameSlot = (
  game: IGame,
  bracketGame?: IBracketGame,
  divisions?: IDivision[],
  pools?: IPool[]
): IGame => {
  const division = divisions?.find(
    (v: IDivision) => v.division_id === bracketGame?.divisionId
  );
  const pool = pools?.find((v: IPool) => v.pool_id === bracketGame?.poolId);

  return {
    ...game,
    bracketGameId: bracketGame?.id,
    awaySeedId: bracketGame?.awaySeedId,
    homeSeedId: bracketGame?.homeSeedId,
    awayTeamId: bracketGame?.awayTeamId,
    homeTeamId: bracketGame?.homeTeamId,
    gameDate: bracketGame?.gameDate,
    awayDisplayName: bracketGame?.awayDisplayName,
    homeDisplayName: bracketGame?.homeDisplayName,
    awayDependsUpon: bracketGame?.awayDependsUpon,
    homeDependsUpon: bracketGame?.homeDependsUpon,
    divisionId: bracketGame?.divisionId,
    divisionName: bracketGame?.divisionName,
    divisionHex: division?.division_hex,
    poolHex: pool?.pool_hex,
    playoffRound: bracketGame?.round,
    playoffIndex: bracketGame?.index,
    awayTeamScore: bracketGame?.awayTeamScore,
    homeTeamScore: bracketGame?.homeTeamScore,
    isCancelled: bracketGame?.isCancelled,
    homeSourceType: bracketGame?.homeSourceType,
    homeSourceValue: bracketGame?.homeSourceValue,
    homeSourceId: bracketGame?.homeSourceId,
    awaySourceType: bracketGame?.awaySourceType,
    awaySourceValue: bracketGame?.awaySourceValue,
    awaySourceId: bracketGame?.awaySourceId,
  };
};

enum BracketMoveWarnEnum {
  gameAlreadyAssigned = "This bracket game is already assigned. Please confirm your intentions.",
  gamePlayTimeBeforeInvalid = "This bracket game depends upon preceeding games being complete. They are not. Please place this game in a later game slot.",
  gamePlayTimeAfterInvalid = "This game cannot be placed in a timeslot that is AFTER a game that depends upon its results. Please either move this game to an earlier timeslot than its dependent games or move the dependent games to a later timeslot.",
  facilitiesDiffer = "This division is not playing at this facility on this day. Please confirm your intentions.",
  gameSourceTypeBye = "Adding a game to the schedule is not necessary, would you like to do it anyway?",
}

export const setReplacementMessage = (
  bracketGames: IBracketGame[],
  warnings: IBracketMoveWarning
): {
  bracketGames?: IBracketGame[];
  message?: string;
} | null => {
  switch (true) {
    case warnings.gamePlayTimeBeforeInvalid:
      return {
        message: BracketMoveWarnEnum.gamePlayTimeBeforeInvalid,
      };
    case warnings.gamePlayTimeAfterInvalid:
      return {
        message: BracketMoveWarnEnum.gamePlayTimeAfterInvalid,
      };
    case warnings.facilitiesDiffer:
      return {
        bracketGames,
        message: BracketMoveWarnEnum.facilitiesDiffer,
      };
    case warnings.gameAlreadyAssigned:
      return {
        bracketGames,
        message: BracketMoveWarnEnum.gameAlreadyAssigned,
      };
    case warnings.gameSourceTypeBye:
      return {
        bracketGames,
        message: BracketMoveWarnEnum.gameSourceTypeBye,
      };
    default:
      return null;
  }
};

export const updateBracketGame = (
  bracketGame: IBracketGame,
  gameSlot?: IGame,
  fieldName?: string
) => {
  return {
    ...bracketGame,
    fieldId: gameSlot?.fieldId,
    facilitiesId: gameSlot?.facilityId,
    fieldName: fieldName || "Empty",
    startTime: gameSlot?.startTime,
    gameDate: gameSlot ? gameSlot?.gameDate : bracketGame.gameDate,
  };
};

export const updateBracketGamesDndResult = (
  gameId: string,
  slotId: number,
  bracketGames: IBracketGame[],
  games: IGame[],
  fields: IField[],
  originId?: number,
  teamCards?: ITeamCard[],
  date?: string
) => {
  const playoffsGameDate = games
    .map((v) => dateToShortString(v.gameDate))
    .filter((v) => v)[0];
  const warnings: IBracketMoveWarning = {
    gameAlreadyAssigned: false,
    gamePlayTimeBeforeInvalid: false,
    gamePlayTimeAfterInvalid: false,
    facilitiesDiffer: false,
    gameSourceTypeBye: false,
  };
  /* 1. Find a bracket game that is being dragged */
  const bracketGame = bracketGames.find((item) => item.id === gameId);
  /* 2. Find a game slot where the bracket game is gonna be placed */
  const gameSlot = games.find((item) => item.id === slotId);
  /* 3. Check if the bracket game is not placed anywhere else */
  /*  3.1. If so - return a warning popup */
  /* 4. Populate the bracket data with the game slot data */
  const fieldName = fields.find((item) => item.field_id === gameSlot?.fieldId)
    ?.field_name;

  bracketGames = bracketGames.map((item) =>
    /* First - unassign existing bracket game */
    /* Then - assign our bracket game to that place */
    item.fieldId === gameSlot?.fieldId && item.startTime === gameSlot?.startTime
      ? !date || dateToShortString(date) === dateToShortString(item.gameDate)
        ? updateBracketGame(item)
        : item
      : item.id === bracketGame?.id
      ? updateBracketGame(
          { ...item, gameDate: date || item.gameDate },
          gameSlot
            ? { ...gameSlot, gameDate: date || gameSlot.gameDate }
            : gameSlot,
          fieldName
        )
      : item
  );

  /* WARNINGS SETUP */
  /* Check assignment for the given BracketGame */
  const bracketGameToUpdate = bracketGames.find(
    (item) => item.id === bracketGame?.id
  );

  warnings.gameAlreadyAssigned = Boolean(
    originId === -1 &&
      bracketGame?.fieldId &&
      bracketGame?.startTime &&
      bracketGameToUpdate?.fieldId &&
      bracketGameToUpdate.startTime
  );

  warnings.gameSourceTypeBye = Boolean(
    !bracketGame?.fieldId &&
      (bracketGame?.awaySourceType === bracketSourceTypeEnum.Bye ||
        bracketGame?.homeSourceType === bracketSourceTypeEnum.Bye)
  );

  /* Check play time for the given BracketGame */
  const divisionGames = [...bracketGames].filter(
    (item) => item.divisionId === bracketGame?.divisionId
  );

  const dependentInds = getDependentGames(
    [bracketGame?.index || -1],
    divisionGames
  );

  const gameDependsUpon = getGameDependsUpon(
    [bracketGame?.index || -1],
    divisionGames
  );

  const nextDependent = divisionGames
    .filter((item) => item.index !== bracketGame?.index)
    .filter((item) => dependentInds.includes(item.index));

  const nextDependentStartTimes = nextDependent?.map((item) => item.startTime);
  const nextDependentDate = nextDependent?.map(
    (item) => item.startTime && item.gameDate
  );

  const previousDependent = divisionGames
    .filter((item) => item.index !== bracketGame?.index)
    .filter((item) => gameDependsUpon.includes(item.index));

  const previousDependentStartTimes = previousDependent?.map(
    (item) => item.startTime
  );
  const previousDependentDate = previousDependent?.map(
    (item) => item.startTime && item.gameDate
  );

  const minStartTimeAvailable = min(nextDependentStartTimes);
  const minDateAvailable = min(nextDependentDate);
  const maxStartTimeAvailable = max(previousDependentStartTimes);
  const maxDateAvailable = max(previousDependentDate);

  const bracketNewValue = divisionGames.find(
    (item) => item.index === bracketGame?.index
  );
  const bracketNewTime = bracketNewValue?.startTime;
  const bracketNewDate = bracketNewValue?.gameDate;

  warnings.gamePlayTimeAfterInvalid =
    !!bracketNewTime &&
    !!(
      minStartTimeAvailable &&
      bracketNewDate &&
      minDateAvailable &&
      ((bracketNewTime >= minStartTimeAvailable &&
        bracketNewDate >= minDateAvailable) ||
        (bracketNewTime < minStartTimeAvailable &&
          bracketNewDate > minDateAvailable))
    );
  warnings.gamePlayTimeBeforeInvalid =
    !!bracketNewTime &&
    !!(
      maxStartTimeAvailable &&
      bracketNewDate &&
      maxDateAvailable &&
      ((bracketNewTime <= maxStartTimeAvailable &&
        bracketNewDate <= maxDateAvailable) ||
        (bracketNewTime > maxStartTimeAvailable &&
          bracketNewDate < maxDateAvailable))
    );

  /*||
  !!(
    maxStartTimeAvailable &&
    bracketNewDate &&
    maxDateAvailable &&
    bracketNewTime <= maxStartTimeAvailable &&
    bracketNewDate <= maxDateAvailable
  )*/

  /* Check for Facilities consistency for the given BracketGame */
  const divisionGamesFacilitiesIds = games
    .filter((item) => divisionGames.some((dg) => dg.id === item.bracketGameId))
    .map((item) => item.facilityId);

  const divisionGameIds = teamCards
    ?.filter((item) => item.divisionId === bracketGame?.divisionId)
    .map((item) =>
      item.games
        ?.filter(
          (v) =>
            dateToShortString(v.date) === dateToShortString(playoffsGameDate)
        )
        ?.map((v) => v.id)
    )
    .flat();

  const tableGames = games
    .filter(
      (item) =>
        dateToShortString(item.gameDate) === dateToShortString(playoffsGameDate)
    )
    .filter((item) => divisionGameIds?.includes(item.id));

  const facilitiesIds = Object.keys(groupBy(tableGames, "facilityId")).map(
    (key) => key
  );

  const bracketGamesFacilitiesUnmatch =
    gameSlot?.facilityId &&
    !divisionGamesFacilitiesIds.includes(gameSlot?.facilityId);

  const regularGamesFacilitiesUnmatch =
    divisionGamesFacilitiesIds.length === 0
      ? gameSlot?.facilityId &&
        facilitiesIds.length > 0 &&
        !facilitiesIds.includes(gameSlot?.facilityId)
      : bracketGamesFacilitiesUnmatch;

  warnings.facilitiesDiffer = Boolean(
    bracketGamesFacilitiesUnmatch && regularGamesFacilitiesUnmatch
  );

  return { bracketGames, warnings };
};

const getMinMaxGameTimeSlots = (
  schedulesDetails: ISchedulesDetails[],
  timeSlots: ITimeSlot[],
  day: string
) => {
  const lastGame = maxBy(
    schedulesDetails.filter(
      (item) =>
        dateToShortString(item.game_date) === dateToShortString(day) &&
        (item.away_team_id || item.home_team_id)
    ),
    "game_time"
  );

  const lastGameTimeSlotId =
    timeSlots.find((item) => item.time === lastGame?.game_time)?.id || 0;
  const minGameTimeSlotAvailable =
    timeSlots.length > lastGameTimeSlotId ? lastGameTimeSlotId + 1 : 0;
  const maxGameTimeSlotAvailable = timeSlots.length - 1;

  return { minGameTimeSlotAvailable, maxGameTimeSlotAvailable };
};

export const movePlayoffTimeSlots = (
  schedulesDetails: ISchedulesDetails[],
  timeSlots: ITimeSlot[],
  playoffTimeSlots: ITimeSlot[],
  day: string,
  direction: MovePlayoffWindowEnum
) => {
  const { minGameTimeSlotAvailable } = getMinMaxGameTimeSlots(
    schedulesDetails,
    timeSlots,
    day
  );

  const playoffStartTimeSlot = playoffTimeSlots[0];

  if (
    direction === MovePlayoffWindowEnum.UP &&
    playoffStartTimeSlot.id - minGameTimeSlotAvailable >= 0
  ) {
    const previousTimeSlot = timeSlots.find(
      (_, index, arr) => arr[index + 1].id === playoffStartTimeSlot.id
    );
    if (previousTimeSlot) {
      playoffTimeSlots.unshift(previousTimeSlot);
    }
  }

  if (timeSlots.length + 1 !== playoffTimeSlots.length) {
    if (direction === MovePlayoffWindowEnum.UP_ALL) {
      let i = 0;
      do {
        const previousTimeSlot = timeSlots.find((_, index, arr) => {
          return arr[index + i]?.id === playoffStartTimeSlot?.id;
        });
        if (previousTimeSlot) {
          playoffTimeSlots.unshift(previousTimeSlot);
        }
        i++;
      } while (timeSlots.length + 1 - playoffTimeSlots.length !== 0);
    }
  }

  if (direction === MovePlayoffWindowEnum.DOWN) {
    playoffTimeSlots.shift();
  }

  return playoffTimeSlots;
};

export const moveBracketGames = (
  bracketGames: IBracketGame[],
  schedulesDetails: ISchedulesDetails[],
  timeSlots: ITimeSlot[],
  day: string,
  direction: MovePlayoffWindowEnum
) => {
  const {
    minGameTimeSlotAvailable,
    maxGameTimeSlotAvailable,
  } = getMinMaxGameTimeSlots(schedulesDetails, timeSlots, day);

  const minGameStartTime = minBy(bracketGames, "startTime")?.startTime;
  const minGameTimeSlot =
    timeSlots.find((item) => item.time === minGameStartTime)?.id ||
    minGameTimeSlotAvailable;

  const maxGameStartTime = maxBy(bracketGames, "startTime")?.startTime;
  const maxGameTimeSlot =
    timeSlots.find((item) => item.time === maxGameStartTime)?.id ||
    maxGameTimeSlotAvailable;

  if (
    (minGameTimeSlotAvailable >= minGameTimeSlot &&
      direction === MovePlayoffWindowEnum.UP) ||
    (maxGameTimeSlotAvailable <= maxGameTimeSlot &&
      direction === MovePlayoffWindowEnum.DOWN)
  ) {
    return [...bracketGames];
  }

  return bracketGames.map((item) => {
    if (!item.startTime || !item.fieldId) return item;

    const timeSlotId =
      timeSlots.find((v) => v.time === item.startTime)?.id || 0;
    const previousTimeSlot = timeSlots.find(
      (_, index) => timeSlotId - index === 1
    );
    const nextTimeSlot = timeSlots.find((_, index) => index - timeSlotId === 1);

    const startTime =
      direction === MovePlayoffWindowEnum.UP
        ? previousTimeSlot?.time
        : nextTimeSlot?.time;

    return {
      ...item,
      startTime,
    };
  });
};

export const getPlayoffMovementAvailability = (
  schedulesDetails: ISchedulesDetails[],
  bracketGames: IBracketGame[],
  playoffTimeSlots: ITimeSlot[],
  timeSlots: ITimeSlot[],
  day: string
) => {
  const result = {
    upDisabled: true,
    downDisabled: true,
  };

  if (!playoffTimeSlots.length) return result;

  const {
    minGameTimeSlotAvailable,
    maxGameTimeSlotAvailable,
  } = getMinMaxGameTimeSlots(schedulesDetails, timeSlots, day);

  const lastGameStartTime = maxBy(bracketGames, "startTime")?.startTime;
  const lastGameTimeSlotId =
    timeSlots.find((item) => item.time === lastGameStartTime)?.id || 0;

  const upDisabled = Boolean(playoffTimeSlots[0].id < minGameTimeSlotAvailable);

  const bracketTimeSlotNumExceeded = playoffTimeSlots.length <= 1;

  const downDisabled = Boolean(
    lastGameTimeSlotId >= maxGameTimeSlotAvailable || bracketTimeSlotNumExceeded
  );

  return {
    upDisabled,
    downDisabled,
  };
};

export const ordinalSuffixOf = (i: number) => {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
};

export const generateGameNumbers = (count: number, excludeId: number) => {
  const gameNumbers = [];
  for (let i = 1; i <= count; i++) {
    if (i !== excludeId) {
      gameNumbers.push({
        label: `G${i}`,
        value: i,
      });
    }
  }

  return gameNumbers;
};

export const mapGamesToAdvanced = (games: IBracketGame[]) => {
  return games.map((game: IBracketGame) => {
    return {
      ...game,
      isChecked: false,
      x: 0,
      y: 0,
    };
  });
};
