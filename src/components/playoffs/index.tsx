import React, { Component } from "react";
import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { History } from "history";
import { find, groupBy, keys } from "lodash-es";
import {
  Button,
  Paper,
  PopupExposure,
  PopupConfirm,
  MenuButton,
} from "components/common";
import styles from "./styles.module.scss";
import BracketManager from "./tabs/brackets";
import ResourceMatrix from "./tabs/resources";
import {
  fetchSchedulesDetails,
  schedulesDetailsClear,
} from "components/schedules/logic/actions";
import { getAllPools } from "components/divisions-and-pools/logic/actions";
import { IAppState } from "reducers/root-reducer.types";
import { ITournamentData } from "common/models/tournament";
import {
  IEventSummary,
  ISchedule,
  IPool,
  ISchedulesDetails,
  BindingCbWithOne,
  IChangedGame,
} from "common/models";
import { fetchEventSummary } from "components/schedules/logic/actions";
import {
  fillSchedulesTable,
  clearSchedulesTable,
} from "components/schedules/logic/schedules-table/actions";
import { IBracket } from "common/models/playoffs/bracket";
import {
  getTimeValuesFromEventSchedule,
  calculateTimeSlots,
  dateToShortString,
  calculateTournamentDays,
} from "helpers";
import {
  sortFieldsByPremier,
  defineGames,
  IGame,
  settleTeamsPerGamesDays,
} from "components/common/matrix-table/helper";
import {
  mapFieldsData,
  mapTeamsData,
  mapFacilitiesData,
} from "components/schedules/mapTournamentData";
import ITimeSlot from "common/models/schedule/timeSlots";
import { mapTeamsFromSchedulesDetails } from "components/schedules/mapScheduleData";
import { ITeamCard, ITeam } from "common/models/schedule/teams";
import { IField } from "common/models/schedule/fields";
import { IScheduleFacility } from "common/models/schedule/facilities";
import {
  IBracketGame,
  IBracketSeed,
  getFacilityData,
  populateBracketGamesWithData,
  populatePlayoffGames,
  createSeedsFromNum,
  createBracketGames,
  advanceBracketGamesWithTeams,
} from "./bracketGames";
import { populateDefinedGamesWithPlayoffState } from "components/schedules/definePlayoffs";
import {
  createPlayoff,
  addNoteForGame,
  savePlayoff,
  retrieveBracketsGames,
  retrieveBrackets,
  clearBracketGames,
  fetchBracketGames,
  onUndoBrackets,
  advanceTeamsToBrackets,
  IPlayoffSortedTeams,
  clearSortedTeams,
} from "./logic/actions";
import { createNewBracket } from "components/scheduling/logic/actions";
import {
  addGameToExistingBracketGames,
  removeGameFromBracketGames,
  updateBracketGamesDndResult,
  updateGameSlot,
  setReplacementMessage,
  movePlayoffTimeSlots,
  moveBracketGames,
  checkMultiDay,
} from "./helper";
import { IOnAddGame } from "./add-game-modal";
import { updateExistingBracket } from "components/scheduling/logic/actions";
import SaveBracketsModal from "./save-brackets-modal";
import CreateNewBracket, {
  ICreateBracketModalOutput,
} from "components/scheduling/create-new-bracket";
import { TimeSlotsEntityTypes } from "common/enums";

export interface ISeedDictionary {
  [key: string]: IBracketSeed[];
}

export enum MovePlayoffWindowEnum {
  UP = "up",
  DOWN = "down",
  UP_ALL = "up-all",
}

interface IMapStateToProps extends Partial<ITournamentData> {
  eventSummary?: IEventSummary[];
  bracket: IBracket | null;
  schedule?: ISchedule;
  pools?: IPool[];
  schedulesTeamCards?: ITeamCard[];
  schedulesDetails?: ISchedulesDetails[];
  playoffSaved?: boolean;
  bracketGames: IBracketGame[] | null | undefined;
  historyLength: number;
  sortedTeams: IPlayoffSortedTeams | null;
  advancingInProgress?: boolean;
}

