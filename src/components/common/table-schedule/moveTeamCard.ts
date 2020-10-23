import { find } from "lodash-es";
import { ITeamCard } from "common/models/schedule/teams";
import { IDropParams } from "../matrix-table/dnd/drop";
import { IGame, TeamPositionEnum } from "../matrix-table/helper";
import { dateToShortString } from "../../../helpers";

export default (
  teamCards: ITeamCard[],
  filledGames: IGame[],
  dropParams: IDropParams,
  simultaneousDnd: boolean,
  day?: string
) => {
  const {
    teamId,
    position,
    gameId,
    possibleGame,
    originGameId,
    originGameDate,
    fieldId,
    startTime,
  } = dropParams;
  let result = {
    teamCards: [...teamCards],
    divisionUnmatch: false,
    poolUnmatch: false,
    timeSlotInUse: false,
    gameSlotInUse: false,
    differentFacility: false,
    playoffSlot: false,
  };

  const newTeamCards = [...teamCards].map((teamCard) => {
    const incomingTeam = find(teamCards, { id: teamId });
    const outcomingTeam = teamCards?.find(({ games }) =>
      games?.find(
        (g) =>
          g.teamPosition === position &&
          g.startTime === startTime &&
          g.fieldId === fieldId &&
          dateToShortString(g.date) === dateToShortString(day)
      )
    );

    const incomingTeamFiltered = {
      ...incomingTeam,
      games: [
        ...incomingTeam?.games?.filter((item) => item.id !== originGameId),
      ],
    };

    const originGamePlace = filledGames.find(
      (item) => item.id === originGameId
    );
    const gamePlace = filledGames.find((item) => item.id === gameId);
    const incomingTeamGames = filledGames.filter((item) =>
      incomingTeamFiltered.games?.find(
        (g) =>
          g.startTime === item.startTime &&
          g.fieldId === item.fieldId &&
          dateToShortString(g.date) === dateToShortString(day)
      )
    );

    const timeSlot = gamePlace?.timeSlotId;
    const facility = gamePlace?.facilityId;

    const teamTimeSlots = incomingTeamGames.map((item) => item.timeSlotId);
    const teamFacilities = incomingTeamGames.map((item) => item.facilityId);

    const isSeparateTeamInMatchupsMode =
      simultaneousDnd && (!possibleGame?.awayTeam || !possibleGame?.homeTeam);
    const pairTeam = gamePlace
      ? gamePlace[position === 1 ? "homeTeam" : "awayTeam"]
      : undefined;

    const secondIncomingTeam =
      originGamePlace &&
      (originGamePlace.homeTeam?.id === incomingTeam?.id
        ? originGamePlace.awayTeam
        : originGamePlace.homeTeam);

    const secondIncomingTeamGames = secondIncomingTeam?.games?.filter(
      (g) => g.id !== originGameId
    );

    const secondIncomingTeamSlots =
      secondIncomingTeamGames &&
      filledGames
        .filter(
          (item) =>
            item.id !== originGameId &&
            secondIncomingTeamGames?.find(
              (sitg) =>
                sitg.startTime === item.startTime &&
                sitg.fieldId === item.fieldId &&
                dateToShortString(sitg.date) === dateToShortString(day)
            )
        )
        .map((g) => g.timeSlotId);

    if (gamePlace?.awayTeam && gamePlace?.homeTeam && simultaneousDnd) {
      result = {
        ...result,
        gameSlotInUse: true,
      };
    }

    if (gamePlace?.isPlayoff) {
      result = {
        ...result,
        playoffSlot: true,
      };
    }

    const isTimeSlotInUse = (
      slot: number,
      slots1: number[],
      slots2?: number[]
    ) => [...slots1, ...(slots2 || [])].includes(slot);

    const timeSlotInUseForPossibleTeams =
      possibleGame &&
      !originGameId &&
      filledGames.some(
        (v) =>
          v.timeSlotId === gamePlace?.timeSlotId &&
          (v.homeTeam || v.awayTeam) &&
          (v.homeTeam?.id === possibleGame.homeTeam?.id ||
            v.homeTeam?.id === possibleGame.awayTeam?.id ||
            v.awayTeam?.id === possibleGame.awayTeam?.id ||
            v.awayTeam?.id === possibleGame.homeTeam?.id)
      );

    /* When a team placed in used timeslot */
    if (
      (gameId &&
        position &&
        isTimeSlotInUse(timeSlot!, teamTimeSlots, secondIncomingTeamSlots)) ||
      timeSlotInUseForPossibleTeams
    ) {
      result = {
        ...result,
        timeSlotInUse: true,
      };
    }

    /* When a team is placed in another facility */
    if (
      gameId &&
      position &&
      teamFacilities.length &&
      !teamFacilities.includes(facility)
    ) {
      result = {
        ...result,
        differentFacility: true,
      };
    }

    if (incomingTeam !== undefined) {
      const oppositeDivisionId =
        outcomingTeam?.divisionId || pairTeam?.divisionId || undefined;

      const oppositePoolId =
        outcomingTeam?.poolId || pairTeam?.poolId || undefined;

      /* When divisions do not match */
      if (
        !simultaneousDnd &&
        oppositeDivisionId &&
        incomingTeam.divisionId !== oppositeDivisionId
      ) {
        result = {
          ...result,
          divisionUnmatch: true,
        };
      }

      /* When pools do not match */
      if (
        incomingTeam.divisionId === oppositeDivisionId &&
        oppositePoolId &&
        incomingTeam.poolId !== oppositePoolId
      ) {
        result = {
          ...result,
          poolUnmatch: true,
        };
      }
    }

    /* 1. Handle dropping inside the table */
    if (
      gameId &&
      position &&
      teamId === teamCard.id &&
      (!(simultaneousDnd && (originGameId || possibleGame)) ||
        isSeparateTeamInMatchupsMode)
    ) {
      let games = [
        ...teamCard.games?.filter(
          (item) =>
            !(
              item.fieldId === possibleGame.fieldId &&
              item.startTime === possibleGame.startTime
            ) || item.date !== originGameDate
        ),
        {
          id: gameId,
          teamPosition: position,
          isTeamLocked: false,
          date: day,
          startTime,
          fieldId,
          gameType:
            filledGames?.find(
              (g) =>
                (originGameId && g.id === originGameId) ||
                (gameId && g.id === gameId)
            )?.gameType || "game",
        },
      ];
      if (
        teamCard?.games?.find(
          (g) =>
            g.fieldId === fieldId &&
            g.startTime === startTime &&
            g.teamPosition === (position === 1 ? 2 : 1) &&
            dateToShortString(g.date) === dateToShortString(day)
        )
      ) {
        games = [
          ...games.filter(
            (item) =>
              !(
                item.fieldId === possibleGame.fieldId &&
                item.startTime === possibleGame.startTime
              ) ||
              item.teamPosition !== (position === 1 ? 2 : 1) ||
              item.date !== day
          ),
        ];
      }

      return {
        ...teamCard,
        games,
      };
    }

    /* When dropping a game in matrix */
    if (
      simultaneousDnd &&
      (originGamePlace?.awayTeam?.id === teamCard.id ||
        originGamePlace?.homeTeam?.id === teamCard.id ||
        possibleGame?.awayTeam?.id === teamCard.id ||
        possibleGame?.homeTeam?.id === teamCard.id)
    ) {
      const originPosition =
        (originGamePlace || possibleGame)?.awayTeam?.id === teamCard.id
          ? TeamPositionEnum.awayTeam
          : TeamPositionEnum.homeTeam;

      const games = [
        ...teamCard.games?.filter(
          (item) =>
            !(
              item.fieldId === possibleGame.fieldId &&
              item.startTime === possibleGame.startTime
            ) || item.date !== originGameDate
        ),
      ];

      if (gameId) {
        games.push({
          id: gameId,
          isTeamLocked: false,
          teamPosition: originPosition,
          date: day,
          startTime,
          fieldId,
          gameType:
            filledGames?.find((g) => g.id === originGameId)?.gameType || "game",
        });
      }

      return {
        ...teamCard,
        games,
      };
    }

    if (
      simultaneousDnd &&
      !possibleGame?.homeTeam &&
      !possibleGame?.awayTeam &&
      originGameId &&
      teamCard.games?.find(
        (g) =>
          g.startTime === startTime &&
          g.fieldId === fieldId &&
          dateToShortString(g.date) === dateToShortString(day)
      )
    ) {
      return {
        ...teamCard,
        games: teamCard.games?.filter(
          (item) =>
            !(item.startTime === startTime && item.fieldId === fieldId) ||
            item.date !== day
        ),
      };
    }

    /* 2. Handle dropping into the Unassigned table */
    if (!simultaneousDnd && !gameId && !position && teamId === teamCard.id) {
      const games = [
        ...teamCard.games?.filter(
          (item) =>
            !(
              item.fieldId === possibleGame.fieldId &&
              item.startTime === possibleGame.startTime
            ) || item.date !== originGameDate
        ),
      ];
      return {
        ...teamCard,
        games,
      };
    }

    /* 3. Remove replaced team game */
    if (
      !simultaneousDnd ||
      (isSeparateTeamInMatchupsMode &&
        teamCard.games?.find(
          (g) =>
            g.startTime === startTime &&
            g.fieldId === fieldId &&
            g.teamPosition === position &&
            dateToShortString(g.date) === dateToShortString(day)
        ))
    ) {
      const games = [
        ...teamCard.games?.filter(
          (item) =>
            !(item.startTime === startTime && item.fieldId === fieldId) ||
            item.teamPosition !== position ||
            item.date !== day
        ),
      ];
      return {
        ...teamCard,
        games,
      };
    }

    return teamCard;
  });

  result = {
    ...result,
    teamCards: [...newTeamCards],
  };

  return result;
};
