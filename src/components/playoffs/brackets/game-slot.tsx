import React from "react";
import moment from "moment";
import styles from "./styles.module.scss";
import SeedDrop from "../dnd/drop";
import Seed from "../dnd/seed";
import { IBracketGame, IBracketSeed } from "../bracketGames";
import { formatTimeSlot, getIcon } from "helpers";
import { Icons} from "common/enums";
import { SeedsContext } from "components/playoffs/brackets";

interface IProps {
  bracketGames?: IBracketGame[];
  game: IBracketGame;
  onDrop: any;
  seedRound?: boolean;
  onRemove: (gameIndex: number) => void;
  onNoteOpenPopup: (gameId: string) => void;
  onEditNotePopup: (gameId: string) => void;
}

const BracketGameSlot = (props: IProps) => {
  const {
    game,
    onDrop,
    seedRound,
    bracketGames,
    onRemove,
    onNoteOpenPopup,
    onEditNotePopup,
  } = props;

  const time = formatTimeSlot(game?.startTime || "");
  const date = moment(game?.gameDate).format("MM/DD/YYYY");
  const awaySource = bracketGames?.find(
    (item: IBracketGame) => item.index === game.awayDependsUpon
  );
  const homeSource = bracketGames?.find(
    (item: IBracketGame) => item.index === game.homeDependsUpon
  );
  
  const getDisplayName = (
    round?: number,
    depends?: number,
    isWinner?: boolean
  ) => {
    if (round === undefined || !depends) return;
    const key =
      isWinner ||
      (awaySource && round > awaySource?.round) ||
      (homeSource && round > homeSource?.round)
        ? "Winner"
        : "Loser";
    return `${key} Game ${depends}`;
  };

  const onRemovePressed = () => {
    onRemove(game.index);
  };

  const onAddNotePressed = () => {
    onNoteOpenPopup(game.id);
  };

  const onEditNotePressed = () => {
    onEditNotePopup(game.id);
  };

  const getSeedData = (game: IBracketGame, seeds?: IBracketSeed[]) => {
    const awaySeed = seeds?.find(
      (seed) => seed.teamId === game.awayTeamId || seed.id === game.awaySeedId
    );
    const homeSeed = seeds?.find(
      (seed) => seed.teamId === game.homeTeamId || seed.id === game.homeSeedId
    );

    return {
      awayTeamId: awaySeed?.teamId,
      awayTeamName: awaySeed?.teamName,
      homeTeamId: homeSeed?.teamId,
      homeTeamName: homeSeed?.teamName,
    };
  };

  const getWinner = (game: IBracketGame, position: "away" | "home") => {
    if (!game.awayTeamScore || !game.homeTeamScore) return false;
    return position === "away"
      ? game.awayTeamScore > game.homeTeamScore
      : game.homeTeamScore > game.awayTeamScore;
  };

  return (
    <div className={`${styles.bracketGame} ${game?.hidden && styles.hidden}`}>
      <div className={styles.gameNote}>
        {game.gameNote && (
          <div className={styles.gameNoteContainer}>
            <span>{game.gameNote}</span>
            <div
              className={styles.btnEdit}
              onClick={onEditNotePressed}
            >
              {getIcon(Icons.EDIT)}
            </div>
          </div>
        )}
      </div>
      <SeedsContext.Consumer>
        {({ seeds, highlightedTeam, setHighlightedTeamId }) => (
          <>
            <SeedDrop
              id={game?.index}
              position={1}
              type="seed"
              onDrop={onDrop}
              placeholder={
                !seedRound && !game.awayTeamId
                  ? getDisplayName(
                      game.round,
                      game.awayDependsUpon,
                      getWinner(game, "away")
                    )
                  : ""
              }
            >
              {game?.awaySeedId || game?.awayTeamId ? (
                <Seed
                  seedId={game?.awaySeedId}
                  name={String(game?.awaySeedId)}
                  teamId={getSeedData(game, seeds).awayTeamId}
                  teamName={getSeedData(game, seeds).awayTeamName}
                  score={game.awayTeamScore}
                  isWinner={getWinner(game, "away")}
                  type="seed"
                  dropped={true}
                  isHighlighted={
                    !!highlightedTeam &&
                    highlightedTeam === getSeedData(game, seeds).awayTeamId
                  }
                  setHighlightedTeamId={setHighlightedTeamId}
                />
              ) : undefined}
            </SeedDrop>
            <div className={styles.bracketGameDescription}>
              <div className={styles.descriptionInfo}>
                {game.fieldId && game.startTime ? (
                  <>
                    <span>{`Game ${game?.index}:  ${game?.fieldName}`}</span>
                    <span>{`${time}, ${date}`}</span>
                  </>
                ) : (
                  <>
                    <span>{`Game ${game?.index}`}</span>
                    <span>Unassigned Game</span>
                  </>
                )}
              </div>
              <div className={styles.bracketManage}>
                {game.awaySeedId || game.homeSeedId ? null : (
                  <div className={styles.btnTrash} onClick={onRemovePressed}>
                    {getIcon(Icons.DELETE)}
                  </div>
                )}
                <div className={styles.btnNote} onClick={onAddNotePressed}>
                  {getIcon(Icons.NOTEADD)}
                </div>
              </div>
            </div>
            <SeedDrop
              id={game?.index}
              position={2}
              type="seed"
              onDrop={onDrop}
              placeholder={
                !seedRound && !game.homeTeamId
                  ? getDisplayName(
                      game.round,
                      game.homeDependsUpon,
                      getWinner(game, "home")
                    )
                  : ""
              }
            >
              {game?.homeSeedId || game?.homeTeamId ? (
                <Seed
                  seedId={game?.homeSeedId}
                  name={String(game?.homeSeedId)}
                  teamId={getSeedData(game, seeds).homeTeamId}
                  teamName={getSeedData(game, seeds).homeTeamName}
                  score={game.homeTeamScore}
                  isWinner={getWinner(game, "home")}
                  type="seed"
                  dropped={true}
                  isHighlighted={
                    !!highlightedTeam &&
                    highlightedTeam === getSeedData(game, seeds).homeTeamId
                  }
                  setHighlightedTeamId={setHighlightedTeamId}
                />
              ) : undefined}
            </SeedDrop>
          </>
        )}
      </SeedsContext.Consumer>
    </div>
  );
};

export default BracketGameSlot;