interface IMapDispatchToProps {
  fetchEventSummary: (eventId: string) => void;
  fetchSchedulesDetails: (scheduleId: string) => void;
  getAllPools: (divisionIds: string[]) => void;
  fillSchedulesTable: (teamCards: ITeamCard[]) => void;
  clearSchedulesTable: () => void;
  createPlayoff: (bracketGames: IBracketGame[]) => void;
  createNewBracket: BindingCbWithOne<ICreateBracketModalOutput>;
  savePlayoff: (bracketGames: IBracketGame[]) => void;
  retrieveBracketsGames: (bracketId: string) => void;
  retrieveBrackets: (bracketId: string) => void;
  clearBracketGames: () => void;
  fetchBracketGames: (bracketGames: IBracketGame[]) => void;
  onBracketsUndo: () => void;
  advanceTeamsToBrackets: () => void;
  clearSortedTeams: () => void;
  updateExistingBracket: (data: Partial<IBracket>) => void;
  schedulesDetailsClear: () => void;
  addNoteForGame: (game: IBracketGame, bracket: IBracket) => void;
}

interface IProps extends IMapStateToProps, IMapDispatchToProps {
  match: any;
  history: History;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

interface IState {
  activeTab: PlayoffsTabsEnum;
  games?: IGame[];
  teams?: ITeam[];
  timeSlots?: ITimeSlot[];
  fields?: IField[];
  facilities?: IScheduleFacility[];
  bracketGames?: IBracketGame[];
  bracketSeeds?: ISeedDictionary;
  playoffTimeSlots?: ITimeSlot[];
  tableGames?: IGame[];
  saveBracketsModalOpen: boolean;
  cancelConfirmationOpen: boolean;
  highlightedGameId?: number;
  replacementBracketGames?: IBracketGame[];
  replacementMessage?: string;
  isOpenCreateBracket: boolean;
  days: string[];
  multiDay: string[];
  selectedDay?: string;
  gamesChanged?: IChangedGame[];
  selectedPool?: string | undefined;
  isAdvanceLoading?: boolean;
}

enum PlayoffsTabsEnum {
  None = 0,
  ResourceMatrix = 1,
  BracketManager = 2,
}

class Playoffs extends Component<IProps> {
  state: IState = {
    activeTab: PlayoffsTabsEnum.ResourceMatrix,
    cancelConfirmationOpen: false,
    saveBracketsModalOpen: false,
    highlightedGameId: undefined,
    isOpenCreateBracket: false,
    days: [],
    multiDay: [],
    gamesChanged: [],
  };

  componentDidMount() {
    const { event, match, divisions } = this.props;
    const eventId = event?.event_id!;
    const { scheduleId, bracketId } = match.params;
    this.props.clearBracketGames();
    this.props.clearSchedulesTable();
    this.props.schedulesDetailsClear();
    this.props.clearSortedTeams();
    this.props.fetchEventSummary(eventId);
    this.props.fetchSchedulesDetails(scheduleId);
    this.props.getAllPools(
      divisions!.map((item: any) => {
        return item.division_id;
      })
    );
    if (bracketId) {
      this.retrieveBracketsData();
    }
  }

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    const {
      schedulesDetails,
      schedulesTeamCards,
      match,
      historyLength,
      event,
      bracket,
    } = this.props;
    const { teams, bracketSeeds } = this.state;
    const { bracketId } = match.params;

    // if (!prevState.tableGames && bracketId) {
    //   this.retrieveBracketsData();
    // }

    if (!schedulesTeamCards && schedulesDetails && teams) {
      const mappedTeams = mapTeamsFromSchedulesDetails(schedulesDetails, teams);
      this.props.fillSchedulesTable(mappedTeams);
    }

    if (!this.state.games) {
      this.calculateNeccessaryData();
    }

    if (!this.state.playoffTimeSlots) {
      this.calculatePlayoffTimeSlots();
    }

    if (
      (bracketId || historyLength || !checkMultiDay(event, bracket)) &&
      (!this.state.tableGames ||
        prevProps.bracketGames !== this.props.bracketGames)
    ) {
      const res = this.calculatePlayoffTimeSlots();
      this.populateBracketGamesData(res);
    }

    if (!bracketId && !this.state.tableGames) {
      this.calculateBracketGames();
    }

    if (
      (!prevProps.sortedTeams && this.props.sortedTeams) ||
      (!bracketSeeds && this.props.bracketGames)
    ) {
      this.calculateBracketSeeds();
    }

    if (this.props.playoffSaved && !prevProps.playoffSaved) {
      this.updateUrlWithBracketId();
    }

    if (
      prevState.selectedDay !== this.state.selectedDay ||
      (checkMultiDay(event, bracket) &&
        (!prevState.multiDay?.length || !prevState.selectedDay))
    ) {
      const res = this.calculatePlayoffTimeSlots();
      this.populateBracketGamesData(res);
    }
  }

