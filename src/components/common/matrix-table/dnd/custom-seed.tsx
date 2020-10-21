import React from "react";
import { getContrastingColor, IGame } from "../helper";
import { useDrag } from "react-dnd";
import { TableScheduleTypes } from "common/enums";
import cancelIcon from "assets/canceled.png";
import styles from "./styles.module.scss";
import moveIcon from "assets/moveIconCard.svg";
import { ordinalSuffixOf } from "components/playoffs/helper";
import { bracketSourceTypeEnum } from "components/playoffs/bracketGames";
import { ITeamCard } from "../../../../common/models/schedule/teams";

interface Props {
  game: IGame;
  type: string;
  displayName: string | undefined;
  slotId: number;
  teamId?: string;
  position: 1 | 2;
  teamName?: string;
  teamCards: ITeamCard[];
  tableType: TableScheduleTypes;
  teamScore?: number;
  isDndMode?: boolean;
  divisionId: string;
  showHeatmap: boolean;
  playoffIndex: number;
  isCancelled?: boolean;
  divisionHex?: string;
  divisionName?: string;
  bracketGameId: string;
  isEnterScores?: boolean;
  highlightUnscoredGames?: boolean;
  highlightIncompletedGames?: boolean;
  onGameUpdate: (gameChanges: Partial<IGame>) => void;
}

const CustomSeedCard = ({
  game,
  type,
  teamId,
  teamCards,
  position,
  tableType,
  teamScore,
  isDndMode,
  divisionId,
  displayName,
  isCancelled,
  showHeatmap,
  divisionHex,
  playoffIndex,
  bracketGameId,
  isEnterScores,
  highlightUnscoredGames,
  highlightIncompletedGames,
  onGameUpdate,
}: Props) => {
  const [{ isDragging }, drag] = useDrag({
    item: { id: bracketGameId, type, divisionId, playoffIndex },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  // const sourceId = position === 1 ? "awaySourceId" : "homeSourceId";
  const sourceValue = position === 1 ? "awaySourceValue" : "homeSourceValue";
  const sourceType = position === 1 ? "awaySourceType" : "homeSourceType";
  const positionedTeam = position === 1 ? "awayTeamScore" : "homeTeamScore";

  const onSetSourceForGame = (type: string, id: string) => {
    const teamName = teamCards.find((t: ITeamCard) => t.id === teamId);
    if (teamName) return teamName?.name;
    if (displayName) return displayName;

    switch (type) {
      case bracketSourceTypeEnum.Bye:
        return `${bracketSourceTypeEnum.Bye}`;
      case bracketSourceTypeEnum.Team:
        return `${teamCards.find((t: ITeamCard) => t.id === id)?.name || id}`;
      case bracketSourceTypeEnum.Pool:
        return `${type} ${ordinalSuffixOf(+id)}`;
      case bracketSourceTypeEnum.Loser:
        return `${type} Game ${id}`;
      case bracketSourceTypeEnum.Winner:
        return `${type} Game ${id}`;
      case bracketSourceTypeEnum.Division:
        return `${type} ${ordinalSuffixOf(+id)}`;
      default:
        return `To be Selected`;
    }
  };

  const onChangeScore = (e: React.ChangeEvent<HTMLInputElement>) => {
    onGameUpdate({
      [positionedTeam]: Number(e.target.value),
    });
  };

  const renderScoringInput = () => (
    <p className={styles.cardOptionsWrapper}>
      <label className={styles.scoresInputWrapper}>
        <input
          onChange={onChangeScore}
          value={teamScore || ""}
          type={teamScore ? "number" : "text"}
          placeholder={teamScore ? "" : "—"}
          min="0"
          style={{
            color:
              (highlightUnscoredGames &&
                teamScore !== null &&
                teamScore?.toString() !== "") ||
              highlightIncompletedGames
                ? "rgb(204, 203, 200)"
                : isEnterScores
                ? "#000000"
                : getContrastingColor(divisionHex),
            backgroundColor:
              (highlightUnscoredGames &&
                teamScore !== null &&
                teamScore?.toString() !== "") ||
              highlightIncompletedGames
                ? "rgb(227, 225, 220)"
                : isEnterScores
                ? "#ffffff"
                : "",
          }}
          readOnly={!isEnterScores}
        />
      </label>
    </p>
  );
  return (
    <div
      ref={drag}
      className={`${styles.seedContainer} ${
        position === 1 ? styles.seedContainerTop : styles.seedContainerBottom
      } ${showHeatmap && styles.heatmap}`}
      style={{
        background:
          (highlightUnscoredGames &&
            teamScore !== null &&
            teamScore?.toString() !== "") ||
          highlightIncompletedGames
            ? "rgb(227, 225, 220)"
            : divisionHex
            ? `#${divisionHex}`
            : "#fff",
        color:
          highlightUnscoredGames && teamScore !== null
            ? "rgb(204, 203, 200)"
            : getContrastingColor(divisionHex),
        opacity: isDragging ? 0.8 : 1,
      }}
    >
      {isDndMode && (
        <span className={styles.iconWrapper}>
          <img src={moveIcon} alt="" />
        </span>
      )}
      <span className={styles.seedName}>
        {game && onSetSourceForGame(game[sourceType]!, game[sourceValue]!)}
      </span>
      {tableType === TableScheduleTypes.SCORES &&
        (teamId || game[sourceType]! === bracketSourceTypeEnum.Team) &&
        renderScoringInput()}
      {isCancelled && (
        <img
          className={styles.cancelIcon}
          src={cancelIcon}
          width="60"
          height="22"
          alt="Cancel icon"
        />
      )}
    </div>
  );
};

export default CustomSeedCard;
