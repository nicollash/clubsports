import React, { Component } from "react";
import { orderBy } from "lodash-es";
import { History } from "history";
import update from "immutability-helper";
import { CardMessageTypes } from "components/common/card-message/types";
import { getIcon, sortByField } from "helpers";
import { Icons, SortByFilesTypes } from "common/enums";
import {
  Select,
  CardMessage,
  Button,
  Tooltip,
  Checkbox,
} from "components/common";
import SeedsList from "./seeds-list";
import Brackets from "components/playoffs/brackets";
import { IBracketGame, IBracketSeed } from "components/playoffs/bracketGames";
import { IDivision, IBracket, IPool } from "common/models";
import AddGameModal, { IBracketSize, IOnAddGame } from "../../add-game-modal";
import RemoveGameModal from "../../remove-game-modal";
import { IEventDetails } from "common/models";
import { ISeedDictionary } from "components/playoffs";
import BracketsSetupModal from "../../brackets-setup-modal";
import { errorToast } from "components/common/toastr/showToasts";
import styles from "./styles.module.scss";
import { GameType } from "../../../common/matrix-table/dnd/drop";
import { LoaderButton } from "../../../common/loader";
import NewBrackets from "../../brackets/new-bracket";
import { sourceOptions } from "../../brackets/consts";
import { isOverlapping } from "../../brackets/new-game-slot";
import { IScheduleFacility } from "common/models/schedule/facilities";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { changeSelectedDivision } from "../../logic/actions";

interface IMapDispatchToProps {
  changeSelectedDivision: (division: string) => void;
}

interface IProps extends IMapDispatchToProps {
  match: any;
  history: History;
  bracket: IBracket;
  divisions: IDivision[];
  facilities?: IScheduleFacility[];
  historyLength: number;
  event?: IEventDetails | null | undefined;
  pools?: IPool[];
  seeds?: ISeedDictionary;
  bracketGames?: IBracketGame[];
  advancingInProgress?: boolean;
  addGame: (selectedDivision: string, data: IOnAddGame) => void;
  removeGame: (
    selectedDivision: string,
    data: number,
    removeGameId?: string
  ) => void;
  onUndoClick: () => void;
  advanceTeamsToBrackets: () => void;
  isAdvanceLoading: boolean;
  updateSeeds: (
    selectedDivision: string,
    divisionSeeds: IBracketSeed[]
  ) => void;
  saveBracketsData: () => void;
  addNoteForGame: (game: IBracketGame, bracket: IBracket) => void;
  setGamesChanged: (gameId: string) => void;
  onChangeFacilAbbr: (data: Partial<IBracket>) => void;
}

interface IState {
  reorderMode: boolean;
  isCustomMode: number | null | undefined;
  selectedDivision?: string;
  selectedPool?: string;
  allSourceOptions: { label: string; value: string }[];
  divisionsOptions?: { label: string; value: string }[];
  poolsOptions?: { label: string; value: string }[];
  divisionGames?: IBracketGame[];
  addGameModalOpen: boolean;
  removeGameIndex: number | null;
  removeGameId?: string | null;
  divisionSeeds?: IBracketSeed[];
  bracketsSetupOpen: boolean;
  bracketsScoringOpen: boolean;
  isSelectAll: boolean;
  isFacilAbbr: boolean;
  isDnd: boolean;
  scale: number;
}

class BracketManager extends Component<IProps, IState> {
  dragType = "seed";
  state: IState = {
    isCustomMode: 0,
    isSelectAll: false,
    isFacilAbbr: !!this.props.bracket?.useFacilAbbr,
    allSourceOptions: sourceOptions,
    poolsOptions: [],
    reorderMode: false,
    addGameModalOpen: false,
    bracketsSetupOpen: false,
    bracketsScoringOpen: false,
    removeGameIndex: null,
    removeGameId: null,
    isDnd: false,
    scale: 0.6,
  };
  scale = 0.6;

