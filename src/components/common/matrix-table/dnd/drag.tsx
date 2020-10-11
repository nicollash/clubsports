import React from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";
import { ITeamCard } from "common/models/schedule/teams";
import { TooltipMessageTypes } from "components/common/tooltip-message/types";
import { Tooltip } from "components/common";
import { dateToShortString, getIcon } from "helpers";
import { Icons, TableScheduleTypes } from "common/enums";
import { IInputEvent } from "common/types";
import cancelIcon from "assets/canceled.png";
import styles from "./styles.module.scss";
import { getContrastingColor } from "../helper";
import { IGame } from "../helper";
import moveIcon from "assets/moveIconCard.svg";
import { IChangedGame } from "../../../../common/models";

interface Props {
  type: string;
  inList?: boolean;
  teamCard: ITeamCard;
  tableType: TableScheduleTypes;
  showHeatmap?: boolean;
  originGameId?: number;
  isEnterScores?: boolean;
  originGameDate?: string;
  highlightSameState?: boolean;
  highlightUnscoredGames?: boolean;
  highlightIncompletedGames?: boolean;
  onTeamCardUpdate?: (teamCard: ITeamCard) => void;
  onGameScoreUpdate?: (game: IChangedGame) => void;
  onDrag: (id: string) => void;
  isDndMode?: boolean;
  game?: IGame;
}

const ERROR_ICON_STYLES = {
  flexShrink: 0,
  width: "17px",
  fill: "#FF0F19",
};

export default (props: Props) => {
  const {
    game,
    type,
    inList,
    teamCard,
    tableType,
    isDndMode,
    showHeatmap,
    originGameId,
    isEnterScores,
    originGameDate,
    highlightSameState,
    highlightUnscoredGames,
    highlightIncompletedGames,
    onTeamCardUpdate,
    onGameScoreUpdate,
    onDrag,
  } = props;

  const gameFromTeamCard = teamCard.games?.find(
    (tc) =>
      tc.id === originGameId &&
      dateToShortString(tc.date) === dateToShortString(originGameDate)
  );
  const teamScore: number | null | string | undefined =
    gameFromTeamCard?.teamScore;
  const isTeamLocked = gameFromTeamCard?.isTeamLocked;
  const isBracketTable = tableType === TableScheduleTypes.BRACKETS;

  const isDraggable = !isTeamLocked && !isBracketTable;

  const [{ isDragging }, drag] = useDrag({
    item: {
      id: teamCard.id,
      type,
      possibleGame: game,
      originGameId,
      originGameDate,
    },
    canDrag: isDraggable,
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    begin: () => onDrag(teamCard.id),
    end: () => onDrag(''),
  });

  const onLockClick = () => {
    onTeamCardUpdate!({
      ...teamCard,
      games: teamCard.games?.map((item) =>
        item.id === originGameId &&
        dateToShortString(item.date) === dateToShortString(originGameDate)
          ? { ...item, isTeamLocked: !item.isTeamLocked }
          : item
      ),
    });
  };

  const onChangeScore = ({ target: { value } }: IInputEvent) => {
    onTeamCardUpdate!({
      ...teamCard,
      games: teamCard.games?.map((game) =>
        game.id === originGameId &&
        dateToShortString(game.date) === dateToShortString(originGameDate)
          ? { ...game, teamScore: value }
          : game
      ),
    });
    if (onGameScoreUpdate && game) {
      onGameScoreUpdate({
        date: game.gameDate,
        id: game.id,
        startTime: game.startTime,
        fieldId: game.fieldId,
        isBracketTable,
      } as IChangedGame);
    }
  };

  const renderTeamCardErrors = (teamCard: ITeamCard) => (
    <Tooltip
      title={teamCard?.errors?.join(";")!}
      type={TooltipMessageTypes.WARNING}
    >
      <p className={styles.cardNameWrapper}>
        <span
          className={`${styles.cardTextWrapper} ${styles.cardTextWrapperError}`}
        >
          {teamCard.name}({teamCard.divisionShortName})
        </span>
        {getIcon(Icons.ERROR, ERROR_ICON_STYLES)}
      </p>
    </Tooltip>
  );

  const renderTeamCard = () => (
    <>
      {teamCard.errors?.length && renderTeamCardErrors(teamCard)}
      {!teamCard.errors?.length && (
        <p className={styles.cardNameWrapper}>
          <span
            className={styles.cardTextWrapper}
            style={{
              color:
                (highlightUnscoredGames &&
                  teamScore !== null &&
                  teamScore?.toString() !== "") ||
                highlightIncompletedGames ||
                highlightSameState
                  ? "rgb(204, 203, 200)"
                  : showHeatmap && teamCard.divisionHex
                    ? getContrastingColor(teamCard.divisionHex)
                    : "gray",
            }}
          >
            {teamCard.name}&nbsp;({teamCard.divisionShortName})
          </span>
        </p>
      )}
      <p className={styles.cardOptionsWrapper}>
        {tableType === TableScheduleTypes.SCORES && (
          <label className={styles.scoresInputWrapper}>
            <input
              onChange={onChangeScore}
              value={
                gameFromTeamCard?.teamScore !== null
                  ? gameFromTeamCard?.teamScore
                  : ""
              }
              type={gameFromTeamCard?.teamScore ? "number" : "text"}
              placeholder="—"
              style={{
                color:
                  highlightUnscoredGames &&
                  teamScore !== null &&
                  teamScore?.toString() !== ""
                    ? "rgb(204, 203, 200)"
                    : isEnterScores
                    ? "#000000"
                    : getContrastingColor(teamCard.divisionHex),
                backgroundColor: isEnterScores ? "#ffffff" : "",
                textAlign: "center",
              }}
              readOnly={!isEnterScores}
            />
          </label>
        )}
        {tableType === TableScheduleTypes.SCHEDULES && originGameId && (
          <button className={styles.lockBtn} onClick={onLockClick}>
            {getIcon(
              gameFromTeamCard?.isTeamLocked ? Icons.LOCK : Icons.LOCK_OPEN,
              {
                fill:
                  showHeatmap && teamCard.divisionHex ? "#ffffff" : "#00A3EA",
              }
            )}
            <span className="visually-hidden">Unlock/Lock team</span>
          </button>
        )}
      </p>
    </>
  );

  return (
    <div
      ref={drag}
      className={`${styles.cardContainer} ${
        isDndMode && !isDraggable && styles.isLocked
      }`}
      style={{
        opacity: isDragging ? 0.8 : 1,
        backgroundColor:
          (highlightUnscoredGames &&
            teamScore !== null &&
            teamScore?.toString() !== "") ||
          highlightIncompletedGames ||
          highlightSameState
            ? "rgb(227, 225, 220)"
            : showHeatmap
            ? teamCard.divisionHex
            : "#fff",
      }}
    >
      {isDndMode || inList ? (
        <span className={styles.iconWrapper}>
          <img src={moveIcon} alt="" />
        </span>
      ) : null}
      {teamCard && renderTeamCard()}
      {gameFromTeamCard?.isCancelled && (
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
