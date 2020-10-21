import React from "react";
import { useDrag } from "react-dnd";
import { getContrastingColor } from "components/common/matrix-table/helper";
import styles from "./styles.module.scss";
import { IBracketGame } from "components/playoffs/bracketGames";
import { ITeamCard } from "../../../../common/models/schedule/teams";

interface IProps {
  type: string;
  game: IBracketGame;
  gameSlotId?: number;
  divisionHex: string;
  poolHex?: string;
  poolName?: string;
  dropped?: boolean;
  setHighlightedGame?: (id: number) => void;
  teamCards: ITeamCard[];
}

const CustomBracketGameCard = (props: IProps) => {
  const { type, game, divisionHex, gameSlotId, teamCards } = props;
  const {
    id,
    index,
    divisionId,
    divisionName,
    awaySourceValue,
    homeSourceValue,
    awaySourceType,
    homeSourceType,
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
      isDragging: monitor.isDragging(),
    }),
  });

  const highlightGame = () => {
    if (!props.setHighlightedGame || !gameSlotId) return;
    props.setHighlightedGame(gameSlotId);
  };

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.8 : 1,
        background: `#${divisionHex}`,
      }}
      className={styles.container}
      onClick={highlightGame}
    >
      <span style={{ color: getContrastingColor(divisionHex) }}>
        {divisionName}
        &nbsp;G{index}
        <i>;</i>
        {awaySourceType && awaySourceValue
          ? awaySourceType.slice(0, 1) === "W" ||
            awaySourceType.slice(0, 1) === "L"
            ? `${awaySourceType.slice(0, 1)}: G${awaySourceValue} `
            : awaySourceType === "Team"
            ? `${awaySourceType.slice(0, 1)}: ${
                teamCards.find((t: ITeamCard) => t.id === awaySourceValue)
                  ?.name || awaySourceValue
              } `
            : `${awaySourceType.slice(0, 1)}: ${awaySourceValue} `
          : awaySourceType === "Bye"
          ? "Bye "
          : `"To be Selected" `}
        -
        {homeSourceType && homeSourceValue
          ? homeSourceType.slice(0, 1) === "W" ||
            homeSourceType.slice(0, 1) === "L"
            ? ` ${homeSourceType.slice(0, 1)}: G${homeSourceValue}`
            : homeSourceType === "Team"
            ? ` ${homeSourceType.slice(0, 1)}: ${
                teamCards.find((t: ITeamCard) => t.id === homeSourceValue)
                  ?.name || awaySourceValue
              } `
            : ` ${homeSourceType.slice(0, 1)}: ${homeSourceValue} `
          : homeSourceType === "Bye"
          ? " Bye"
          : `"To be Selected" `}
      </span>
    </div>
  );
};

export default CustomBracketGameCard;
