import React from 'react';
import { getContrastingColor, IGame } from '../helper';
import { useDrag } from 'react-dnd';
import { TableScheduleTypes } from 'common/enums';
import cancelIcon from 'assets/canceled.png';
import styles from './styles.module.scss';
import moveIcon from 'assets/moveIconCard.svg';
interface Props {
  type: string;
  round?: number;
  slotId: number;
  seedId?: number;
  teamId?: string;
  position: 1 | 2;
  teamName?: string;
  tableType: TableScheduleTypes;
  teamScore?: number;
  isDndMode?: boolean;
  divisionId: string;
  showHeatmap: boolean;
  playoffIndex: number;
  dependsUpon?: number;
  isCancelled?: boolean;
  divisionHex?: string;
  divisionName?: string;
  bracketGameId: string;
  isEnterScores?: boolean;
  highlightUnscoredGames?: boolean;
  highlightIncompletedGames?: boolean;
  onGameUpdate: (gameChanges: Partial<IGame>) => void;
}

export const getDisplayName = (round?: number, depends?: number) => {
  if ((!round && round !== 0) || !depends) return;
  const key = round > 0 ? 'Winner' : 'Loser';
  return `${key} Game ${depends}`;
};

export default (props: Props) => {
  const {
    type,
    round,
    seedId,
    teamId,
    teamName,
    position,
    tableType,
    teamScore,
    isDndMode,
    divisionId,
    isCancelled,
    showHeatmap,
    dependsUpon,
    divisionHex,
    divisionName,
    playoffIndex,
    bracketGameId,
    isEnterScores,
    highlightUnscoredGames,
    highlightIncompletedGames,
    onGameUpdate,
  } = props;

  const [{ isDragging }, drag] = useDrag({
    item: { id: bracketGameId, type, divisionId, playoffIndex },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const positionedTeam = position === 1 ? 'awayTeamScore' : 'homeTeamScore';

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
                ? '#000000'
                : getContrastingColor(divisionHex),
            backgroundColor:
              (highlightUnscoredGames &&
                teamScore !== null &&
                teamScore?.toString() !== "") ||
              highlightIncompletedGames
                ? "rgb(227, 225, 220)"
                : isEnterScores
                ? '#ffffff'
                : '',
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
            : '#fff',
        color:
          highlightUnscoredGames && teamScore !== null
            ? "rgb(204, 203, 200)"
            : getContrastingColor(divisionHex),
        opacity: isDragging ? 0.8 : 1,
      }}
    >
      {isDndMode && (
        <span className={styles.iconWrapper}>
          <img
            src={moveIcon}
            alt=""
          />
        </span>
      )}
      <span className={styles.seedName}>
        {teamName
          ? `${teamName} (${divisionName})`
          : seedId
          ? `Seed ${seedId} (${divisionName})`
          : getDisplayName(round, dependsUpon)}
      </span>
      {tableType === TableScheduleTypes.SCORES &&
        teamId &&
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
