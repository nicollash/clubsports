import React from "react";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import History from "browserhistory";
import {
  loadScoresData,
  saveGames,
  savePlayoffs,
  clearScoresData,
} from "./logic/actions";
import Navigation from "./components/navigation";
import {
  Loader,
  PopupExposure,
  TableSchedule,
  Button,
} from "components/common";
import {
  IDivision,
  ITeam,
  IEventSummary,
  IFacility,
  IEventDetails,
  IField,
  ISchedule,
  IPool,
  ISchedulesGame,
  BindingCbWithOne,
  BindingAction,
  IFetchedBracket,
  BindingCbWithTwo,
  IChangedGame,
  IBracket,
} from "common/models";
import {
  retrieveBracketsGames,
  fetchBracketGames,
  retrieveBrackets,
} from "components/playoffs/logic/actions";
import { Routes, TableScheduleTypes, TimeSlotsEntityTypes } from "common/enums";
import styles from "./styles.module.scss";
import {
  mapFacilitiesData,
  mapFieldsData,
  mapTeamsData,
  mapDivisionsData,
} from "components/schedules/mapTournamentData";
import {
  getTimeValuesFromEventSchedule,
  calculateTimeSlots,
  calculateTournamentDays,
  ITimeValues,
} from "helpers";
import {
  sortFieldsByPremier,
  defineGames,
  IGame,
  settleTeamsPerGamesDays,
} from "components/common/matrix-table/helper";
import { IAppState } from "reducers/root-reducer.types";
import {
  ITeam as IScheduleTeam,
  ITeamCard,
} from "common/models/schedule/teams";
import {
  mapTeamsFromShedulesGames,
  mapTeamCardsToSchedulesGames,
} from "components/schedules/mapScheduleData";
import {
  fillSchedulesTable,
  updateSchedulesTable,
  clearSchedulesTable,
} from "components/schedules/logic/schedules-table/actions";
import ITimeSlot from "common/models/schedule/timeSlots";
import { IScheduleFacility } from "common/models/schedule/facilities";
import { IScheduleDivision } from "common/models/schedule/divisions";
import { IField as IScheduleField } from "common/models/schedule/fields";
import { errorToast } from "components/common/toastr/showToasts";
import {
  mapGamesWithSchedulesGames,
  getSortedWarnGames,
  getGamesWartString,
} from "components/scoring/helpers";
import api from "api/api";
import { adjustPlayoffTimeOnLoadScoring } from "components/schedules/definePlayoffs";
import { IBracketGame } from "components/playoffs/bracketGames";
import ErrorModal from "./components/error-modal";
import { advanceTeamsIntoAnotherBracket } from "components/playoffs/helper";
import {
  mapBracketGames,
  mapFetchedBracket,
} from "../../../playoffs/mapBracketsData";
import { IPlayoffGame } from "../../../../common/models/playoffs/bracket-game";
import { getIcon } from "helpers";
import { ButtonColors, ButtonVariant, Icons } from "common/enums";
import PopupSaveReporting from "components/common/table-schedule/components/popup-save-reporting";
import { calculateDays } from "components/common/matrix-table/helper";

interface MatchParams {
  eventId?: string;
}

interface Props {
  isLoading: boolean;
  isLoaded: boolean;
  savingInProgress: boolean;
  event: IEventDetails | null;
  bracket: IBracket | null;
  facilities: IFacility[];
  fields: IField[];
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeam[];
  schedule: ISchedule | null;
  eventSummary: IEventSummary[];
  schedulesGames: ISchedulesGame[];
  schedulesTeamCards?: ITeamCard[];
  isFullScreen: boolean;
  bracketGames: IBracketGame[] | null;
  bracketName: string;
  loadScoresData: (eventId: string) => void;
  fillSchedulesTable: BindingCbWithOne<ITeamCard[]>;
  updateSchedulesTable: BindingCbWithOne<ITeamCard>;
  saveGames: BindingCbWithTwo<ISchedulesGame[], IChangedGame[] | undefined>;
  savePlayoffs: BindingCbWithTwo<IPlayoffGame[], IChangedGame[] | undefined>;
  onToggleFullScreen: BindingAction;
  clearSchedulesTable: () => void;
  retrieveBracketsGames: (bracketId: string) => void;
  fetchBracketGames: (
    bracketGames: IBracketGame[],
    skipHistory?: boolean
  ) => void;
  retrieveBrackets: (bracketId: string) => void;
  clearScoresData: () => void;
}

