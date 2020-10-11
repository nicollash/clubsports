import React, { Component } from "react";
import {
  MatrixTable,
  Loader,
  Button,
  CardMessage,
  Select,
} from "components/common";
import {
  IEventDetails,
  IDivision,
  IPool,
  IEventSummary,
  ISchedule,
  ISchedulesDetails,
  IBracket,
  IChangedGame,
} from "common/models";
import { IField } from "common/models/schedule/fields";
import { ITeamCard } from "common/models/schedule/teams";
import { IGame } from "components/common/matrix-table/helper";
import ITimeSlot from "common/models/schedule/timeSlots";
import { IScheduleFacility } from "common/models/schedule/facilities";
import { TableScheduleTypes, Icons } from "common/enums";
import { IBracketGame } from "components/playoffs/bracketGames";
import {
  IDropParams,
  MatrixTableDropEnum,
} from "components/common/matrix-table/dnd/drop";
import MultiSelect, {
  IMultiSelectOption,
} from "components/common/multi-select";
import BracketGamesList from "./bracket-games-list";
import { CardMessageTypes } from "components/common/card-message/types";
import styles from "./styles.module.scss";
import { MovePlayoffWindowEnum } from "components/playoffs";
import {
  checkMultiDay,
  getPlayoffMovementAvailability,
} from "components/playoffs/helper";
import { dateToShortString, getIcon, calculateTournamentDays } from "helpers";
import moment from "moment";

interface IProps {
  bracketGames?: IBracketGame[];
  event?: IEventDetails | null;
  bracket?: IBracket | null;
  divisions?: IDivision[];
  pools?: IPool[];
  teamCards?: ITeamCard[];
  games?: IGame[];
  fields?: IField[];
  timeSlots?: ITimeSlot[];
  scheduleData?: ISchedule;
  facilities?: IScheduleFacility[];
  eventSummary?: IEventSummary[];
  schedulesDetails?: ISchedulesDetails[];
  isFullScreen: boolean;
  playoffTimeSlots?: ITimeSlot[];
  onTeamCardsUpdate: (teamCard: ITeamCard[]) => void;
  onTeamCardUpdate: (teamCard: ITeamCard) => void;
  onGameScoreUpdate: (game: IChangedGame) => void;
  onUndo: () => void;
  updateGame: (gameId: string, slotId: number, originId?: number) => void;
  setHighlightedGame?: (id: number) => void;
  highlightedGameId?: number;
  onToggleFullScreen: () => void;
  movePlayoffWindow: (direction: MovePlayoffWindowEnum) => void;
  multidays: string[];
  changeSelectedDay: (newDay: string) => void;
  mode?: any;
}

interface IState {
  tableGames?: IGame[];
  divisionOptions?: IMultiSelectOption[];
  filteredGames?: IGame[];
  isDnd: boolean;
  days: string[];
  dates: string[];
  selectedDay: string;
  dateSelect: any;
}

class ResourceMatrix extends Component<IProps> {
  state: IState = {
    isDnd: false,
    days: [],
    selectedDay: "1",
    dates: [],
    dateSelect: [],
  };

  componentDidMount() {
    const { divisions } = this.props;
    const { selectedDay } = this.state;
    this.props.changeSelectedDay(selectedDay);
    if (divisions) {
      const divisionOptions = divisions.map((item) => ({
        label: item.short_name,
        value: item.division_id,
        checked: true,
      }));
      this.setState({ divisionOptions });
    }
  }

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    const { divisionOptions, filteredGames, selectedDay } = this.state;
    const { event, games, multidays, divisions, bracket } = this.props;

    if (prevState.selectedDay !== selectedDay) {
      this.props.changeSelectedDay(selectedDay);
    }

    if (
      event &&
      games &&
      (prevProps.games !== games || prevProps.event !== event)
    ) {
      if (divisions) {
        const divisionOptions = divisions.map((item) => ({
          label: item.short_name,
          value: item.division_id,
          checked: true,
        }));
        this.setState({ divisionOptions });
      }

      const days = multidays || calculateTournamentDays(event!);

      if (days?.length && prevState.days !== days) this.setState({ days });
      const dates = [
        ...new Set(
          days
            ? days
                .sort((a: any, b: any) => (a && b ? (a > b ? 1 : -1) : 0))
                .map((v: any) => moment(v).format("MMM D"))
            : []
        ),
      ];
      const dateSelect = dates.map((date: any, key: number) => ({
        label: date,
        value: key + 1,
      }));
      this.setState({ dateSelect });
      this.setState({ dates });
    }

