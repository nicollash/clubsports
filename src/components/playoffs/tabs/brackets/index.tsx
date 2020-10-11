import React, { Component } from "react";
import { orderBy } from "lodash-es";
import { History } from "history";
import update from "immutability-helper";
import { CardMessageTypes } from "components/common/card-message/types";
import { getIcon } from "helpers";
import { Icons } from "common/enums";
import { Select, CardMessage, Button, Tooltip } from "components/common";
import SeedsList from "./seeds-list";
import Brackets from "components/playoffs/brackets";
import { IBracketGame, IBracketSeed } from "components/playoffs/bracketGames";
import { IDivision, IBracket, IPool } from "common/models";
import AddGameModal, { IOnAddGame } from "../../add-game-modal";
import RemoveGameModal from "../../remove-game-modal";
import { IEventDetails } from "common/models";
import { ISeedDictionary } from "components/playoffs";
import BracketsSetupModal from "../../brackets-setup-modal";
import { errorToast } from "components/common/toastr/showToasts";
import styles from "./styles.module.scss";
import { GameType } from "../../../common/matrix-table/dnd/drop";
import { LoaderButton } from "../../../common/loader";

interface IProps {
  match: any;
  history: History;
  bracket: IBracket;
  divisions: IDivision[];
  historyLength: number;
  event?: IEventDetails | null | undefined;
  pools?: any[];
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
}

interface IState {
  reorderMode: boolean;
  selectedDivision?: string;
  selectedPool?: string;
  divisionsOptions?: { label: string; value: string }[];
  poolsOptions?: { label: string; value: string }[];
  divisionGames?: IBracketGame[];
  addGameModalOpen: boolean;
  removeGameIndex: number | null;
  removeGameId?: string | null;
  divisionSeeds?: IBracketSeed[];
  bracketsSetupOpen: boolean;
  bracketsScoringOpen: boolean;
}

class BracketManager extends Component<IProps, IState> {
  dragType = "seed";
  state: IState = {
    reorderMode: false,
    addGameModalOpen: false,
    bracketsSetupOpen: false,
    bracketsScoringOpen: false,
    removeGameIndex: null,
    removeGameId: null,
  };

  componentDidMount() {
    const { divisions } = this.props;
    const divisionsOptions = divisions.map((item) => ({
      label: item.short_name,
      value: item.division_id,
    }));
    const orderedDivisions = orderBy(divisionsOptions, "label");

    this.setState({
      divisionsOptions: orderedDivisions,
      selectedDivision: orderedDivisions[0]?.value,
    });
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
  }

  toggleReorderMode = () =>
    this.setState(({ reorderMode }) => ({ reorderMode: !reorderMode }));

  addGamePressed = () => {
    this.setState({ addGameModalOpen: true });
  };

  onAddGame = (game: IOnAddGame) => {
    const { selectedDivision } = this.state;
    this.props.addGame(selectedDivision!, game);
    this.setState({ addGameModalOpen: false });
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
    this.setState({
      selectedDivision: e.target.value,
    });
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

  render() {
    const {
      onUndoClick,
      historyLength,
      advanceTeamsToBrackets,
      advancingInProgress,
      bracketGames,
      bracket,
      addNoteForGame,
      isAdvanceLoading,
    } = this.props;

    const {
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

            <div className={styles.seedsWrapper}>
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
            </div>
          </div>
        )}
        <div className={styles.bodyWrapper}>
          <div className={styles.bracketActions}>
            <div className={styles.cardMessage}>
              {((this.props.event?.bracket_level === "2" &&
                bracket.bracketLevel !== 1) ||
                bracket.bracketLevel === 2) &&
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
              <Button
                btnStyles={{ marginLeft: 20 }}
                label="+ Add Game"
                variant="text"
                color="secondary"
                onClick={this.addGamePressed}
              />
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
              <div className={styles.reorderTeamsWrapper}>
                {!reorderMode ? (
                  <Tooltip
                    disabled={!seedsReorderDisabled}
                    type="info"
                    title="Reorder of Team Rankings is disabled due to the Non-Advanced / Scored teams reason"
                  >
                    <div>
                      <Button
                        label="Manually Reorder Team Rankings"
                        variant="contained"
                        color="primary"
                        disabled={seedsReorderDisabled}
                        onClick={this.toggleReorderMode}
                      />
                    </div>
                  </Tooltip>
                ) : (
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
                )}
              </div>
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
          {divisionGames && divisionSeeds && (
            <Brackets
              seeds={divisionSeeds}
              games={divisionGames}
              onRemove={this.removeGamePressed}
              addNoteForGame={addNoteForGame}
              bracket={bracket}
            />
          )}
        </div>
      </section>
    );
  }
}

export default BracketManager;