interface State {
  games?: IGame[];
  timeSlots?: ITimeSlot[];
  timeValues?: ITimeValues;
  teams?: IScheduleTeam[];
  fields?: IScheduleField[];
  facilities?: IScheduleFacility[];
  divisions?: IScheduleDivision[];
  isExposurePopupOpen: boolean;
  isEnterScores: boolean;
  neccessaryDataCalculated: boolean;
  changesAreMade: boolean;
  gamesChanged?: IChangedGame[];
  playoffTimeSlots?: ITimeSlot[];
  bracketId?: string;
  bracket?: IFetchedBracket;
  errorModalOpen: boolean;
  errorModalMessage?: string;
  isPopupPrintOpen: boolean;
  selectedDay?: string;
}

class RecordScores extends React.Component<
  Props & RouteComponentProps<MatchParams>,
  State
> {
  constructor(props: Props & RouteComponentProps<MatchParams>) {
    super(props);

    this.state = {
      isExposurePopupOpen: false,
      isEnterScores: false,
      neccessaryDataCalculated: false,
      changesAreMade: false,
      errorModalOpen: false,
      bracket: undefined,
      gamesChanged: [],
      isPopupPrintOpen: false,
      selectedDay: undefined,
    };
  }

  async componentDidMount() {
    const {
      loadScoresData,
      retrieveBrackets,
      retrieveBracketsGames,
    } = this.props;
    const eventId = this.props.match.params.eventId;
    this.props.clearSchedulesTable();
    const brackets: (IFetchedBracket | undefined)[] = await api.get(
      "/brackets",
      { event_id: eventId }
    );
    const pBracket: IFetchedBracket | undefined = brackets.find(
      (item: IFetchedBracket | undefined) => item?.is_published_YN
    );
    const publishedBracketId = pBracket?.bracket_id;

    if (eventId) {
      loadScoresData(eventId);

      if (publishedBracketId) {
        retrieveBrackets(publishedBracketId);
        retrieveBracketsGames(publishedBracketId);
      }
    }

    this.setState({
      bracketId: publishedBracketId,
      bracket: pBracket,
    });
  }

  componentDidUpdate() {
    const { schedule, schedulesGames, schedulesTeamCards, event } = this.props;
    const { teams, games, neccessaryDataCalculated, timeSlots } = this.state;
    if (!neccessaryDataCalculated && schedule) {
      this.calculateNeccessaryData();
      return;
    }

    if (
      event &&
      games &&
      !schedulesTeamCards &&
      schedulesGames &&
      teams &&
      schedule
    ) {
      const days = calculateTournamentDays(event);
      const lastDay = days[days.length - 1];
      const mappedGames = mapGamesWithSchedulesGames(games, schedulesGames);
      const playoffTimeSlots = adjustPlayoffTimeOnLoadScoring(
        schedulesGames,
        timeSlots!,
        event,
        lastDay
      );

      this.setState({ games: mappedGames, playoffTimeSlots });

      const mappedTeams = mapTeamsFromShedulesGames(
        schedulesGames,
        teams,
        mappedGames
      );

      this.props.fillSchedulesTable(mappedTeams);
    }
  }

  componentWillUnmount() {
    this.props.clearSchedulesTable();
    this.props.clearScoresData();
  }

  calculateNeccessaryData = () => {
    const {
      event,
      schedule,
      fields,
      teams,
      divisions,
      facilities,
      schedulesGames,
    } = this.props;

    if (
      !schedule ||
      !event ||
      !Boolean(fields.length) ||
      !Boolean(teams.length) ||
      !Boolean(divisions.length) ||
      !Boolean(facilities.length)
    ) {
      return;
    }

    const timeValues = getTimeValuesFromEventSchedule(event, schedule);

    const timeSlots = calculateTimeSlots(
      timeValues,
      schedulesGames,
      TimeSlotsEntityTypes.SCHEDULE_GAMES
    );

    const mappedFields = mapFieldsData(fields, facilities);
    const sortedFields = sortFieldsByPremier(mappedFields);

    const { games } = defineGames(sortedFields, timeSlots!);

    const mappedTeams = mapTeamsData(teams, divisions);
    const mappedFacilities = mapFacilitiesData(facilities);

    const mappedDivisions = mapDivisionsData(divisions);

    return this.setState({
      games,
      timeSlots,
      timeValues,
      divisions: mappedDivisions,
      fields: sortedFields,
      teams: mappedTeams,
      facilities: mappedFacilities,
      neccessaryDataCalculated: true,
    });
  };

  retrieveSchedulesGames = async () => {
    const { games } = this.state;
    const { schedulesTeamCards, schedule, event } = this.props;

    if (!schedule || !games || !schedulesTeamCards) {
      throw errorToast("Failed to retrieve schedules data");
    }

    const tournamentDays = calculateTournamentDays(event!);
    const publishedGames = await api.get("/schedules_details", {
      schedule_id: schedule.schedule_id,
    });

    let schedulesTableGames = [];
    for (const day of tournamentDays) {
      schedulesTableGames.push(
        settleTeamsPerGamesDays(games, schedulesTeamCards, day)
      );
    }
    schedulesTableGames = schedulesTableGames.flat();

    return mapTeamCardsToSchedulesGames(
      schedule,
      schedulesTableGames,
      publishedGames
    );
  };

  saveDraft = async () => {
    const { bracketGames } = this.props;
    const schedulesGames = await this.retrieveSchedulesGames();

    if (!schedulesGames) {
      throw errorToast("Failed to save schedules data");
    }

    if (bracketGames?.length) {
      const errorMessage = this.checkBracketGamesScores(bracketGames);
      if (errorMessage) {
        return this.setState({
          errorModalOpen: true,
          errorModalMessage: errorMessage,
        });
      }
      const brData: IPlayoffGame[] = await mapBracketGames(
        bracketGames,
        mapFetchedBracket(this.state.bracket!)
      );
      this.props.savePlayoffs(brData, this.state.gamesChanged);
    }

    this.props.saveGames(schedulesGames, this.state.gamesChanged);

    this.setState({
      isExposurePopupOpen: false,
      changesAreMade: false,
      gamesChanged: [],
    });
  };

  closeErrorModal = () => {
    this.setState({
      errorModalOpen: false,
      errorModalMessage: undefined,
    });
  };

  checkBracketGamesScores = (bracketGames: IBracketGame[]) => {
    const teamBracketGames = bracketGames.filter(
      (item) => item.awayTeamId || item.homeTeamId
    );

    const unassignedGames = teamBracketGames.filter(
      (item) =>
        (item.awayTeamScore && item.homeTeamScore === undefined) ||
        (item.awayTeamScore === undefined && item.homeTeamScore)
    );

    const tieGames = teamBracketGames.filter(
      (item) =>
        item.awayTeamScore &&
        item.homeTeamScore &&
        item.awayTeamScore === item.homeTeamScore
    );

    if (!unassignedGames.length && !tieGames.length) return;

    const unassignedGamesMessage = `Incomplete scoring for bracket games cannot be saved.\nComplete the scoring for the following games to continue:\n`;
    const tieGamesMessage = `Bracket games with a tie score cannot be saved. \n`;

    const sortedUnassignedGames = getSortedWarnGames(unassignedGames);
    const sortedTieGames = getSortedWarnGames(tieGames);

    const unassignedGamesWarnStrings = getGamesWartString(
      unassignedGamesMessage,
      sortedUnassignedGames
    );
    const tieGamesWarnString = getGamesWartString(
      tieGamesMessage,
      sortedTieGames
    );

    return unassignedGames.length && tieGames.length
      ? unassignedGamesWarnStrings.concat(tieGamesWarnString)
      : unassignedGames.length
      ? unassignedGamesWarnStrings
      : tieGamesWarnString;
  };

  onChangeView = (flag: boolean) => this.setState({ isEnterScores: flag });

  leavePage = () => {
    const eventId = this.props.match.params.eventId;

    History.push(`${Routes.SCORING}/${eventId || ""}`);
  };

  saveOnExit = () => {
    this.saveDraft();
    this.leavePage();
  };

  onLeavePage = () => {
    if (this.state.changesAreMade) {
      this.setState({ isExposurePopupOpen: true });
    } else {
      this.leavePage();
    }
  };

  onClosePopup = () => this.setState({ isExposurePopupOpen: false });

  onScheduleCardUpdate = (teamCard: ITeamCard) => {
    this.props.updateSchedulesTable(teamCard);
    if (!this.state.changesAreMade) {
      this.setState({
        changesAreMade: true,
      });
    }
  };

  changeSelectedDay = (selectedDay: string) => {
    this.setState({ selectedDay });
  };

  onGameUpdated = (game: IChangedGame) => {
    const { gamesChanged } = this.state;
    if (
      !gamesChanged?.find(
        (item: IChangedGame) => item.id === game.id && item.date === game.date
      )
    ) {
      this.setState({
        gamesChanged: [...gamesChanged, game],
      });
    }
  };

  onBracketGameUpdate = (bracketGame: IBracketGame) => {
    const { bracketGames } = this.props;

    if (!bracketGames) return;

    const newBracketGames = advanceTeamsIntoAnotherBracket(
      bracketGame,
      bracketGames
    );

    this.props.fetchBracketGames(newBracketGames, true);
  };

  onPrintClick = () => {
    this.setState({
      isPopupPrintOpen: true,
    });
  };

  render() {
    const {
      isLoading,
      savingInProgress,
      divisions,
      event,
      bracket,
      eventSummary,
      pools,
      schedule,
      schedulesTeamCards,
      isFullScreen,
      onToggleFullScreen,
      bracketGames,
      bracketName,
      schedulesGames,
    } = this.props;

    const {
      fields,
      timeSlots,
      timeValues,
      games,
      facilities,
      isEnterScores,
      isExposurePopupOpen,
      playoffTimeSlots,
      errorModalOpen,
      errorModalMessage,
    } = this.state;

    const loadCondition = !!(
      fields?.length &&
      games?.length &&
      timeSlots?.length &&
      facilities?.length &&
      event &&
      Boolean(divisions.length) &&
      Boolean(pools.length) &&
      Boolean(eventSummary.length) &&
      schedulesTeamCards?.length
    );
    const days = schedulesTeamCards ? calculateDays(schedulesTeamCards) : null;
    return (
      <div className={isFullScreen ? styles.fullScreenWrapper : ""}>
        <Navigation
          isEnterScores={isEnterScores}
          isFullScreen={isFullScreen}
          savingInProgress={savingInProgress}
          onLeavePage={this.onLeavePage}
          onChangeView={this.onChangeView}
          onSaveDraft={this.saveDraft}
          changedGames={this.state.gamesChanged}
        />
        <section className={styles.scoringWrapper}>
          <div className={styles.tableWrapp}>
            {loadCondition && !isLoading && (
              <div className={styles.headerWrapp}>
                <div className={styles.titleWrapp}>
                  <span className={styles.title}>{event?.event_name}:</span>{" "}
                  Pool Play Schedule:{" "}
                  <span style={{ fontWeight: 600 }}>
                    {schedule?.schedule_name}
                  </span>
                  {bracketName ? (
                    <>
                      {" "}
                      Brackets:{" "}
                      <span style={{ fontWeight: 600 }}>{bracketName}</span>
                    </>
                  ) : null}
                </div>
                <div className={styles.buttonWrapp}>
                  <Button
                    onClick={this.onPrintClick}
                    icon={getIcon(Icons.PRINT)}
                    variant={ButtonVariant.TEXT}
                    color={ButtonColors.SECONDARY}
                    label="Print"
                  />
                </div>
              </div>
            )}
            {loadCondition && !isLoading ? (
              <TableSchedule
                tableType={TableScheduleTypes.SCORES}
                event={event!}
                bracket={bracket!}
                fields={fields!}
                games={games!}
                matchups={[]}
                timeSlots={timeSlots!}
                timeValues={timeValues!}
                pools={pools}
                divisions={divisions!}
                facilities={facilities!}
                teamCards={schedulesTeamCards!}
                eventSummary={eventSummary!}
                scheduleData={schedule!}
                schedulesGames={schedulesGames!}
                selectedDayChanged={this.changeSelectedDay}
                isEnterScores={isEnterScores}
                isFullScreen={isFullScreen}
                onScheduleGameUpdate={() => {}}
                onTeamCardsUpdate={() => {}}
                onTeamCardUpdate={this.onScheduleCardUpdate}
                onGameScoreUpdate={this.onGameUpdated}
                onUndo={() => {}}
                onAssignMatchup={() => {}}
                onToggleFullScreen={onToggleFullScreen}
                playoffTimeSlots={playoffTimeSlots}
                bracketGames={bracketGames || undefined}
                onBracketGameUpdate={this.onBracketGameUpdate}
              />
            ) : (
              <Loader />
            )}
          </div>
        </section>
        <PopupExposure
          isOpen={isExposurePopupOpen}
          onClose={this.onClosePopup}
          onExitClick={this.leavePage}
          onSaveClick={this.saveOnExit}
        />
        {loadCondition && !isLoading && days && (
          <PopupSaveReporting
            pools={pools}
            event={event!}
            games={games!}
            fields={fields!}
            tableType={TableScheduleTypes.SCORES}
            timeSlots={timeSlots!}
            facilities={facilities!}
            schedule={schedule!}
            eventDays={days}
            isOpen={this.state.isPopupPrintOpen}
            teamCards={schedulesTeamCards!}
            schedulesGames={schedulesGames}
            onClose={() => this.setState({ isPopupPrintOpen: false })}
          />
        )}
        <ErrorModal
          title="Warning"
          isOpen={errorModalOpen}
          message={errorModalMessage || ""}
          onClose={this.closeErrorModal}
        />
      </div>
    );
  }
}

