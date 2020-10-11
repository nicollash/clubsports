import React from 'react';
import { useDrag } from 'react-dnd';
import { ITeamCard } from 'common/models/schedule/teams';
import { TooltipMessageTypes } from 'components/common/tooltip-message/types';
import { Tooltip } from 'components/common';
import { getIcon } from 'helpers';
import { Icons } from 'common/enums';
import styles from './styles.module.scss';
import { getContrastingColor } from 'components/common/matrix-table/helper';
import { IMatchup } from 'components/visual-games-maker/helpers';

interface Props {
  game: IMatchup;
  type: string;
  originGameId?: number;
  originGameDate?: string;
  showHeatmap?: boolean;
  isDndMode?: boolean;
}

const ERROR_ICON_STYLES = {
  flexShrink: 0,
  width: '17px',
  fill: '#FF0F19',
};

const GameDragCard = (props: Props) => {
  const {
    game,
    type,
    originGameId,
    originGameDate,
    showHeatmap,
    isDndMode,
  } = props;

  const divisionHex = game.awayTeam?.divisionHex;
  const isDraggable = !game.assignedGameId;

  const [{ isDragging }, drag] = useDrag({
    item: {
      id: game.awayTeamId,
      type,
      possibleGame: game,
      originGameId,
      originGameDate,
    },
    canDrag: isDraggable,
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const renderTeamCardErrors = (teamCard: ITeamCard) => (
    <Tooltip
      title={teamCard?.errors?.join(';')!}
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

  const renderGameCard = (g: IMatchup) => (
    <>
      <p>
        <span>{g.divisionName}:</span>&nbsp;
      </p>
      {g.awayTeam && renderTeamCard(g.awayTeam)}
      <p>
        <span>vs.</span>&nbsp;
      </p>
      {g.homeTeam && renderTeamCard(g.homeTeam)}
    </>
  );

  const renderTeamCard = (teamCard: ITeamCard) => (
    <>
      {teamCard.errors?.length && renderTeamCardErrors(teamCard)}
      {!teamCard.errors?.length && (
        <p>
          <span>{teamCard.name}</span>
          &nbsp;
        </p>
      )}
    </>
  );

  return (
    <div
      ref={drag}
      className={`${styles.cardContainer} ${isDndMode &&
        !isDraggable &&
        styles.isLocked}`}
      style={{
        opacity: isDragging ? 0.8 : 1,
        backgroundColor: showHeatmap ? divisionHex : '#fff',
        color:
          showHeatmap && divisionHex
            ? getContrastingColor(divisionHex)
            : 'gray',
      }}
    >
      {game && renderGameCard(game)}
    </div>
  );
};

export default GameDragCard;
