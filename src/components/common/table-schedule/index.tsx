/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useReducer } from "react";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { find } from "lodash-es";
import {
  calculateTournamentDays,
  dateToShortString,
  getAllTeamCardGames,
  getTimeSlotsFromEntities,
  ITimeValues,
  getVarcharEight,
} from "helpers";
import { TableScheduleTypes, TimeSlotsEntityTypes } from "common/enums";
import {
  BindingAction,
  IChangedGame,
  IConfigurableSchedule,
  IDivision,
  IEventDetails,
  IEventSummary,
  IPool,
  ISchedule,
  ISchedulesDetails,
  ScheduleCreationType,
} from "common/models";
import { IField } from "common/models/schedule/fields";
import ITimeSlot from "common/models/schedule/timeSlots";
import { IScheduleFacility } from "common/models/schedule/facilities";
import { ITeam, ITeamCard } from "common/models/schedule/teams";
import { IScheduleTeamDetails } from "common/models/schedule/schedule-team-details";
import { Button, CardMessage, MatrixTable, Checkbox } from "components/common";
import PopupConfirm from "components/common/popup-confirm";
import Filter from "./components/filter";
import DivisionHeatmap from "./components/division-heatmap";
import TableActions from "./components/table-actions";
import PopupSaveReporting from "./components/popup-save-reporting";
import TeamsDiagnostics from "components/schedules/diagnostics/teamsDiagnostics";
import DivisionsDiagnostics from "components/schedules/diagnostics/divisionsDiagnostics";
import { IDiagnosticsInput } from "components/schedules/diagnostics";
import { populateDefinedGamesWithPlayoffState } from "components/schedules/definePlayoffs";
import { IBracketGame } from "components/playoffs/bracketGames";
import { updateGameSlot } from "components/playoffs/helper";
import ListUnassignedTeams from "./components/list-unassigned";
import ListUnassignedMatchups from "./components/list-unassigned-games";
import PopupAdvancedWorkflow from "./components/popup-advanced-workflow";
import {
  applyFilters,
  AssignmentType,
  getScheduleWarning,
  mapFilterValues,
  mapGamesByFilter,
  mapUnusedFields,
  moveCardMessages,
} from "./helpers";
import { IScheduleFilter, OptimizeTypes } from "./types";
import {
  calculateDays,
  IGame,
  settleTeamsPerGames,
} from "../matrix-table/helper";
import {
  IDropParams,
  IExtraGameDropParams,
  GameType,
} from "../matrix-table/dnd/drop";
import moveTeamCard from "./moveTeamCard";
import { CardMessageTypes } from "../card-message/types";
import styles from "./styles.module.scss";
import { IMatchup } from "components/visual-games-maker/helpers";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import uuidv4 from "uuid/v4";
import AddExtraGame from "./components/add-extra-game";
import AddExtraGameModal from "./components/add-extra-game-modal";
import { TeamPositionEnum } from "components/common/matrix-table/helper";
import { mapGamesWithSchedulesDetails } from "components/scoring/helpers";

interface Props {
  tableType: TableScheduleTypes;
  event: IEventDetails;
  divisions: IDivision[];
  pools: IPool[];
  teamCards: ITeamCard[];
  games: IGame[];
  fields: IField[];
  timeSlots: ITimeSlot[];
  timeValues: ITimeValues;
  facilities: IScheduleFacility[];
  scheduleData: ISchedule;
  schedulesDetails?: ISchedulesDetails[];
  scheduleTeamDetails?: IScheduleTeamDetails[];
  eventSummary: IEventSummary[];
  isEnterScores?: boolean;
  historyLength?: number;
  teamsDiagnostics?: IDiagnosticsInput;
  divisionsDiagnostics?: IDiagnosticsInput;
  isFullScreen?: boolean;
  onScheduleGameUpdate: (gameId: number, gameTime: string) => void;
  onTeamCardsUpdate: (teamCard: ITeamCard[]) => void;
  onTeamCardUpdate: (teamCard: ITeamCard) => void;
  onGameScoreUpdate: (game: IChangedGame) => void;
  onUndo: () => void;
  onToggleFullScreen?: BindingAction;
  playoffTimeSlots?: ITimeSlot[];
  bracketGames?: IBracketGame[];
  onBracketGameUpdate: (bracketGame: IBracketGame) => void;
  recalculateDiagnostics?: () => void;
  matchups: IMatchup[];
  onAssignMatchup: (id: string, assignedGameId: number | null) => void;
  updateSchedulesDetails?: (
    modifiedSchedulesDetails: ISchedulesDetails[],
    schedulesDetailsToModify: ISchedulesDetails[]
  ) => void;
  updateGamesChanged?: (item: IChangedGame) => void;
  onGamesListChange?: (
    item: IMatchup[],
    teamIdToDeleteGame?: string,
    isDnd?: boolean
  ) => void;
  addTeams?: (teamCards: ITeamCard[]) => void;
  addNewPool?: (newPool: IPool) => void;
}

