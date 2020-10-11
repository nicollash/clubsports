import React from "react";
import styles from "../styles.module.scss";
import ITimeSlot from "common/models/schedule/timeSlots";
import { IGame } from "../helper";
import RenderGameSlot from "../game-slot";
import { IDropParams, IExtraGameDropParams } from "../dnd/drop";
import { IField } from "common/models/schedule/fields";
import { dateToShortString, formatTimeSlot } from "helpers";
import { ITeamCard } from "common/models/schedule/teams";
import { Icons, TableScheduleTypes } from "common/enums";
import { getIcon } from "helpers";
import { AssignmentType } from "../../table-schedule/helpers";
import { IBracket, IChangedGame, IEventDetails } from "common/models";

interface IProps {
  games: IGame[];
  fields: IField[];
  timeSlot: ITimeSlot;
  isDndMode: boolean;
  teamCards: ITeamCard[];
  tableType: TableScheduleTypes;
  showHeatmap?: boolean;
  isEnterScores?: boolean;
  assignmentType: AssignmentType | undefined;
  simultaneousDnd?: boolean;
  highlightedGamedId?: number;
  isHighlightSameState?: boolean;
  highlightUnscoredGames?: boolean;
  highlightIncompletedGames?: boolean;
  noTransparentGameId?: string;
  moveCard: (params: IDropParams) => void;
  onGameUpdate: (game: IGame) => void;
  addExtraGame?: (extraGameDropParams: IExtraGameDropParams) => void;
  onTeamCardUpdate: (teamCard: ITeamCard) => void;
  onTeamCardsUpdate: (teamCards: ITeamCard[]) => void;
  event?: IEventDetails | null;
  bracket?: IBracket | null;
  onGameScoreUpdate: (game: IChangedGame) => void;
  onDrag: (id: string) => void;
}

const RenderTimeSlot = (props: IProps) => {
  const {
    games,
    fields,
    timeSlot,
    showHeatmap,
    onTeamCardUpdate,
    onGameScoreUpdate,
    teamCards,
    isDndMode,
    tableType,
    isEnterScores,
    assignmentType,
    simultaneousDnd,
    highlightedGamedId,
    isHighlightSameState,
    highlightUnscoredGames,
    highlightIncompletedGames,
    noTransparentGameId,
    moveCard,
    onGameUpdate,
    event,
    bracket,
    addExtraGame,
    onTeamCardsUpdate,
    onDrag,
  } = props;

  const idsGamesForTimeSlot = games
    .filter((game) => game.timeSlotId === timeSlot.id)
    .map((game) => game.id);

  const currentDate = games.find((item) => item.gameDate)?.gameDate;

  const filterByDayAndField = (g: any) => {
    return (
      idsGamesForTimeSlot.includes(g.id) &&
      dateToShortString(currentDate) === dateToShortString(g.date)
    );
  };

  const anyTeamsInFieldUnlocked = teamCards.some((t) =>
    t.games?.filter(filterByDayAndField).some((game) => !game.isTeamLocked)
  );

  const noTeamsInField = !teamCards.some((t) =>
    t.games?.some(filterByDayAndField)
  );

  const isTimeSlotLocked = !(anyTeamsInFieldUnlocked || noTeamsInField);

  const onLockClick = () => {
    const updatedTeamCards = teamCards.map((teamCard) => ({
      ...teamCard,
      games: teamCard.games?.map((item) =>
        idsGamesForTimeSlot.includes(item.id) &&
        dateToShortString(currentDate) === dateToShortString(item.date)
          ? { ...item, isTeamLocked: !isTimeSlotLocked }
          : item
      ),
    }));
    onTeamCardsUpdate(updatedTeamCards);
  };

  return (
    <tr key={timeSlot.id} className={styles.timeSlotRow}>
      <th>
        <div className={styles.fieldNameContainer}>
          <div>{formatTimeSlot(timeSlot.time)}</div>
          {tableType === TableScheduleTypes.SCHEDULES && (
            <button className={styles.lockBtn} onClick={onLockClick}>
              {getIcon(isTimeSlotLocked ? Icons.LOCK : Icons.LOCK_OPEN, {
                fill: "#00A3EA",
              })}
              <span className="visually-hidden">Unlock/Lock teams</span>
            </button>
          )}
        </div>
      </th>
      {games
        .filter(
          (game) => !fields.find((field) => field.id === game.fieldId)?.isUnused
        )
        .map((game: IGame) => (
          <RenderGameSlot
            key={game.id}
            game={game}
            isDndMode={isDndMode}
            teamCards={teamCards}
            tableType={tableType}
            showHeatmap={showHeatmap}
            onTeamCardUpdate={onTeamCardUpdate}
            onGameScoreUpdate={onGameScoreUpdate}
            isEnterScores={isEnterScores}
            assignmentType={assignmentType}
            simultaneousDnd={simultaneousDnd}
            highlightedGamedId={highlightedGamedId}
            isHighlightSameState={isHighlightSameState}
            highlightUnscoredGames={highlightUnscoredGames}
            highlightIncompletedGames={highlightIncompletedGames}
            noTransparentGameId={noTransparentGameId}
            onDrop={moveCard}
            onGameUpdate={onGameUpdate}
            onExtraGameDrop={addExtraGame}
            onDrag={onDrag}
            event={event}
            bracket={bracket}
          />
        ))}
    </tr>
  );
};

export default RenderTimeSlot;