    if (
      prevState.divisionOptions !== divisionOptions ||
      prevProps.games !== this.props.games ||
      prevState.selectedDay !== this.state.selectedDay ||
      (!filteredGames && this.props.games)
    ) {
      const divisionIds =
        this.state.divisionOptions
          ?.filter((item) => item.checked)
          .map((item) => item.value) || [];

      let filteredGames: IGame[] | undefined = [];
      if (checkMultiDay(event, bracket)) {
        filteredGames = this.props.games
          ?.map((game) =>
            divisionIds.includes(
              game.awayTeam?.divisionId! ||
                game.homeTeam?.divisionId! ||
                game.divisionId!
            )
              ? game
              : {
                  ...game,
                  awayTeam: undefined,
                  homeTeam: undefined,
                  awayDependsUpon: undefined,
                  homeDependsUpon: undefined,
                  awaySeedId: undefined,
                  homeSeedId: undefined,
                }
          )
          .filter((item) => {
            return (
              item.gameDate ===
              this.state?.days[Number(this.state?.selectedDay) - 1]
            );
          });
      } else {
        filteredGames = this.props.games?.map((game) =>
          divisionIds.includes(
            game.awayTeam?.divisionId! ||
              game.homeTeam?.divisionId! ||
              game.divisionId!
          )
            ? game
            : {
                ...game,
                awayTeam: undefined,
                homeTeam: undefined,
                awayDependsUpon: undefined,
                homeDependsUpon: undefined,
                awaySeedId: undefined,
                homeSeedId: undefined,
              }
        );
      }

      this.setState({
        filteredGames,
      });
    }
  }

  setSelectedDivision = (name: string, data: IMultiSelectOption[]) =>
    this.setState({ [name]: data });

  onDaySelect = (day: any) => {
    this.setState({ selectedDay: day });
  };

  onMoveCard = (dropParams: IDropParams) => {
    const originId = dropParams.originGameId;
    this.props.updateGame(dropParams.teamId, dropParams.gameId!, originId);
  };

  movePlayoffsUp = () => this.props.movePlayoffWindow(MovePlayoffWindowEnum.UP);
  movePlayoffsDown = () =>
    this.props.movePlayoffWindow(MovePlayoffWindowEnum.DOWN);

  render() {
    const {
      event,
      bracket,
      divisions,
      pools,
      teamCards,
      fields,
      timeSlots,
      facilities,
      scheduleData,
      eventSummary,
      onTeamCardsUpdate,
      onTeamCardUpdate,
      onGameScoreUpdate,
      onUndo,
      highlightedGameId,
      bracketGames,
      setHighlightedGame,
      onToggleFullScreen,
      isFullScreen,
      playoffTimeSlots,
      schedulesDetails,
    } = this.props;

    const { divisionOptions, filteredGames, isDnd } = this.state;
    const gameDate = dateToShortString(event?.event_enddate);

    const result =
      schedulesDetails &&
      bracketGames &&
      playoffTimeSlots &&
      timeSlots &&
      getPlayoffMovementAvailability(
        schedulesDetails,
        bracketGames,
        playoffTimeSlots,
        timeSlots,
        gameDate
      );

    const { upDisabled, downDisabled } = result || {};

    const tournamentDays = calculateTournamentDays(event!);
    const bracketsDate = moment(
      tournamentDays[tournamentDays.length - 1]
    ).format("ddd MMM D");

    return (
      <section className={styles.container}>
        <div className={styles.leftColumn}>
          {bracketGames && divisions && filteredGames && (
            <BracketGamesList
              acceptType={MatrixTableDropEnum.BracketDrop}
              bracketGames={bracketGames}
              divisions={divisions}
              pools={pools}
              filteredGames={filteredGames}
              onDrop={this.onMoveCard}
              setHighlightedGame={setHighlightedGame!}
            />
          )}
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.filterWrapper}>
            <div className={styles.filterBar}>
              <div className={styles.bracketsDate}>
                {!checkMultiDay(event, bracket) && (
                  <span>
                    Date: <b>{bracketsDate}</b>
                  </span>
                )}

                {checkMultiDay(event, bracket) && (
                  <div className={styles.daySelectWrapper}>
                    <Select
                      options={this.state.dateSelect}
                      value={
                        this.state.selectedDay ||
                        this.state.dateSelect?.values()[0]
                      }
                      label="Day Selection"
                      onChange={(item: any) =>
                        this.onDaySelect(item?.target.value)
                      }
                    />
                  </div>
                )}
              </div>
              {!!divisionOptions?.length && (
                <fieldset className={styles.selectWrapper}>
                  <legend className={styles.selectTitle}>Divisions</legend>
                  <MultiSelect
                    placeholder="Select"
                    name="divisionOptions"
                    selectOptions={divisionOptions}
                    onChange={this.setSelectedDivision}
                  />
                </fieldset>
              )}
            </div>
            {!checkMultiDay(event, bracket) && (
              <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
                Bracket timeslots are designated with the dark background
              </CardMessage>
            )}
            {checkMultiDay(event, bracket) && (
              <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
                <span>
                  Bracket games <b>no longer</b> designated with a dark
                  background
                </span>
              </CardMessage>
            )}
            {!checkMultiDay(event, bracket) && (
              <div className={styles.moveBrackets}>
                <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
                  Move playoff timeslots up & down
                </CardMessage>
                <div className={styles.moveBracketsBtns}>
                  <Button
                    label="Up"
                    icon={getIcon(Icons.EXPAND_LESS)}
                    variant="text"
                    color="default"
                    disabled={Boolean(
                      upDisabled !== undefined ? upDisabled : true
                    )}
                    onClick={this.movePlayoffsUp}
                  />
                  <Button
                    label="Down"
                    icon={getIcon(Icons.EXPAND_MORE)}
                    variant="text"
                    color="default"
                    disabled={Boolean(
                      downDisabled !== undefined ? downDisabled : true
                    )}
                    onClick={this.movePlayoffsDown}
                  />
                </div>
              </div>
            )}
            <div className={styles.dndToggleWrapper}>
              <h3>Mode: </h3>
              <div className={styles.buttonBar}>
                <Button
                  label="Zoom-n-Nav"
                  variant="contained"
                  color={isDnd ? "default" : "primary"}
                  type={isDnd ? "squaredOutlined" : "squared"}
                  onClick={() => this.setState({ isDnd: false })}
                  btnStyles={{
                    width: "126px",
                    height: "42px",
                    fontSize: "14px",
                    marginRight: "10px",
                  }}
                />
                <Button
                  label="Drag-n-Drop"
                  variant="contained"
                  color={isDnd ? "primary" : "default"}
                  type={isDnd ? "squared" : "squaredOutlined"}
                  onClick={() => this.setState({ isDnd: true })}
                  btnStyles={{
                    width: "126px",
                    height: "42px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>
          </div>

          {event &&
          divisions &&
          pools &&
          teamCards &&
          filteredGames &&
          fields &&
          timeSlots &&
          facilities &&
          eventSummary &&
          onTeamCardsUpdate &&
          scheduleData &&
          onTeamCardUpdate &&
          onUndo ? (
            <MatrixTable
              tableType={TableScheduleTypes.BRACKETS}
              games={filteredGames}
              fields={fields}
              timeSlots={timeSlots}
              facilities={facilities}
              showHeatmap={true}
              isEnterScores={false}
              moveCard={this.onMoveCard}
              disableZooming={isDnd}
              onTeamCardUpdate={onTeamCardUpdate}
              onGameScoreUpdate={onGameScoreUpdate}
              onTeamCardsUpdate={onTeamCardsUpdate}
              teamCards={teamCards}
              isFullScreen={isFullScreen}
              onToggleFullScreen={onToggleFullScreen}
              highlightedGameId={highlightedGameId}
              onGameUpdate={() => {}}
              event={event}
              bracket={bracket}
            />
          ) : (
            <Loader styles={{ height: "100%" }} />
          )}
        </div>
      </section>
    );
  }
}

export default ResourceMatrix;