  componentDidMount() {
    const {
      event,
      match,
      bracket,
      divisions,
      // tslint:disable-next-line:no-shadowed-variable
      changeSelectedDivision,
    } = this.props;
    const { bracketId } = match.params;

    const divisionsOptions = divisions.map((item) => ({
      label: item.short_name,
      value: item.division_id,
    }));
    const orderedDivisions = orderBy(divisionsOptions, "label");
    const allSourceOptions = this.setSourceOptions(orderedDivisions[0]?.value);

    this.setState({
      isCustomMode: !bracketId
        ? event?.custom_playoffs_YN
        : bracket?.customPlayoff,
      isFacilAbbr: !!bracket?.useFacilAbbr,
      divisionsOptions: orderedDivisions,
      selectedDivision: orderedDivisions[0]?.value,
      allSourceOptions,
    });
    changeSelectedDivision(orderedDivisions[0]?.value);
  }

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    const { bracketGames, seeds, pools, bracket } = this.props;
    const { selectedPool, selectedDivision, divisionSeeds } = this.state;

    if (
      seeds &&
      selectedDivision &&
      (!divisionSeeds ||
        prevProps.seeds !== seeds ||
        prevState.selectedDivision !== selectedDivision)
    ) {
      this.setState({
        divisionSeeds: seeds[selectedDivision],
      });
    }

    if (prevState.selectedDivision !== selectedDivision) {
      const filteredPools = pools?.filter(
        (item: IPool) => item.division_id === selectedDivision
      );
      const poolsOptions = filteredPools?.map((item: IPool) => {
        return { label: item.pool_name, value: item.pool_id };
      });
      this.setState({
        poolsOptions,
        selectedPool: poolsOptions ? poolsOptions[0]?.value : undefined,
      });
    }

    if (
      prevProps.bracketGames !== bracketGames ||
      prevState?.selectedDivision !== this.state.selectedDivision ||
      prevState?.selectedPool !== this.state.selectedPool
    ) {
      const divisionGames = bracketGames?.filter(
        (game) =>
          game.divisionId === selectedDivision &&
          (bracket?.bracketLevel !== 2 ||
            !selectedPool ||
            game.poolId === selectedPool) &&
          (!game.gameType || game.gameType === GameType.game)
      );
      this.setState({ divisionGames });
    }

