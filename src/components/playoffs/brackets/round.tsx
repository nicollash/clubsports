import React from "react";
import styles from "./styles.module.scss";
import BracketGameSlot from "./game-slot";
import { IBracketGame } from "../bracketGames";

interface IProps {
  bracketGames?: IBracketGame[];
  games: IBracketGame[];
  onDrop: any;
  title: any;
  seedRound?: boolean;
  negative?: boolean;
  onRemove: (gameIndex: number) => void;
  onNoteOpenPopup: (gameId: string) => void;
  onEditNotePopup: (gameId: string) => void;
};

const BracketRound = (props: IProps) => {
  const {
    games,
    onDrop,
    title,
    seedRound,
    negative,
    bracketGames,
    onRemove,
    onNoteOpenPopup,
    onEditNotePopup,
  } = props;
  const gamesBefore = games?.length > 0 ? games[0].index - 1 : 0;
  return (
    <div
      className={`${
        gamesBefore === 3 ? styles.bracketRound3 : styles.bracketRound
      } ${negative ? styles.negative : ""}`}
    >
      <span className={styles.roundTitle}>{title}</span>
      {games?.map((game: IBracketGame, index: number) => (
        <BracketGameSlot
          onRemove={onRemove}
          onNoteOpenPopup={onNoteOpenPopup}
          onEditNotePopup={onEditNotePopup}
          key={`${index}-round`}
          seedRound={seedRound}
          game={game}
          bracketGames={bracketGames}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
};

export default BracketRound;