  advanceTeams = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { advanceTeamsToBrackets, bracketGames } = this.props;
    this.setState({
      isAdvanceLoading: true,
    });
    new Promise((resolve, reject) => {
      try {
        resolve(advanceTeamsToBrackets());
      } catch (e) {
        reject(e);
      }
    }).then(() => {
      this.setState({
        isAdvanceLoading: false,
        gamesChanged: bracketGames?.map(
          (bg: IBracketGame) => ({ id: bg.id } as IChangedGame)
        ),
      });
    });
  };

  updateUrlWithBracketId = () => {
    const { match, bracket } = this.props;
    const { eventId, scheduleId } = match.params;
    const bracketId = bracket?.id;
    this.props.history.push(`/playoffs/${eventId}/${scheduleId}/${bracketId}`);
  };

  calculateNeccessaryData = () => {
    const {
      event,
      schedule,
      fields,
      teams,
      divisions,
      facilities,
      schedulesDetails,
    } = this.props;

    if (!event || !schedule || !fields || !teams || !divisions || !facilities)
      return;

    const timeValues = getTimeValuesFromEventSchedule(event, schedule);

    const timeSlots = calculateTimeSlots(
      timeValues,
      schedulesDetails,
      TimeSlotsEntityTypes.SCHEDULE_DETAILS
    );

    const mappedFields = mapFieldsData(fields, facilities);
    const sortedFields = sortFieldsByPremier(mappedFields);

    const { games } = defineGames(sortedFields, timeSlots!);
    const mappedTeams = mapTeamsData(teams, divisions);

    const mappedFacilities = mapFacilitiesData(facilities);

    this.setState({
      games,
      timeSlots,
      fields: sortedFields,
      teams: mappedTeams,
      facilities: mappedFacilities,
    });
  };

  retrieveBracketsData = () => {
    const { match } = this.props;
    const { bracketId } = match.params;
    this.props.retrieveBrackets(bracketId);
    this.props.retrieveBracketsGames(bracketId);
  };

  changeSelectedDay = (newDay: string) => {
    this.setState({ selectedDay: newDay });
  };

  calculatePlayoffTimeSlots = () => {
    const { schedulesDetails, event, bracket, fields, divisions } = this.props;
    const { timeSlots } = this.state;
    // const { bracketId } = match?.params;
    const tGames = schedulesDetails?.sort(
      (a: ISchedulesDetails, b: ISchedulesDetails) =>
        dateToShortString(a.game_date) < dateToShortString(b.game_date) ? 1 : -1
    );
    const date = tGames?.find((game: ISchedulesDetails) => game.game_date)
      ?.game_date;

    const day = dateToShortString(date || event?.event_enddate);
    if (
      !schedulesDetails ||
      !timeSlots ||
      !event ||
      !day ||
      !bracket ||
      !fields ||
      !divisions
    )
      return;
    const initialStartTimeSlot = bracket.startTimeSlot;

    const sortedTimeGames = tGames
      ?.filter(
        (item: ISchedulesDetails) =>
          dateToShortString(item.game_date) === day &&
          (item.home_team_id || item.away_team_id)
      )
      ?.sort((a: ISchedulesDetails, b: ISchedulesDetails) =>
        a.game_time && b.game_time && a.game_time < b.game_time ? 1 : -1
      )
      ?.find((item: ISchedulesDetails) => item.game_time);
    const startTimeSlot = (
      timeSlots?.find(
        (ts: ITimeSlot) =>
          sortedTimeGames?.game_time && ts.time > sortedTimeGames?.game_time
      ) || timeSlots[0]
    ).id;

    let playoffTimeSlots: ITimeSlot[] = [];

    if (
      this.state.multiDay?.length === 1 ||
      (checkMultiDay(event, bracket) &&
        this.state.selectedDay &&
        Number(this.state.selectedDay) > 2)
    ) {
      playoffTimeSlots = timeSlots;
    } else {
      playoffTimeSlots = timeSlots.slice(
        startTimeSlot || Number(initialStartTimeSlot) - 1,
        timeSlots.length
      );
    }

    if (playoffTimeSlots) {
      this.setState({ playoffTimeSlots });
      return playoffTimeSlots;
    }
  };

  /* MOVE PLAYOFF WINDOW */
  movePlayoffWindow = (direction: MovePlayoffWindowEnum) => {
    const { playoffTimeSlots, timeSlots } = this.state;
    const { schedulesDetails, event, bracketGames } = this.props;
    const gameDate = dateToShortString(event?.event_enddate);

    const newPlayoffTimeSlots = movePlayoffTimeSlots(
      schedulesDetails!,
      timeSlots!,
      playoffTimeSlots!,
      gameDate,
      direction
    );

    const startTimeSlot = String(newPlayoffTimeSlots[0].id);
    const endTimeSlot = String(
      newPlayoffTimeSlots[newPlayoffTimeSlots.length - 1].id
    );

    const newBracketGames = moveBracketGames(
      bracketGames!,
      schedulesDetails!,
      timeSlots!,
      gameDate,
      direction
    );

    this.props.fetchBracketGames(newBracketGames);
    this.props.updateExistingBracket({ startTimeSlot, endTimeSlot });
    // force update of dnd layer. just call a re-render
    const prevActiveTab = this.state.activeTab;
    this.setState({ activeTab: PlayoffsTabsEnum.None }, () => {
      this.setState({ activeTab: prevActiveTab });
    });
  };

  /* CALCULATE BRACKET GAMES */
  calculateBracketGames = () => {
    const {
      event,
      divisions,
      schedulesTeamCards,
      fields,
      bracket,
    } = this.props;
    const { games, playoffTimeSlots, multiDay, selectedDay } = this.state;
    let gameDate = "";
    if (multiDay && selectedDay && checkMultiDay(event, bracket)) {
      gameDate = dateToShortString(multiDay[Number(selectedDay) - 1]);
    } else {
      gameDate = dateToShortString(event?.event_enddate);
    }
    if (
      !divisions ||
      !games ||
      !playoffTimeSlots ||
      !schedulesTeamCards ||
      !fields
    )
      return;

    const bracketTeamsNum: number =
      event && event.num_teams_bracket ? event.num_teams_bracket : 0;
    const bracketGames = createBracketGames(
      divisions,
      bracketTeamsNum,
      (event?.bracket_level === "2" && !bracket?.bracketLevel) ||
        bracket?.bracketLevel === 2
    );

    const definedGames = populateDefinedGamesWithPlayoffState(
      games,
      playoffTimeSlots
    );

    if (!bracket?.isManualCreation) {
      const facilityData = getFacilityData(schedulesTeamCards, games);
      const mergedGames = populatePlayoffGames(
        definedGames,
        bracketGames,
        divisions,
        facilityData,
        gameDate,
        this.getAllPools()
      );

      const populatedBracketGames = populateBracketGamesWithData(
        bracketGames,
        mergedGames,
        fields,
        gameDate
      );

      this.props.fetchBracketGames(populatedBracketGames);
      this.mapBracketGamesIntoTableGames(mergedGames);
      return;
    }

    this.props.fetchBracketGames(bracketGames);
    this.mapBracketGamesIntoTableGames(definedGames);
  };

  /* PUT BRACKET GAMES INTO GAMES */
  populateBracketGamesData = (pOTS?: ITimeSlot[]) => {
    const { bracketGames, divisions, event, bracket } = this.props;
    const { games, playoffTimeSlots, multiDay, selectedDay } = this.state;
    if (!games || !playoffTimeSlots || !divisions) return;

    const definedGames = populateDefinedGamesWithPlayoffState(
      games,
      pOTS || playoffTimeSlots
    );

    const existingBracketGames = bracketGames?.filter((v) => !v.hidden);
    const updatedGames = definedGames.map((item) => {
      const foundBracketGame = find(
        existingBracketGames,
        checkMultiDay(event, bracket)
          ? {
              fieldId: item.fieldId,
              startTime: item.startTime,
              gameDate: dateToShortString(multiDay[Number(selectedDay) - 1]),
            }
          : {
              fieldId: item.fieldId,
              startTime: item.startTime,
            }
      );

      return foundBracketGame
        ? updateGameSlot(item, foundBracketGame, divisions, this.getAllPools())
        : item;
    });

    this.mapBracketGamesIntoTableGames(updatedGames);
  };

  /* MAP TABLE GAMES DATA */
  mapBracketGamesIntoTableGames = (mergedGames: IGame[]) => {
    const { event, schedulesTeamCards, bracket } = this.props;
    if (checkMultiDay(event, bracket)) {
      const days = calculateTournamentDays(event!);
      if (!schedulesTeamCards) return;
      let tableOfAllGames: any = [];
      if (days && this.props.schedulesTeamCards) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < days.length; i++) {
          tableOfAllGames = [
            ...tableOfAllGames,
            settleTeamsPerGamesDays(
              mergedGames,
              this.props.schedulesTeamCards,
              days[i]
            ),
          ];
        }
      }

      /* const tGames = tableOfAllGames
        .flat()
        .filter((item: IGame) => item.awayTeam || item.homeTeam)
        .sort((a: IGame, b: IGame) =>
          dateToShortString(a.gameDate) < dateToShortString(b.gameDate) ? 1 : -1
        );

      const date = tGames.find((game: IGame) => game.gameDate)?.gameDate;*/
      this.setState({ multiDay: days });

      const filterGames = tableOfAllGames
        .flat()
        /*.filter(
          (game: IGame) =>
            dateToShortString(game.gameDate) >= dateToShortString(date)
        )*/
        .map((game: IGame) => ({
          ...game,
          isPlayoff: !(game.homeTeamId && game.awayTeamId),
        }));

      this.setState({ tableGames: filterGames });
    } else {
      const { schedulesTeamCards, event } = this.props;
      const leagueDates: string[] = event?.league_dates
        ? JSON.parse(event?.league_dates)?.map((d: string) =>
            dateToShortString(d)
          )
        : null;
      const sortedLeagueDates: string[] = leagueDates?.sort(
        (a: string, b: string) =>
          dateToShortString(a) < dateToShortString(b) ? 1 : -1
      );
      const endDate: string | undefined =
        sortedLeagueDates?.length > 0 &&
        (event?.event_type === "League" || event?.discontinuous_dates_YN === 1)
          ? sortedLeagueDates[0]
          : event?.event_enddate;
      const gameDate: string = dateToShortString(endDate);

      if (!schedulesTeamCards) return;

      const tableGames = settleTeamsPerGamesDays(
        mergedGames,
        schedulesTeamCards,
        gameDate
      );
      this.setState({ tableGames });
    }
  };

  calculateBracketSeeds = () => {
    const { bracketGames, divisions, sortedTeams, teams } = this.props;

    const bracketSeeds = createSeedsFromNum(
      bracketGames!,
      divisions!,
      teams,
      sortedTeams
    );

    if (bracketGames && sortedTeams) {
      const populatedBracketGames = advanceBracketGamesWithTeams(
        bracketGames,
        bracketSeeds
      );
      this.props.fetchBracketGames(populatedBracketGames);
    }

    this.setState({ bracketSeeds });
  };

  setSelectedPool = (poolId: string) => {
    this.setState({
      selectedPool: poolId,
    });
  };

  updateGlobalSeeds = (
    selectedDivision: string,
    divisionSeeds: IBracketSeed[]
  ) => {
    const { bracketGames } = this.props;
    const { bracketSeeds } = this.state;
    const newBracketSeeds = { ...bracketSeeds };
    newBracketSeeds[selectedDivision] = divisionSeeds;
    this.setState({ bracketSeeds: newBracketSeeds });

    const populatedBracketGames = advanceBracketGamesWithTeams(
      bracketGames!,
      newBracketSeeds
    );

    this.props.fetchBracketGames(populatedBracketGames);
  };

  updateMergedGames = (gameId: string, slotId: number, originId?: number) => {
    const {
      bracketGames,
      fields,
      schedulesTeamCards,
      event,
      bracket,
    } = this.props;
    const { tableGames } = this.state;

    if (!bracketGames || !tableGames || !fields)
      return new Error("Error happened during a dnd process.");
    if (checkMultiDay(event, bracket)) {
      const neededDate = dateToShortString(
        this.state.multiDay[Number(this.state.selectedDay) - 1]
      );
      const updatedResult = updateBracketGamesDndResult(
        gameId,
        slotId,
        bracketGames,
        tableGames,
        fields,
        originId,
        schedulesTeamCards,
        neededDate
      );

      const warningResult = setReplacementMessage(
        updatedResult.bracketGames,
        updatedResult.warnings
      );

      if (warningResult) {
        return this.setState({
          replacementBracketGames: warningResult.bracketGames,
          replacementMessage: warningResult.message,
        });
      }

      this.props.fetchBracketGames(updatedResult.bracketGames);
      this.populateBracketGamesData();
    } else {
      if (!bracketGames || !tableGames || !fields)
        return new Error("Error happened during a dnd process.");

      const updatedResult = updateBracketGamesDndResult(
        gameId,
        slotId,
        bracketGames,
        tableGames,
        fields,
        originId,
        schedulesTeamCards
      );

      const warningResult = setReplacementMessage(
        updatedResult.bracketGames,
        updatedResult.warnings
      );

      if (warningResult) {
        return this.setState({
          replacementBracketGames: warningResult.bracketGames,
          replacementMessage: warningResult.message,
        });
      }

      this.props.fetchBracketGames(updatedResult.bracketGames);
      this.populateBracketGamesData();
    }

    if (gameId) {
      this.setState({
        gamesChanged: [
          ...this.state.gamesChanged,
          {
            id: gameId,
            isBracketTable: false,
          } as IChangedGame,
        ],
      });
    }
  };

  openCancelConfirmation = () =>
    this.setState({ cancelConfirmationOpen: true });

  closeCancelConfirmation = () =>
    this.setState({ cancelConfirmationOpen: false });

  onGoBack = () => {
    const { historyLength } = this.props;

    if (historyLength) {
      this.openCancelConfirmation();
    } else {
      this.onExit();
    }
  };

  onExit = () => {
    const { eventId } = this.props.match.params;
    this.props.history.push(`/event/scheduling/${eventId}`);
  };

  addGame = (selectedDivision: string, data: IOnAddGame) => {
    const { bracketGames } = this.props;
    if (!bracketGames?.length) return;

    const { newBracketGames, id: newId } = addGameToExistingBracketGames(
      data,
      bracketGames,
      selectedDivision
    );

    this.setState({
      gamesChanged: [
        ...this.state.gamesChanged,
        {
          id: newId,
        } as IChangedGame,
      ],
    });

    this.props.fetchBracketGames(newBracketGames);
  };

  removeGame = (
    selectedDivision: string,
    gameIndex: number,
    removeGameId?: string
  ) => {
    const { bracketGames } = this.props;
    if (!bracketGames?.length) return;

    const newBracketGames = removeGameFromBracketGames(
      gameIndex,
      bracketGames,
      selectedDivision
    );

    this.setState({
      gamesChanged: this.state.gamesChanged?.filter(
        (item) => item.id !== removeGameId
      ),
    });
    this.props.fetchBracketGames(newBracketGames);
    this.setState({
      gamesChanged: this.state.gamesChanged?.filter(
        (item) => item.id !== removeGameId
      ),
    });
  };

  // tslint:disable-next-line:no-empty
  onSeedsUsed = () => {};

  getAllPools = (): IPool[] | undefined => {
    const poolsList = groupBy(this.props.teams!, "pool_id");
    return this.props.pools?.filter((item: IPool) =>
      keys(poolsList).includes(item.pool_id)
    );
  };

  openBracketsModal = () => this.setState({ saveBracketsModalOpen: true });

  closeBracketsModal = () => this.setState({ saveBracketsModalOpen: false });

  canSaveBracketsData = () => {
    const { bracket, bracketGames } = this.props;

    const bracketExists = Boolean(bracket);
    const bracketPublished = bracket?.published;
    const allGamesAssigned = bracketGames?.every(
      (game) => game.hidden || (game.fieldId && game.startTime)
    );

    return bracketExists && (!bracketPublished || allGamesAssigned);
  };

  saveAs = (bracketData: ICreateBracketModalOutput) => {
    const { bracketGames } = this.props;
    const newBracket = this.props.match.params;

    bracketGames?.map((el) => {
      delete el.id;
    });

    delete newBracket.bracketId;
    this.props.createNewBracket(bracketData);
    this.saveBracketsData(true);

    this.setState({ isOpenCreateBracket: false });
  };

  saveBracketsData = (isSaveAs?: boolean) => {
    const { fields } = this.state;
    const { match, bracketGames } = this.props;
    const { bracketId } = match.params;

    const bracketsGames: IBracketGame[] | undefined = bracketGames?.map(
      (bg: IBracketGame) => ({
        ...bg,
        facilitiesId: find(fields, { id: bg.fieldId })?.facilityId || undefined,
      })
    );
    if (bracketId && !isSaveAs) {
      this.props.savePlayoff(
        bracketsGames?.filter((g: IBracketGame) =>
          this.state.gamesChanged?.find((c: IChangedGame) => c.id === g.id)
        )!
      );
    } else {
      this.props.createPlayoff(bracketsGames!);
    }
    this.setState({
      gamesChanged: [],
    });
  };

  onSavePressed = () => {
    const { cancelConfirmationOpen } = this.state;
    const canSaveBracketsData = this.canSaveBracketsData();

    if (!canSaveBracketsData) {
      return this.openBracketsModal();
    }

    this.saveBracketsData();

    if (cancelConfirmationOpen) {
      this.closeCancelConfirmation();
      this.onExit();
    }
  };

  toggleReplacementMessage = () =>
    this.setState({
      replacementBracketGames: undefined,
      replacementMessage: undefined,
    });

  confirmReplacement = () => {
    const { replacementBracketGames } = this.state;

    if (replacementBracketGames) {
      this.props.fetchBracketGames(replacementBracketGames);
    }

    this.toggleReplacementMessage();
  };

  setHighlightedGame = (id: number) => {
    this.setState({
      highlightedGameId: this.state.highlightedGameId === id ? undefined : id,
    });
  };

  onCloseModal = () => this.setState({ isOpen: false });

  render() {
    const {
      fields,
      activeTab,
      timeSlots,
      facilities,
      bracketSeeds,
      tableGames,
      cancelConfirmationOpen,
      replacementBracketGames,
      replacementMessage,
      playoffTimeSlots,
      saveBracketsModalOpen,
      isOpenCreateBracket,
    } = this.state;
    const {
      history,
      match,
      bracket,
      event,
      divisions,
      pools,
      schedulesTeamCards,
      eventSummary,
      schedules,
      schedule,
      schedulesDetails,
      onBracketsUndo,
      historyLength,
      bracketGames,
      advancingInProgress,
      isFullScreen,
      onToggleFullScreen,
      addNoteForGame,
    } = this.props;
    const saveButtonCondition = bracket && bracketGames;

    return (
      <div>
        <CreateNewBracket
          fields={this.props.fields!}
          divisions={divisions!}
          event={event!}
          bracket={bracket}
          schedules={schedules!}
          isOpen={isOpenCreateBracket}
          onCreateBracket={this.saveAs}
          onClose={() => this.setState({ isOpenCreateBracket: false })}
          selectedMode={"modalBody"}
        />
        <div
          className={`${styles.container} ${
            isFullScreen && styles.containerFullScreen
          }`}
        >
          <DndProvider backend={HTML5Backend}>
            <div className={styles.paperWrapper}>
              <Paper>
                <div className={styles.paperContainer}>
                  {bracket && (
                    <div className={styles.bracketName}>
                      <div>{bracket.name}</div>
                      {event && schedule && (
                        <div className={styles.additionalName}>
                          (Event:{" "}
                          <span style={{ fontWeight: 600 }}>
                            {event.event_name}
                          </span>
                          , Pool Play Version:{" "}
                          <span style={{ fontWeight: 600 }}>
                            {schedule.schedule_name})
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    {!isFullScreen && (
                      <Button
                        label="Close"
                        variant="text"
                        color="secondary"
                        onClick={this.onGoBack}
                      />
                    )}
                    <MenuButton
                      label="Save"
                      variant="contained"
                      color="primary"
                      menuItems={[
                        {
                          label: "Save",
                          action: this.onSavePressed,
                          disabled: !saveButtonCondition,
                        },
                        {
                          label: "Save As...",
                          action: () =>
                            this.setState({ isOpenCreateBracket: true }),
                          // disabled: savingInProgress,
                        },
                      ]}
                    />
                  </div>
                </div>
              </Paper>
            </div>

            <section className={styles.tabsContainer}>
              <div className={styles.tabToggle}>
                <div
                  className={activeTab === 1 ? styles.active : ""}
                  onClick={() => this.setState({ activeTab: 1 })}
                >
                  Resource Matrix
                </div>
                <div
                  className={activeTab === 2 ? styles.active : ""}
                  onClick={() => this.setState({ activeTab: 2 })}
                >
                  Bracket Manager
                </div>
              </div>
              {activeTab === PlayoffsTabsEnum.ResourceMatrix ? (
                this.state.games && (
                  <ResourceMatrix
                    bracketGames={bracketGames!}
                    event={event}
                    bracket={bracket}
                    divisions={divisions}
                    pools={pools}
                    teamCards={schedulesTeamCards}
                    games={
                      checkMultiDay(event, bracket)
                        ? tableGames?.filter(
                            (g) =>
                              dateToShortString(g.gameDate) ===
                              dateToShortString(
                                this.state.multiDay[
                                  Number(this.state.selectedDay) - 1
                                ]
                              )
                          )
                        : tableGames
                    }
                    fields={fields}
                    timeSlots={timeSlots}
                    facilities={facilities}
                    scheduleData={schedule}
                    changeSelectedDay={this.changeSelectedDay}
                    eventSummary={eventSummary}
                    schedulesDetails={schedulesDetails}
                    onTeamCardsUpdate={() => {}}
                    onTeamCardUpdate={() => {}}
                    onGameScoreUpdate={() => {}}
                    onUndo={() => {}}
                    playoffTimeSlots={playoffTimeSlots}
                    isFullScreen={isFullScreen}
                    updateGame={this.updateMergedGames}
                    setHighlightedGame={this.setHighlightedGame}
                    highlightedGameId={this.state.highlightedGameId}
                    onToggleFullScreen={onToggleFullScreen}
                    movePlayoffWindow={this.movePlayoffWindow}
                    multidays={this.state.multiDay}
                  />
                )
              ) : (
                <BracketManager
                  history={history}
                  match={match}
                  event={event}
                  pools={this.getAllPools()}
                  bracket={bracket!}
                  historyLength={historyLength}
                  divisions={divisions!}
                  seeds={bracketSeeds}
                  bracketGames={bracketGames!}
                  advancingInProgress={advancingInProgress}
                  addGame={this.addGame}
                  removeGame={this.removeGame}
                  onUndoClick={onBracketsUndo}
                  advanceTeamsToBrackets={this.advanceTeams}
                  isAdvanceLoading={this.state.isAdvanceLoading!}
                  updateSeeds={this.updateGlobalSeeds}
                  saveBracketsData={this.saveBracketsData}
                  addNoteForGame={addNoteForGame}
                />
              )}
            </section>
          </DndProvider>
          <PopupExposure
            isOpen={cancelConfirmationOpen}
            onClose={this.closeCancelConfirmation}
            onExitClick={this.onExit}
            onSaveClick={this.onSavePressed}
          />
          <SaveBracketsModal
            isOpen={saveBracketsModalOpen}
            onClose={this.closeBracketsModal}
            onPrimaryClick={this.closeBracketsModal}
          />
          <PopupConfirm
            type="warning"
            showYes={!!replacementBracketGames}
            showNo={!!replacementBracketGames}
            isOpen={!!replacementMessage}
            message={replacementMessage || ""}
            onClose={this.toggleReplacementMessage}
            onCanceClick={this.toggleReplacementMessage}
            onYesClick={this.confirmReplacement}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({
  pageEvent,
  schedules,
  scheduling,
  divisions,
  schedulesTable,
  playoffs,
}: IAppState): IMapStateToProps => ({
  event: pageEvent.tournamentData.event,
  facilities: pageEvent.tournamentData.facilities,
  teams: pageEvent.tournamentData.teams,
  divisions: pageEvent.tournamentData.divisions.map((div: any) => ({
    ...div,
    teams: pageEvent.tournamentData.teams?.filter(
      (team: any) => team?.division_id === div.division_id
    ),
  })),
  fields: pageEvent.tournamentData.fields,
  schedules: pageEvent.tournamentData.schedules,
  eventSummary: schedules.eventSummary,
  bracket: scheduling.bracket,
  schedule: schedules.schedule,
  pools: divisions?.pools,
  schedulesTeamCards: schedulesTable.current,
  schedulesDetails: schedules?.schedulesDetails,
  playoffSaved: playoffs?.playoffSaved,
  bracketGames: playoffs?.bracketGames,
  historyLength: playoffs?.bracketGamesHistory?.length,
  sortedTeams: playoffs?.sortedTeams,
  advancingInProgress: playoffs?.advancingInProgress,
});

const mapDispatchToProps = (dispatch: Dispatch): IMapDispatchToProps =>
  bindActionCreators(
    {
      addNoteForGame,
      createNewBracket,
      fetchEventSummary,
      fetchSchedulesDetails,
      getAllPools,
      fillSchedulesTable,
      clearSchedulesTable,
      createPlayoff,
      savePlayoff,
      retrieveBracketsGames,
      retrieveBrackets,
      clearBracketGames,
      fetchBracketGames,
      onBracketsUndo: onUndoBrackets,
      advanceTeamsToBrackets,
      clearSortedTeams,
      updateExistingBracket,
      schedulesDetailsClear,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Playoffs);
