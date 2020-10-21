import React from "react";
import { useDrag } from "react-dnd";
import { getContrastingColor } from "components/common/matrix-table/helper";
import styles from "./styles.module.scss";
import { IBracketGame } from "components/playoffs/bracketGames";

interface IProps {
  type: string;
  game: IBracketGame;
  gameSlotId?: number;
  divisionHex: string;
  poolHex?: string;
  poolName?: string;
  dropped?: boolean;
  setHighlightedGame?: (id: number) => void;
}

const BracketGameCard = (props: IProps) => {
  const { type, game, divisionHex, gameSlotId, poolHex, poolName } = props;
  const {
    id,
    round,
    index,
    divisionId,
    divisionName,
    awaySeedId,
    homeSeedId,
    awayDependsUpon,
    homeDependsUpon,
  } = game;
  
  const [{ isDragging }, drag] = useDrag({
    item: {
      id,
      divisionId,
      playoffIndex: index,
      type,
      originGameId: !game.fieldId ? undefined : -1,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const handleDisplayName = (round?: number, depends?: number) => {
    if ((!round && round !== 0) || !depends) return;
    const key = round > 0 ? "WG" : "LG";
    return `${key}${depends}`;
  };

  const highlightGame = () => {
    if (!props.setHighlightedGame || !gameSlotId) return;
    props.setHighlightedGame(gameSlotId);
  };

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.8 : 1,
        background: `#${poolHex || divisionHex}`,
      }}
      className={styles.container}
      onClick={highlightGame}
    >
      <span style={{ color: getContrastingColor(poolHex || divisionHex) }}>
        {divisionName}
        {poolName ? `:${poolName.slice(0, 2)}` : ""}&nbsp;G{index}
        <i>:</i>R{Math.abs(round || 0) + (round < 1 ? 2 : 0)}
        <i>,</i>
        {awaySeedId
          ? `S${awaySeedId}`
          : handleDisplayName(round, awayDependsUpon)}
        <i>:</i>
        {homeSeedId
          ? `S${homeSeedId}`
          : handleDisplayName(round, homeDependsUpon)}
      </span>
    </div>
  );
};

export default BracketGameCard;