    if (
      this.state.isSelectAll &&
      this.state.divisionGames?.find(
        (g) => g.isChecked !== this.state.isSelectAll
      )
    ) {
      this.setState({ isSelectAll: !this.state.isSelectAll });
    }
  }

  setSourceOptions = (id: string) => {
    const { pools } = this.props;

    const currentPools = sortByField(
      pools!
        .filter((item: IPool) => item.division_id === id)
        .map((item: IPool) => {
          return {
            label: item.pool_name,
            value: item.pool_id,
          };
        }),
      SortByFilesTypes.LABEL
    );

    const teamDivision = sourceOptions.slice(0, 3);
    const winnerLoser = sourceOptions.slice(3);

    return [...teamDivision, ...currentPools, ...winnerLoser];
  };

  toggleReorderMode = () =>
    this.setState(({ reorderMode }) => ({ reorderMode: !reorderMode }));

  changeScale = (scaleOptions: any) => {
    const scaleValue = scaleOptions?.scale;
    if (this.scale !== scaleValue) {
      this.scale = scaleValue;
      // this.setState({ scale: scaleValue });
    }
  };

  addGamePressed = () => {
    this.setState({ addGameModalOpen: true });
  };

  onAddGame = (game: IOnAddGame) => {
    const { selectedDivision } = this.state;
    this.props.addGame(selectedDivision!, game);
    this.setState({ addGameModalOpen: false });
  };

  onAddSingleGame = () => {
    const { selectedDivision } = this.state;
    const { bracketGames, divisions } = this.props;

    const size: IBracketSize = {
      xLeft: 1,
      xWidth: 280,
      yTop: 1,
      yHeight: 100,
    };
    let stepper = 1;
    while (
      isOverlapping(
        size,
        bracketGames?.filter(
          (g: IBracketGame) => g.divisionId === selectedDivision
        ) || []
      ) &&
      stepper < (bracketGames?.length || 0) * 3 + 1
    ) {
      size.yTop += 80;
      stepper++;
    }
    const game: IOnAddGame = {
      awayDependsUpon: "",
      homeDependsUpon: "",
      gridNum: 1,
      isWinner: false,
      divisionName: divisions?.find(
        (d: IDivision) => d.division_id === selectedDivision
      )?.short_name,
      size,
      isChecked: this.state.isSelectAll,
    };
    this.props.addGame(selectedDivision!, game);
  };

  removeGamePressed = (gameIndex: number) => {
    const removeGameId = this.state.divisionGames?.find(
      (item: IBracketGame) => item.index === gameIndex
    )?.id;
    this.setState({ removeGameIndex: gameIndex, removeGameId });
  };

  onRemoveGame = () => {
    const { removeGameIndex, removeGameId, selectedDivision } = this.state;
    if (!removeGameIndex || !selectedDivision) return;
    this.props.removeGame(selectedDivision, removeGameIndex, removeGameId!);
    this.setState({ removeGameIndex: null });
  };

  scoreGamesPressed = () => this.setState({ bracketsScoringOpen: true });

  openBracketsModal = () => this.setState({ bracketsSetupOpen: true });

  closeBracketsModal = () =>
    this.setState({ bracketsSetupOpen: false, bracketsScoringOpen: false });

  bracketsModalOnSecondary = () => {
    const { bracketsSetupOpen, bracketsScoringOpen } = this.state;
    switch (true) {
      case bracketsSetupOpen:
        return this.navigateToBracketsSetup();
      case bracketsScoringOpen:
        return this.navigateToScoringBrackets();
    }
  };

  bracketsModalOnPrimary = () => {
    const { bracketsSetupOpen, bracketsScoringOpen } = this.state;
    switch (true) {
      case bracketsSetupOpen:
        return this.navigateToBracketsSetupWithSaving();
      case bracketsScoringOpen:
        return this.navigateToScoringBracketsWithSaving();
    }
  };

  /* BRACKETS SETUP NAVIGATION */
  navigateToBracketsSetup = () => {
    const { match, history } = this.props;
    const { eventId } = match.params;

    if (!eventId) {
      return errorToast("Can't navigate to the brackets setup.");
    }

    const url = `/event/event-details/${eventId}#playoffs`;
    history?.push(url);
  };

  navigateToBracketsSetupWithSaving = () => {
    this.props.saveBracketsData();
    setTimeout(() => this.navigateToBracketsSetup(), 500);
  };

  /* SCORING BRACKETS NAVIGATION */
  navigateToScoringBrackets = () => {
    const { eventId } = this.props.match?.params;

    if (!eventId) {
      return errorToast("Cannot navigate to the scoring page");
    }

    const url = `/event/scoring/${eventId}`;
    this.props.history.push(url);
  };

  navigateToScoringBracketsWithSaving = () => {
    this.props.saveBracketsData();
    setTimeout(() => this.navigateToScoringBrackets(), 500);
  };

  onDivisionChange = (e: any) => {
    const allSourceOptions = this.setSourceOptions(e.target.value);
    this.setState({
      selectedDivision: e.target.value,
      allSourceOptions,
    });
    this.props.changeSelectedDivision(e.target.value);
  };

  onPoolChange = (e: any) => {
    this.setState({
      selectedPool: e.target.value,
    });
  };

  moveSeed = (dragIndex: number, hoverIndex: number) => {
    const { divisionSeeds } = this.state;

    if (!divisionSeeds) return;

    const dragCard = divisionSeeds[dragIndex];
    const updatedCards = update(divisionSeeds, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragCard],
      ],
    });

    this.setState({ divisionSeeds: updatedCards });
  };

  cancelReorder = () => {
    const { seeds } = this.props;
    const { selectedDivision } = this.state;

    if (seeds && selectedDivision) {
      this.setState({
        divisionSeeds: seeds[selectedDivision],
      });
    }

    this.setState({ reorderMode: false });
  };

  saveReorder = () => {
    const { updateSeeds } = this.props;
    const { divisionSeeds, selectedDivision } = this.state;

    const newDivisionSeeds = divisionSeeds?.map((item, index) => ({
      ...item,
      id: index + 1,
      name: `Seed ${index + 1}`,
    }));

    updateSeeds(selectedDivision!, newDivisionSeeds!);
    this.setState({ reorderMode: false });
  };

  onSelectAll = () => {
    const games = this.state.divisionGames;
    games?.map(
      (game: IBracketGame) => (game.isChecked = !this.state.isSelectAll)
    );

    this.setState({
      isSelectAll: !this.state.isSelectAll,
      divisionGames: games,
    });
  };

  onUseFacilAbbr = () => {
    this.setState({ isFacilAbbr: !this.state.isFacilAbbr });
    this.props.onChangeFacilAbbr({
      useFacilAbbr: Number(!this.state.isFacilAbbr),
    });
  };

  render() {
    const {
      event,
      historyLength,
      advancingInProgress,
      bracketGames,
      bracket,
      isAdvanceLoading,
      divisions,
      facilities,
      onUndoClick,
      addNoteForGame,
      advanceTeamsToBrackets,
      setGamesChanged,
    } = this.props;

    const {
      isFacilAbbr,
      isSelectAll,
      isCustomMode,
      divisionGames,
      divisionsOptions,
      selectedDivision,
      addGameModalOpen,
      removeGameIndex,
      reorderMode,
      divisionSeeds,
      bracketsSetupOpen,
      bracketsScoringOpen,
      poolsOptions,
      selectedPool,
      allSourceOptions,
    } = this.state;

    const seedsLength = divisionSeeds?.length || 0;
    const playInGamesExist = !!(
      seedsLength -
      2 ** Math.floor(Math.log2(seedsLength))
    );

    const advanceTeamsDisabled = bracketGames?.some(
      (item) => item.awayTeamId || item.homeTeamId
    );
    const seedsReorderDisabled =
      divisionGames?.some(
        (item: IBracketGame) => item.awayTeamScore || item.homeTeamScore
      ) || !advanceTeamsDisabled;

    const publishedBracket = bracket?.published;
    const gamesCount = bracketGames?.filter(
      (bg: IBracketGame) =>
        bg.divisionId === selectedDivision &&
        (bracket?.bracketLevel !== 2 ||
          !selectedPool ||
          bg.poolId === selectedPool) &&
        bg.round > 0 &&
        bg.gridNum === 1 &&
        (!bg.gameType || bg.gameType === GameType.game)
    )?.length;

    return (
      <section className={styles.container}>
        {divisionsOptions && selectedDivision && (
          <div className={styles.seedsContainer}>
            <Select
              label="Division"
              options={divisionsOptions}
              value={selectedDivision}
              onChange={this.onDivisionChange}
            />

            <div
              className={
                isCustomMode ? styles.btnsWrapper : styles.seedsWrapper
              }
            >
              {!isCustomMode ? (
                <>
                  <h3>Seeds</h3>
                  <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
                    Ordered List
                  </CardMessage>
                  <SeedsList
                    accept={this.dragType}
                    reorderMode={reorderMode}
                    seeds={
                      divisionSeeds?.slice(
                        0,
                        gamesCount && gamesCount > 0
                          ? gamesCount + 1
                          : divisionSeeds?.length
                      ) || []
                    }
                    moveSeed={this.moveSeed}
                  />
                </>
              ) : (
                <>
                  <Button
                    btnStyles={{
                      fontSize: 14,
                      width: "100%",
                      marginTop: 10,
                      height: 40,
                      lineHeight: "15px",
                    }}
                    label="Add Single Game"
                    variant="outlined"
                    color="secondary"
                    onClick={this.onAddSingleGame}
                  />
                  <Button
                    btnStyles={{
                      fontSize: 14,
                      width: "100%",
                      marginTop: 10,
                      height: 40,
                      lineHeight: "15px",
                    }}
                    label="Add Bracket From Template"
                    variant="outlined"
                    color="secondary"
                    disabled={true}
                    onClick={this.addGamePressed}
                  />
                  <Button
                    btnStyles={{
                      fontSize: 14,
                      width: "100%",
                      marginTop: 10,
                      height: 40,
                      lineHeight: "15px",
                    }}
                    label="Clone Bracket from Another Division"
                    variant="outlined"
                    color="secondary"
                    disabled={true}
                    onClick={this.addGamePressed}
                  />
                  <Tooltip
                    disabled={!advanceTeamsDisabled}
                    type="info"
                    title="Teams are already advanced to the Brackets"
                  >
                    {!isAdvanceLoading ? (
                      <div>
                        <Button
                          btnStyles={{
                            fontSize: 14,
                            width: "100%",
                            marginTop: 10,
                            height: 40,
                            lineHeight: "15px",
                          }}
                          label="Advance Teams to Brackets"
                          variant="outlined"
                          color="secondary"
                          disabled={
                            advancingInProgress || advanceTeamsDisabled
                          }
                          onClick={advanceTeamsToBrackets}
                        />
                      </div>
                    ) : (
                      <LoaderButton />
                    )}
                  </Tooltip>
                  <Button
                    btnStyles={{
                      fontSize: 14,
                      width: "100%",
                      marginTop: 10,
                      height: 40,
                      lineHeight: "15px",
                    }}
                    label="Re-Number all Games"
                    variant="outlined"
                    color="secondary"
                    disabled={true}
                    onClick={this.addGamePressed}
                  />
                </>
              )}
            </div>
          </div>
        )}
        <div className={styles.bodyWrapper}>
          <div className={styles.bracketActions}>
            <div className={styles.cardMessage}>
              {((event?.bracket_level === "2" && bracket?.bracketLevel !== 1) ||
                bracket?.bracketLevel === 2) &&
                poolsOptions &&
                poolsOptions.length > 0 && (
                  <Select
                    options={poolsOptions || []}
                    value={selectedPool || ""}
                    onChange={this.onPoolChange}
                  />
                )}
              <CardMessage
                type={CardMessageTypes.EMODJI_OBJECTS}
                style={{ maxWidth: 400 }}
              >
                Drag, drop, and zoom to navigate the bracket
              </CardMessage>
              {!isCustomMode && (
                <Button
                  label="+ Add Game"
                  variant="outlined"
                  color="secondary"
                  onClick={this.addGamePressed}
                />
              )}
              {publishedBracket && (
                <Button
                  btnStyles={{ marginLeft: 20 }}
                  label="Score Games"
                  variant="text"
                  color="secondary"
                  icon={getIcon(Icons.EDIT)}
                  onClick={this.scoreGamesPressed}
                />
              )}
            </div>
            <div className={styles.buttonsWrapper}>
              {isCustomMode && (
                <div className={styles.selectAll}>
                  <Checkbox
                    options={[
                      {
                        label: "Select/Unselect All",
                        checked: isSelectAll,
                      },
                    ]}
                    onChange={this.onSelectAll}
                  />
                  <Checkbox
                    options={[
                      {
                        label: "Use Facility Abbreviation",
                        checked: isFacilAbbr,
                      },
                    ]}
                    onChange={this.onUseFacilAbbr}
                  />
                </div>
              )}
              <Button
                label="Undo"
                icon={getIcon(Icons.SETTINGS_BACKUP_RESTORE)}
                disabled={!historyLength || historyLength < 2}
                variant="text"
                color="secondary"
                onClick={onUndoClick}
              />
              <Button
                label="Go to Brackets Setup"
                variant="text"
                color="secondary"
                icon={getIcon(Icons.SETTINGS)}
                onClick={this.openBracketsModal}
              />
              {!isCustomMode && (
                <Tooltip
                  disabled={!advanceTeamsDisabled}
                  type="info"
                  title="Teams are already advanced to the Brackets"
                >
                  {!isAdvanceLoading ? (
                    <div>
                      <Button
                        label="Advance Teams to Brackets"
                        variant="contained"
                        color="primary"
                        disabled={advancingInProgress || advanceTeamsDisabled}
                        onClick={advanceTeamsToBrackets}
                      />
                    </div>
                  ) : (
                    <LoaderButton />
                  )}
                </Tooltip>
              )}
              {!reorderMode && !isCustomMode ? (
                <Tooltip
                  disabled={!seedsReorderDisabled}
                  type="info"
                  title="Reorder of Team Rankings is disabled due to the Non-Advanced / Scored teams reason"
                >
                  <Button
                    label="Manually Reorder Team Rankings"
                    variant="contained"
                    color="primary"
                    disabled={seedsReorderDisabled}
                    onClick={this.toggleReorderMode}
                  />
                </Tooltip>
              ) : (
                !isCustomMode && (
                  <div className={styles.reorderTeamsButtons}>
                    <Button
                      label="Cancel"
                      variant="text"
                      color="secondary"
                      onClick={this.cancelReorder}
                    />
                    <Button
                      label="Save Changes"
                      variant="outlined"
                      color="secondary"
                      onClick={this.saveReorder}
                    />
                  </div>
                )
              )}
              {isCustomMode && (
                <div className={styles.dndToggleWrapper}>
                  <h3>Mode: </h3>
                  <div className={styles.buttonBar}>
                    <Button
                      label="Zoom-n-Nav"
                      variant="contained"
                      color={this.state.isDnd ? "default" : "primary"}
                      type={this.state.isDnd ? "squaredOutlined" : "squared"}
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
                      color={this.state.isDnd ? "primary" : "default"}
                      type={this.state.isDnd ? "squared" : "squaredOutlined"}
                      onClick={() => this.setState({ isDnd: true })}
                      btnStyles={{
                        width: "126px",
                        height: "42px",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          {addGameModalOpen && (
            <AddGameModal
              isOpen={addGameModalOpen}
              bracketGames={divisionGames?.filter((item) => !item.hidden)!}
              playInGamesExist={playInGamesExist}
              onClose={() => this.setState({ addGameModalOpen: false })}
              onAddGame={this.onAddGame}
            />
          )}
          {removeGameIndex && (
            <RemoveGameModal
              isOpen={!!removeGameIndex}
              gameIndex={removeGameIndex}
              onClose={() =>
                this.setState({ removeGameIndex: null, removeGameId: null })
              }
              onRemoveGame={this.onRemoveGame}
            />
          )}
          {(bracketsSetupOpen || bracketsScoringOpen) && (
            <BracketsSetupModal
              isOpen={bracketsSetupOpen || bracketsScoringOpen}
              title={
                bracketsSetupOpen
                  ? "Brackets Setup"
                  : bracketsScoringOpen
                  ? "Scoring Brackets"
                  : ""
              }
              onClose={this.closeBracketsModal}
              onSecondary={this.bracketsModalOnSecondary}
              onPrimary={this.bracketsModalOnPrimary}
            />
          )}
          {divisionSeeds && !isCustomMode && (
            <Brackets
              seeds={divisionSeeds}
              games={divisionGames || []}
              onRemove={this.removeGamePressed}
              addNoteForGame={addNoteForGame}
              bracket={bracket}
            />
          )}
          {isCustomMode && (
            <NewBrackets
              sourcesOptions={allSourceOptions}
              division={divisions.find(
                (d: IDivision) => d.division_id === selectedDivision
              )}
              facilities={facilities}
              bracket={bracket}
              setGamesChanged={setGamesChanged}
              seeds={divisionSeeds || []}
              games={
                divisionGames?.filter(
                  (g) => g.divisionId === selectedDivision
                ) || []
              }
              scale={this.scale}
              isDnd={this.state.isDnd}
              isUseAbbr={isFacilAbbr}
              addNoteForGame={addNoteForGame}
              onRemove={this.removeGamePressed}
              onChangeScale={this.changeScale}
            />
          )}
        </div>
      </section>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): IMapDispatchToProps =>
  bindActionCreators(
    {
      changeSelectedDivision,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(BracketManager);