export default connect(
  ({ recordScores, schedulesTable, playoffs, pageEvent }: IAppState) => ({
    isLoading: recordScores.isLoading,
    isLoaded: recordScores.isLoaded,
    event: recordScores.event,
    bracket: mapFetchedBracket(pageEvent.tournamentData.brackets[0]),
    facilities: recordScores.facilities,
    fields: recordScores.fields,
    divisions: recordScores.divisions,
    pools: recordScores.pools,
    teams: recordScores.teams,
    schedule: recordScores.schedule,
    eventSummary: recordScores.eventSummary,
    schedulesTeamCards: schedulesTable?.current,
    schedulesGames: recordScores.schedulesGames,
    bracketGames: playoffs?.bracketGames,
    bracketName: pageEvent.tournamentData.brackets
      ? pageEvent.tournamentData.brackets[0]?.bracket_name
      : "",
    savingInProgress: recordScores.savingInProgress,
  }),
  (dispatch: Dispatch) =>
    bindActionCreators(
      {
        loadScoresData,
        fillSchedulesTable,
        updateSchedulesTable,
        saveGames,
        clearSchedulesTable,
        retrieveBracketsGames,
        fetchBracketGames,
        savePlayoffs,
        retrieveBrackets,
        clearScoresData,
      },
      dispatch
    )
)(RecordScores);
