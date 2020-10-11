import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ITimeSlot from "common/models/schedule/timeSlots";
import { ZoomControls } from "components/common";
import { selectProperGamesPerTimeSlot, IGame } from "./helper";
import RenderFieldHeader from "./field-header";
import RenderTimeSlot from "./time-slot";
import { IField } from "common/models/schedule/fields";
import styles from "./styles.module.scss";
import "./styles.scss";
import { IScheduleFacility } from "common/models/schedule/facilities";
import { IDropParams, IExtraGameDropParams } from "./dnd/drop";
import { ITeamCard } from "common/models/schedule/teams";
import { TableScheduleTypes } from "common/enums";
import {
  BindingAction,
  IBracket,
  IChangedGame,
  IPinchProps,
} from "common/models";
import { AssignmentType } from "../table-schedule/helpers";
import { IEventDetails } from "common/models";

const TRANSFORM_WRAPPER_OPTIONS = {
  minScale: 0.1,
  limitToWrapper: true,
};

interface IProps {
  games: IGame[];
  fields: IField[];
  eventDay?: string;
  timeSlots: ITimeSlot[];
  teamCards: ITeamCard[];
  tableType: TableScheduleTypes;
  facilities: IScheduleFacility[];
  showHeatmap: boolean;
  isFullScreen?: boolean;
  isEnterScores?: boolean;
  disableZooming: boolean;
  assignmentType?: AssignmentType;
  simultaneousDnd?: boolean;
  highlightedGameId?: number;
  isHighlightSameState?: boolean;
  highlightUnscoredGames?: boolean;
  highlightIncompletedGames?: boolean;
  noTransparentGameId?: string;
  moveCard: (dropParams: IDropParams) => void;
  onGameUpdate: (game: IGame) => void;
  addExtraGame?: (extraGameDropParams: IExtraGameDropParams) => void;
  onTeamCardUpdate: (teamCard: ITeamCard) => void;
  onGameScoreUpdate: (game: IChangedGame) => void;
  onTeamCardsUpdate: (teamCards: ITeamCard[]) => void;
  onToggleFullScreen?: BindingAction;
  onDrag?: (id: string) => void;
  event?: IEventDetails | null;
  bracket?: IBracket | null;
}

const SchedulesMatrix = (props: IProps) => {
  const {
    games,
    fields,
    tableType,
    teamCards,
    timeSlots,
    facilities,
    showHeatmap,
    isFullScreen,
    isEnterScores,
    disableZooming,
    assignmentType,
    simultaneousDnd,
    highlightedGameId,
    isHighlightSameState,
    highlightUnscoredGames,
    highlightIncompletedGames,
    noTransparentGameId,
    moveCard,
    addExtraGame,
    onGameUpdate,
    onTeamCardUpdate,
    onTeamCardsUpdate,
    onGameScoreUpdate,
    onToggleFullScreen,
    onDrag,
    event,
    bracket,
  } = props;

  const onHandleDragBegin = (id: string) => {
    if (onDrag) {
      onDrag(id);
    }
  };

  const takeFacilityByFieldId = (facilityId: string) =>
    facilities.find((facility) => facility.id === facilityId);
  let scaleVariable = 0;
  const zoomRatioTimeSlots = 1.34;
  const zoomRatioFields = 1.4;
  let defaultPositionX = 5;
  let defaultPositionY = 5;
  if (props.timeSlots.length < props.fields.length) {
    scaleVariable = zoomRatioTimeSlots / (props.fields.length / 5);
  } else {
    scaleVariable = zoomRatioFields / (props.timeSlots.length / 4);
    defaultPositionX = 0;
    defaultPositionY = 0;
  }
  return (
    <section className={styles.section}>
      <h3 className="visually-hidden">Table</h3>
      <div className={`matrix-table__table-wrapper ${styles.tableWrapper}`}>
        <TransformWrapper
          defaultPositionX={defaultPositionX}
          defaultPositionY={defaultPositionY}
          defaultScale={scaleVariable}
          options={{ ...TRANSFORM_WRAPPER_OPTIONS, disabled: disableZooming }}
        >
          {({ zoomIn, zoomOut }: IPinchProps) => (
            <>
              <ZoomControls
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                isFullScreen={isFullScreen}
                onToggleFullScreen={onToggleFullScreen}
              />
              <TransformComponent>
                <table className={styles.table}>
                  <tbody>
                    <tr>
                      <td />
                      {fields
                        .filter((field) => !field.isUnused)
                        .map((field: IField) => (
                          <RenderFieldHeader
                            tableType={tableType}
                            key={field.id}
                            field={field}
                            facility={takeFacilityByFieldId(field.facilityId)}
                            onTeamCardsUpdate={onTeamCardsUpdate}
                            games={games}
                            teamCards={teamCards}
                          />
                        ))}
                    </tr>
                    {timeSlots.map((timeSlot: ITimeSlot) => (
                      <RenderTimeSlot
                        key={timeSlot.id}
                        fields={fields}
                        timeSlot={timeSlot}
                        teamCards={teamCards}
                        tableType={tableType}
                        isDndMode={disableZooming}
                        showHeatmap={showHeatmap}
                        isEnterScores={isEnterScores}
                        assignmentType={assignmentType}
                        onTeamCardUpdate={onTeamCardUpdate}
                        onGameScoreUpdate={onGameScoreUpdate}
                        simultaneousDnd={simultaneousDnd}
                        highlightedGamedId={highlightedGameId}
                        isHighlightSameState={isHighlightSameState}
                        highlightUnscoredGames={highlightUnscoredGames}
                        highlightIncompletedGames={highlightIncompletedGames}
                        noTransparentGameId={noTransparentGameId}
                        games={selectProperGamesPerTimeSlot(timeSlot, games)}
                        moveCard={moveCard}
                        onGameUpdate={onGameUpdate}
                        addExtraGame={addExtraGame}
                        onTeamCardsUpdate={onTeamCardsUpdate}
                        onDrag={onHandleDragBegin}
                        event={event}
                        bracket={bracket}
                      />
                    ))}
                  </tbody>
                </table>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </section>
  );
};

export default SchedulesMatrix;