const theme = createMuiTheme({
  overrides: {
    MuiButtonBase: {
      root: {
        width: "100%",
        height: "36px",
      },
    },
  },
});

const TableSchedule = ({
  tableType,
  event,
  divisions,
  pools,
  teamCards,
  games,
  fields,
  facilities,
  scheduleData,
  schedulesDetails,
  scheduleTeamDetails,
  timeSlots,
  timeValues,
  eventSummary,
  isEnterScores,
  onScheduleGameUpdate,
  onTeamCardsUpdate,
  onTeamCardUpdate,
  onGameScoreUpdate,
  onUndo,
  historyLength,
  teamsDiagnostics,
  divisionsDiagnostics,
  isFullScreen,
  onToggleFullScreen,
  playoffTimeSlots,
  bracketGames,
  onBracketGameUpdate,
  recalculateDiagnostics,
  matchups,
  onAssignMatchup,
  updateSchedulesDetails,
  onGamesListChange,
  addTeams,
  addNewPool,
  updateGamesChanged,
}: Props) => {
  const minGamesNum =
    Number(scheduleData?.min_num_games) || event.min_num_of_games;

  const [isFromMaker] = useState(
    (scheduleData as IConfigurableSchedule)?.create_mode ===
      ScheduleCreationType[ScheduleCreationType.Visual] ||
      (scheduleData as IConfigurableSchedule)?.is_matchup_only_YN === 1
  );
  const [simultaneousDnd, setSimultaneousDnd] = useState(isFromMaker);

  const [filterValues, changeFilterValues] = useState<IScheduleFilter>(
    applyFilters({ divisions, pools, teamCards, eventSummary, timeSlots })
  );

  const [isHiddenIncompleteGames, setIsHiddenIncompleteGames] = useState(false);
  const [isHighlightSameState, setIsHighlightSameState] = useState(false);
  const [noTransparentGameId, setNoTransparentGameId] = useState<string>("");

  let filterDepArray;

  if (tableType === TableScheduleTypes.SCORES) {
    filterDepArray = [divisions, pools, eventSummary];
  } else {
    filterDepArray = [divisions, pools, teamCards, eventSummary];
  }

  useEffect(() => {
    changeFilterValues(
      applyFilters({
        timeSlots,
        selectedDay: filterValues.selectedDay,
        divisions,
        pools: [], // poools,
        teamCards,
        eventSummary,
      })
    );
  }, filterDepArray);

  const [optimizeBy, onOptimizeClick] = useState<OptimizeTypes>(
    OptimizeTypes.MIN_RANK
  );

  const [zoomingDisabled, changeZoomingAction] = useState(false);

  const [showHeatmap, onHeatmapChange] = useState(true);
  const [assignmentType, setAssignmentType] = useState(
    isFromMaker ? AssignmentType.Matchups : AssignmentType.Teams
  );

  const onAssignmentTypeChange = (
    _: any,
    newAssignmentType: AssignmentType
  ) => {
    if (newAssignmentType) {
      setAssignmentType(newAssignmentType);
    }
  };

  interface IMoveCardResult {
    gameId?: number;
    teamId?: string;
    teamCards: ITeamCard[];
    possibleGame?: IMatchup;
    dropParams?: IDropParams;
  }
  const [moveCardResult, setMoveCardResult] = useState<IMoveCardResult>();
  const [moveCardWarning, setMoveCardWarning] = useState<string | undefined>();
  const [days, setDays] = useState(calculateDays(teamCards));
  const [highlightUnscoredGames, setHighlightUnscoredGames] = useState(false);

  const toggleSimultaneousDnd = () => setSimultaneousDnd(!simultaneousDnd);

  const manageGamesData = useCallback(() => {
    let definedGames = [...games];
    const day = filterValues.selectedDay!;

    if (+day === days.length && playoffTimeSlots) {
      definedGames = populateDefinedGamesWithPlayoffState(
        games,
        playoffTimeSlots
      );

      definedGames = definedGames.map((item: IGame) => {
        const foundBracketGame = find(bracketGames, {
          fieldId: item.fieldId,
          startTime: item.startTime,
        });

        return foundBracketGame
          ? updateGameSlot(item, foundBracketGame, divisions, pools)
          : item;
      });
    }

    const filledGames = settleTeamsPerGames(
      definedGames,
      teamCards,
      days,
      filterValues.selectedDay!
    );

    return mapGamesByFilter([...filledGames], filterValues);
  }, [games, teamCards, days, filterValues, playoffTimeSlots, bracketGames]);

  const [tableGames, setTableGames] = useState<IGame[]>(manageGamesData());

  useEffect(() => {
    const newDays = calculateTournamentDays(event);
    setDays(newDays);
  }, [event]);

  useEffect(() => setTableGames(manageGamesData()), [manageGamesData]);

  const managePossibleGames = useCallback(() => {
    return matchups.map((v: IMatchup) => {
      const homeTeam = teamCards.find((t: ITeamCard) => t.id === v.homeTeamId);
      const awayTeam = teamCards.find((t: ITeamCard) => t.id === v.awayTeamId);

      return {
        ...v,
        homeTeam,
        awayTeam,
      };
    });
  }, [matchups, teamCards]);
  const [possibleGames, setPossibleGames] = useState<IMatchup[]>(
    managePossibleGames()
  );
  useEffect(() => setPossibleGames(managePossibleGames()), [
    managePossibleGames,
  ]);

  const updatedFields = mapUnusedFields(fields, tableGames, filterValues);

  const onGameUpdate = (game: IGame) => {
    const foundBracketGame = bracketGames?.find(
      (item: IBracketGame) => item.id === game.bracketGameId
    );

    if (!foundBracketGame) return;

    const updatedBracketGame: IBracketGame = {
      ...foundBracketGame,
      awayTeamScore: game.awayTeamScore,
      homeTeamScore: game.homeTeamScore,
    };

    onGameScoreUpdate({
      id: foundBracketGame.gridNum,
      startTime: foundBracketGame.startTime,
      fieldId: foundBracketGame.fieldId,
      date: foundBracketGame.gameDate,
      isBracketTable: true,
    } as IChangedGame);

    onBracketGameUpdate(updatedBracketGame);
  };

  const onFilterChange = (data: IScheduleFilter) => {
    const newData = mapFilterValues({ teamCards, pools }, data);
    changeFilterValues({ ...newData });
  };

  const toggleZooming = () => changeZoomingAction(!zoomingDisabled);

  const handleScheduleMatrixMatchups = (result: IMoveCardResult) => {
    const { dropParams } = result;

    let newGamesList: IMatchup[] = matchups || [];
    let teamIdToDeleteGame = "";
    let isDnd = false;
    if (matchups && onGamesListChange && dropParams) {
      const prevParticipatingTeams = teamCards.filter((v: ITeamCard) =>
        v.games?.find((game) => game.id === dropParams.originGameId)
      );
      const participatingTeams = result.teamCards.filter((v: ITeamCard) =>
        v.games?.find((game) => game.id === result.gameId)
      );

      if (prevParticipatingTeams && prevParticipatingTeams.length === 2) {
        newGamesList = newGamesList.filter(
          (v: IMatchup) => v.assignedGameId !== dropParams.originGameId
        );
        teamIdToDeleteGame = dropParams.teamId;
        isDnd = true;
      }

      if (participatingTeams && participatingTeams.length === 2) {
        const awayTeam = participatingTeams.find((v: ITeamCard) =>
          v.games?.find(
            (game) => game.id === result.gameId && game.teamPosition === 1
          )
        );
        const homeTeam = participatingTeams.find((v: ITeamCard) =>
          v.games?.find(
            (game) => game.id === result.gameId && game.teamPosition === 2
          )
        );
        const newMatchup = {
          id: uuidv4(),
          assignedGameId: result.gameId || null,
          homeTeamId: homeTeam?.id || "",
          awayTeamId: awayTeam?.id || "",
          divisionId: awayTeam?.divisionId || "",
          divisionHex: awayTeam?.divisionHex || "",
          divisionName: awayTeam?.divisionShortName || "",
          awayTeam,
          homeTeam,
        };

        newGamesList = [...newGamesList, newMatchup];
      }

      onGamesListChange(newGamesList, teamIdToDeleteGame, isDnd);
    }
  };

  const moveCard = (dropParams: IDropParams) => {
    const day = filterValues.selectedDay!;
    const isSimultaneousDnd =
      assignmentType === AssignmentType.Matchups &&
      dropParams.possibleGame.awayTeam &&
      dropParams.possibleGame.homeTeam
        ? true
        : simultaneousDnd;
    const data = moveTeamCard(
      teamCards,
      tableGames,
      dropParams,
      isSimultaneousDnd,
      days?.length ? days[+day - 1] : undefined
    );

    const result: IMoveCardResult = {
      gameId: dropParams.gameId,
      teamCards: data.teamCards,
      possibleGame: isSimultaneousDnd ? dropParams.possibleGame : undefined,
      dropParams,
    };

    if (updateGamesChanged) {
      updateGamesChanged({
        id: dropParams.gameId,
        date: days?.length ? days[+day - 1] : undefined,
        isBracketTable: false,
      } as IChangedGame);

      updateGamesChanged({
        id: dropParams.originGameId,
        date: dropParams.originGameDate,
        isBracketTable: false,
      } as IChangedGame);
    }

    switch (true) {
      case data.playoffSlot:
        return setMoveCardWarning(moveCardMessages.playoffSlot);
      case data.gameSlotInUse:
        return setMoveCardWarning(moveCardMessages.gameSlotInUse);
      case data.timeSlotInUse:
        return setMoveCardWarning(
          isSimultaneousDnd
            ? moveCardMessages.timeSlotInUseForGame
            : moveCardMessages.timeSlotInUseForTeam
        );
      case data.differentFacility: {
        setMoveCardWarning(moveCardMessages.differentFacility);
        return setMoveCardResult(result);
      }
      case data.divisionUnmatch: {
        setMoveCardWarning(moveCardMessages.divisionUnmatch);
        return setMoveCardResult(result);
      }
      case data.poolUnmatch: {
        setMoveCardWarning(moveCardMessages.poolUnmatch);
        return setMoveCardResult(result);
      }
      default:
        if (!result.possibleGame && result.gameId !== dropParams.originGameId) {
          handleScheduleMatrixMatchups(result);
        } else {
          markGameAssigned(
            result.possibleGame,
            result.gameId,
            !dropParams.gameId && !dropParams.originGameId,
            !!(dropParams.gameId && dropParams.originGameId)
          );
        }

        onTeamCardsUpdate(result.teamCards);
    }
  };

  const resetMoveCardWarning = () => {
    setMoveCardResult(undefined);
    setMoveCardWarning(undefined);
  };

  const confirmReplacement = () => {
    if (moveCardResult) {
      if (
        moveCardResult.dropParams &&
        !moveCardResult.possibleGame &&
        moveCardResult.gameId !== moveCardResult.dropParams.originGameId
      ) {
        handleScheduleMatrixMatchups(moveCardResult);
      } else {
        markGameAssigned(moveCardResult.possibleGame, moveCardResult.gameId);
      }
      onTeamCardsUpdate(moveCardResult.teamCards);
      resetMoveCardWarning();
    }
  };

  const markGameAssigned = (
    game?: IMatchup | IGame,
    gameId?: number,
    doPreventAssign: boolean = false,
    doPreventUnassign: boolean = false
  ) => {
    if (!game) {
      return;
    }

    const isMatchup = typeof game.id === "string";
    if (isMatchup) {
      const matchup = game as IMatchup;
      const foundGame = tableGames.find((g: IGame) => g.id === gameId);
      if (foundGame) {
        if (!!matchup.assignedGameId) {
          if (!doPreventUnassign) {
            onUnassignMatchup(matchup);
          }
        } else {
          if (!doPreventAssign) {
            onAssignMatchup(matchup.id, foundGame.id);
          }
        }
      }
    }

    const gameSlot = game as IGame;
    if (gameSlot) {
      const foundMathup = matchups.find(
        (g: IMatchup) =>
          g.homeTeamId === gameSlot.homeTeam?.id &&
          g.awayTeamId === gameSlot.awayTeam?.id
      );
      if (foundMathup) {
        if (!!foundMathup.assignedGameId) {
          if (!doPreventUnassign) {
            onUnassignMatchup(foundMathup);
          }
        }
      }
    }
  };

  const onUnassignMatchup = (game: IMatchup) => {
    onAssignMatchup(game.id, null);
  };

  const onLockAll = () => {
    const lockedTeams = teamCards.map((team: ITeamCard) => ({
      ...team,
      games: team!.games?.map((game) => ({ ...game, isTeamLocked: true })),
    }));
    onTeamCardsUpdate(lockedTeams);
  };

  const onUnlockAll = () => {
    const unLockedTeams = teamCards.map((team: ITeamCard) => ({
      ...team,
      games: team!.games?.map((game) => ({ ...game, isTeamLocked: false })),
    }));
    onTeamCardsUpdate(unLockedTeams);
  };
  const [isPopupSaveReportOpen, onPopupSaveReport] = useState<boolean>(false);

  const togglePopupSaveReport = () => onPopupSaveReport(!isPopupSaveReportOpen);

  const allTeamCardGames = getAllTeamCardGames(teamCards, games, days);
  const mappedGames = schedulesDetails
    ? mapGamesWithSchedulesDetails(allTeamCardGames, schedulesDetails)
    : allTeamCardGames;

  const warnings =
    tableType === TableScheduleTypes.SCORES
      ? undefined
      : getScheduleWarning(
          scheduleData,
          timeSlots,
          days,
          schedulesDetails || [],
          event,
          teamCards,
          teamsDiagnostics!
        );

  const getTimeSlotsBySelectedDay = (): ITimeSlot[] => {
    let date = "";
    if (filterValues.selectedDay) {
      date = days[+filterValues.selectedDay - 1] || "";
    }

    if (schedulesDetails) {
      return getTimeSlotsFromEntities(
        schedulesDetails!.filter(
          (v: ISchedulesDetails) =>
            dateToShortString(v.game_date) === dateToShortString(date)
        ),
        TimeSlotsEntityTypes.SCHEDULE_DETAILS
      );
    }

    return timeSlots;
  };

  const [
    { extraGameTypeForModal, isExtraGameModalOpen, gameForExtraGame },
    setExtraGameModalState,
  ] = useReducer((state: any, action: any) => ({ ...state, ...action }), {
    extraGameTypeForModal: null,
    isExtraGameModalOpen: false,
    gameForExtraGame: null,
  });

  const openExtraGameModal = (gameType?: GameType, game?: IGame) =>
    setExtraGameModalState({
      extraGameTypeForModal: gameType,
      isExtraGameModalOpen: true,
      gameForExtraGame: game,
    });

  const closeExtraGameModal = () =>
    setExtraGameModalState({
      extraGameTypeForModal: null,
      isExtraGameModalOpen: false,
      gameForExtraGame,
    });

  const onExtraGameSave = (
    gameType: GameType.allstar | GameType.practice,
    eventId: string,
    divisionId: string,
    game: IGame,
    awayTeamId: string,
    homeTeamId: string,
    awayTeamName?: string,
    homeTeamName?: string
  ) => {
    if (
      gameType === GameType.allstar &&
      awayTeamName &&
      homeTeamName &&
      addTeams
    ) {
      let allStarPool = pools.find(
        (pool) => pool.division_id === divisionId && pool.is_AllStar_YN === 1
      );
      if (!allStarPool && addNewPool) {
        allStarPool = {
          pool_id: getVarcharEight(),
          division_id: divisionId,
          pool_name: "All Star",
          is_AllStar_YN: 1,
          pool_desc: "",
          pool_tag: "",
          pool_hex: "",
          is_active_YN: true,
          created_by: "",
          created_datetime: "",
          updated_by: "",
          updated_datetime: "",
        };
        addNewPool(allStarPool);
      }

      if (allStarPool) {
        const division = divisions.find(
          (division: IDivision) => division.division_id === divisionId
        );

        const awayTeamCard: ITeamCard = {
          id: awayTeamId,
          name: awayTeamName,
          eventId,
          startTime: "",
          poolId: allStarPool.pool_id,
          divisionId,
          divisionHex: division ? `#${division.division_hex}` : "#fff",
          divisionShortName: division ? `${division.short_name}` : "All Star",
          isPremier: false,
          games: [
            {
              id: game.id,
              gameType,
              teamPosition: TeamPositionEnum.awayTeam,
              date: game.gameDate,
              isTeamLocked: false,
            },
          ],
        };

        const homeTeamCard: ITeamCard = {
          id: homeTeamId,
          name: homeTeamName,
          eventId,
          startTime: "",
          poolId: allStarPool.pool_id,
          divisionId,
          divisionHex: division ? `#${division.division_hex}` : "#fff",
          divisionShortName: division ? `${division.short_name}` : "All Star",
          isPremier: false,
          games: [
            {
              id: game.id,
              gameType,
              teamPosition: TeamPositionEnum.homeTeam,
              date: game.gameDate,
              isTeamLocked: false,
            },
          ],
        };

        const newTeamCards = [awayTeamCard, homeTeamCard];
        addTeams(newTeamCards);
        onTeamCardsUpdate([...teamCards, ...newTeamCards]);
      }
    } else if (gameType === GameType.practice) {
      const isTimeSlotInUseForGame = tableGames.some(
        (tableGame) =>
          tableGame.timeSlotId === game.timeSlotId &&
          (tableGame.homeTeam || tableGame.awayTeam) &&
          (tableGame.homeTeam?.id === homeTeamId ||
            tableGame.homeTeam?.id === awayTeamId ||
            tableGame.awayTeam?.id === awayTeamId ||
            tableGame.awayTeam?.id === homeTeamId)
      );

      if (isTimeSlotInUseForGame) {
        setMoveCardWarning(moveCardMessages.timeSlotInUseForGame);
      } else {
        const newTeamCards = teamCards.map((v) => {
          if (v.id === awayTeamId || v.id === homeTeamId) {
            return {
              ...v,
              games: [
                ...v.games,
                {
                  id: game.id,
                  gameType,
                  teamPosition:
                    v.id === awayTeamId
                      ? TeamPositionEnum.awayTeam
                      : TeamPositionEnum.homeTeam,
                  date: game.gameDate,
                },
              ],
            };
          }

          return v;
        });

        onTeamCardsUpdate(newTeamCards);
      }
    }
  };

  const onIsHiddenIncompleteGames = () =>
    setIsHiddenIncompleteGames(!isHiddenIncompleteGames);

  const onHighlightSameState = () =>
    setIsHighlightSameState(!isHighlightSameState);

  const addExtraGame = (extraGameDropParams: IExtraGameDropParams) => {
    const { game, extraGameType } = extraGameDropParams;

    const isGameSlotInUse =
      teamCards.filter((teamCard) =>
        teamCard.games?.find(
          (teamCardGame) =>
            teamCardGame.id === game!.id && teamCardGame.date === game!.gameDate
        )
      ).length > 0;

    if (isGameSlotInUse) {
      setMoveCardWarning(moveCardMessages.gameSlotInUse);
    } else {
      openExtraGameModal(extraGameType, game);
    }
  };

  const onDrag = (id: string) => {
    setNoTransparentGameId(id);
  };

  const onShowUnscoredGames = () =>
    setHighlightUnscoredGames(!highlightUnscoredGames);

  return (
    <section className={styles.section}>
      <AddExtraGameModal
        isOpen={isExtraGameModalOpen}
        closeModal={closeExtraGameModal}
        onSave={onExtraGameSave}
        gameType={extraGameTypeForModal}
        game={gameForExtraGame}
        event={event}
        divisions={divisions}
        teamCards={teamCards}
      />
      <div className={styles.scheduleTableWrapper}>
        {tableType === TableScheduleTypes.SCHEDULES && (
          <div className={styles.topAreaWrapper}>
            <div className={styles.topBtnsWrapper}>
              <h3>Mode:</h3>
              <Button
                label="Zoom-n-Nav"
                variant="contained"
                color="primary"
                type={zoomingDisabled ? "squaredOutlined" : "squared"}
                onClick={toggleZooming}
              />
              <Button
                label="Drag-n-Drop"
                variant="contained"
                color="primary"
                type={zoomingDisabled ? "squared" : "squaredOutlined"}
                onClick={toggleZooming}
              />
            </div>
            <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
              Zoom-n-Nav to navigate the schedule. Drag-n-Drop to move teams
              within games.
            </CardMessage>
            <div className={styles.topCheckboxWrapper}>
              <Checkbox
                options={[
                  {
                    label: "Show Incomplete Games",
                    checked: isHiddenIncompleteGames,
                  },
                ]}
                onChange={onIsHiddenIncompleteGames}
              />
              {Boolean(event.same_state_warn_YN) && (
                <Checkbox
                  options={[
                    {
                      label: "Same State Matchup",
                      checked: isHighlightSameState,
                    },
                  ]}
                  onChange={onHighlightSameState}
                />
              )}
            </div>
            {teamsDiagnostics && divisionsDiagnostics && (
              <div className={styles.diagnosticsWrapper}>
                Diagnostics:
                <TeamsDiagnostics
                  teamsDiagnostics={teamsDiagnostics}
                  recalculateDiagnostics={recalculateDiagnostics}
                />
                <DivisionsDiagnostics
                  divisionsDiagnostics={divisionsDiagnostics}
                  recalculateDiagnostics={recalculateDiagnostics}
                />
              </div>
            )}
          </div>
        )}
        <DndProvider backend={HTML5Backend}>
          {tableType === TableScheduleTypes.SCHEDULES && (
            <>
              <div
                className={`${styles.container} ${
                  isFromMaker ? styles.vgm : ""
                }`}
              >
                <div className={styles.addExtraGamesWrapper}>
                  {Boolean(event.allstar_games_YN) && (
                    <AddExtraGame extraGameType={GameType.allstar} />
                  )}
                  {Boolean(event.practice_games_YN) && (
                    <AddExtraGame extraGameType={GameType.practice} />
                  )}
                </div>
                {isFromMaker && (
                  <>
                    <h3 className={styles.title}>Needs Assignment</h3>
                    <ThemeProvider theme={theme}>
                      <div className={styles.toggleButtomGroup}>
                        <ToggleButtonGroup
                          value={assignmentType}
                          exclusive={true}
                          onChange={onAssignmentTypeChange}
                          aria-label="text alignment"
                        >
                          <ToggleButton value={AssignmentType.Matchups}>
                            Matchups
                          </ToggleButton>
                          <ToggleButton value={AssignmentType.Teams}>
                            Teams
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </div>
                    </ThemeProvider>
                  </>
                )}

                {isFromMaker && assignmentType === AssignmentType.Matchups ? (
                  <ListUnassignedMatchups
                    games={possibleGames}
                    event={event}
                    showHeatmap={showHeatmap}
                    onDrop={moveCard}
                    inner={isFromMaker}
                    onDrag={onDrag}
                  />
                ) : (
                  <ListUnassignedTeams
                    pools={pools}
                    event={event}
                    tableType={tableType}
                    teamCards={teamCards}
                    minGamesNum={minGamesNum}
                    showHeatmap={showHeatmap}
                    onDrop={moveCard}
                    inner={isFromMaker}
                    onDrag={onDrag}
                  />
                )}
              </div>
            </>
          )}
          <div className={styles.tableWrapper}>
            <div className={styles.headerWrapper}>
              {
                <Filter
                  days={days.length}
                  warnings={warnings}
                  datesList={days}
                  tableType={tableType}
                  filterValues={filterValues}
                  assignmentType={assignmentType}
                  simultaneousDnd={
                    assignmentType === AssignmentType.Matchups
                      ? true
                      : simultaneousDnd
                  }
                  onChangeFilterValue={onFilterChange}
                  onShowUnscoredGames={onShowUnscoredGames}
                  toggleSimultaneousDnd={toggleSimultaneousDnd}
                />
              }

              {tableType === TableScheduleTypes.SCHEDULES &&
                schedulesDetails &&
                updateSchedulesDetails && (
                  <PopupAdvancedWorkflow
                    divisions={divisions}
                    teams={teamCards as ITeam[]}
                    timeValues={timeValues}
                    onScheduleGameUpdate={onScheduleGameUpdate}
                    schedulesDetails={schedulesDetails}
                    updateSchedulesDetails={updateSchedulesDetails}
                  />
                )}
            </div>

            <MatrixTable
              games={tableGames}
              fields={updatedFields}
              eventDay={filterValues.selectedDay!}
              tableType={tableType}
              teamCards={teamCards}
              facilities={facilities}
              showHeatmap={showHeatmap}
              isFullScreen={isFullScreen}
              isEnterScores={isEnterScores}
              disableZooming={zoomingDisabled}
              assignmentType={assignmentType}
              simultaneousDnd={simultaneousDnd}
              isHighlightSameState={isHighlightSameState}
              highlightUnscoredGames={highlightUnscoredGames}
              highlightIncompletedGames={isHiddenIncompleteGames}
              noTransparentGameId={noTransparentGameId}
              moveCard={moveCard}
              timeSlots={getTimeSlotsBySelectedDay()!}
              onGameUpdate={onGameUpdate}
              addExtraGame={addExtraGame}
              onTeamCardUpdate={onTeamCardUpdate}
              onGameScoreUpdate={onGameScoreUpdate}
              onTeamCardsUpdate={onTeamCardsUpdate}
              onToggleFullScreen={onToggleFullScreen}
              onDrag={onDrag}
            />
          </div>
        </DndProvider>
      </div>
      <DivisionHeatmap
        divisions={divisions}
        showHeatmap={showHeatmap}
        onHeatmapChange={onHeatmapChange}
      />
      <>
        {tableType === TableScheduleTypes.SCHEDULES && (
          <>
            <TableActions
              historyLength={historyLength}
              zoomingDisabled={zoomingDisabled}
              toggleZooming={toggleZooming}
              optimizeBy={optimizeBy}
              onUndoClick={onUndo}
              onLockAllClick={onLockAll}
              onUnlockAllClick={onUnlockAll}
              onOptimizeClick={onOptimizeClick}
              togglePopupSaveReport={togglePopupSaveReport}
            />
            <PopupSaveReporting
              event={event}
              games={mappedGames}
              fields={updatedFields}
              timeSlots={timeSlots}
              facilities={facilities}
              schedule={scheduleData}
              scheduleTeamDetails={scheduleTeamDetails}
              eventDays={days}
              isOpen={isPopupSaveReportOpen}
              teamCards={teamCards}
              onClose={togglePopupSaveReport}
            />
          </>
        )}
        <PopupConfirm
          type="warning"
          showYes={!!moveCardResult}
          showNo={!!moveCardResult}
          isOpen={!!moveCardWarning}
          message={moveCardWarning || ""}
          onClose={resetMoveCardWarning}
          onCanceClick={resetMoveCardWarning}
          onYesClick={confirmReplacement}
        />
      </>
    </section>
  );
};

export default TableSchedule;
