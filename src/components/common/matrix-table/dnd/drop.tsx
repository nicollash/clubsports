import React from "react";
import { useDrop } from "react-dnd";
import styles from "./styles.module.scss";
import { ITeamCard } from "common/models/schedule/teams";
import { IGame } from "../helper";
import { IBracket, IEventDetails } from "common/models";
import { checkMultiDay } from "../../../playoffs/helper";

export enum MatrixTableDropEnum {
  TeamDrop = "teamdrop",
  BracketDrop = "bracketdrop",
  ExtraGameDrop = "extraGameDrop",
}

export interface IDropParams {
  teamId: string;
  position: number | undefined;
  gameId: number | undefined;
  possibleGame?: any;
  originGameId?: number;
  originGameDate?: string;
}

export enum GameType {
  "game" = "game",
  "practice" = "practice",
  "allstar" = "allstar",
}

export interface IExtraGameDropParams {
  game?: IGame;
  extraGameType?: GameType.allstar | GameType.practice;
}

interface IProps {
  game: IGame;
  gameId: number;
  position: 1 | 2;
  children?: React.ReactElement;
  teamCards: ITeamCard[];
  acceptType: MatrixTableDropEnum[];
  highlightUnscoredGames?: boolean;
  onDrop: (dropParams: IDropParams) => void;
  onExtraGameDrop?: (extraGameDropParams: IExtraGameDropParams) => void;
  event?: IEventDetails | null;
  bracket?: IBracket | null;
}

const DropContainer = (props: IProps) => {
  const {
    acceptType,
    position,
    onDrop,
    onExtraGameDrop,
    children,
    gameId,
    game,
    teamCards,
    event,
    bracket,
    highlightUnscoredGames,
  } = props;

  const isTeamLocked = teamCards
    .map((team) => team.games)
    .flat()
    .filter(
      (teamCardGame: { id: number; position: number; isTeamLocked: boolean }) =>
        teamCardGame.id === gameId
    )
    .filter(
      (teamCardGame: {
        id: number;
        teamPosition: number;
        isTeamLocked: boolean;
      }) => teamCardGame.teamPosition === props.position
    )[0]?.isTeamLocked;

  const canBeDropped =
    !isTeamLocked || acceptType.includes(MatrixTableDropEnum.BracketDrop);

  const [{ isOver }, drop] = useDrop({
    accept: acceptType,
    drop: (item: any) => {
      if (item.type === MatrixTableDropEnum.ExtraGameDrop && onExtraGameDrop) {
        onExtraGameDrop({
          game,
          extraGameType: item.extraGameType,
        });
      } else {
        onDrop({
          teamId: item.id,
          position: props.position,
          gameId: props.gameId,
          possibleGame: item.possibleGame,
          originGameId: item.originGameId,
          originGameDate: item.originGameDate,
        });
      }
    },
    collect: (mon) => ({
      isOver: mon.isOver(),
    }),
    canDrop: () => canBeDropped,
  });

  return (
    <div
      ref={drop}
      className={`${styles.dropContainer} ${
        // acceptType.includes(MatrixTableDropEnum.BracketDrop)
        acceptType.includes(MatrixTableDropEnum.BracketDrop) &&
        event &&
        !checkMultiDay(event, bracket)
          ? styles.bracketContainer
          : ""
      } ${position === 1 ? styles.dropContainerTop : styles.dropContainerBottom}
        ${highlightUnscoredGames ? styles.unscoredGames : ""}
        `}
      style={{ opacity: isOver && canBeDropped ? 0.5 : 1 }}
    >
      {children}
    </div>
  );
};

export default DropContainer;
