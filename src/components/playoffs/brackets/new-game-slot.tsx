import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import styles from "./new-styles.module.scss";
import {
  bracketDirectionEnum,
  IBracketConnector,
  IBracketGame,
} from "../bracketGames";
import { dateToMMMDD, formatTimeSlot, getIcon } from "helpers";
import { Icons } from "common/enums";
import { SeedsContext } from "components/playoffs/brackets";
import NewSeed from "../dnd/new-seed";
import { ITeam } from "../../../common/models/teams";
import { DraggableData, ResizableDelta, Rnd } from "react-rnd";
import { DraggableEvent } from "react-draggable";
import { IAppState } from "reducers/root-reducer.types";
import { bindActionCreators, Dispatch } from "redux";
import { changeCustomBracketGame } from "../logic/actions";
import { IEventDetails } from "common/models";
import { Checkbox } from "components/common";
import { IBracketSize } from "../add-game-modal";
import { IScheduleFacility } from "common/models/schedule/facilities";
import { getDependentGames } from "../helper";

interface IMapStateToProps {
  bracketGames: IBracketGame[] | null;
  pageEvent: IEventDetails | null;
}

interface IMapDispatchToProps {
  changeCustomBracketGame: (game: IBracketGame) => void;
}

interface IProps extends IMapStateToProps, IMapDispatchToProps {
  game: IBracketGame;
  teams?: ITeam[];
  scale?: number;
  facility?: IScheduleFacility;
  gameCount: number;
  seedRound?: boolean;
  isDnd: boolean;
  isUseAbbr: boolean;
  sourcesOptions: { label: string; value: string }[];
  onNoteOpenPopup: (gameId: string) => void;
  onEditNotePopup: (gameId: string) => void;
  setGamesChanged: (gameid: string) => void;
  onRemove: (gameIndex: number) => void;
}

const minHeight = 100;
const minWidth = 280;

const bracketDescriptionSizes = {
  height: minHeight,
  border: "1px solid #1c315f",
  checkedBorder: "3px solid #00A3EA",
  connected: "3px solid #1C315F",
};

export const isOverlapping = (
  changedGame: IBracketGame | IBracketSize,
  bracketGames: IBracketGame[]
) => {
  const over = bracketGames?.filter(
    (g: IBracketGame) =>
      changedGame?.id !== g.id &&
      changedGame.xWidth &&
      changedGame.yHeight &&
      g.xWidth &&
      g.yHeight &&
      (changedGame.xLeft || 0) + changedGame.xWidth + 15 >= (g.xLeft || 0) &&
      (changedGame.xLeft || 0) <= (g.xLeft || 0) + g.xWidth + 15 &&
      (changedGame.yTop || 0) - 30 <= (g.yTop || 0) + g.yHeight &&
      (changedGame.yTop || 0) + changedGame.yHeight > (g.yTop || 0) - 30
  );
  const overConnected =
    over && over.length > 0
      ? over?.filter(
          (g: IBracketGame) =>
            !(
              (changedGame.xLeft || 0) + (changedGame.xWidth || 0) - 25 >
                (g.xLeft || 0) &&
              (changedGame.xLeft || 0) < (g.xLeft || 0) + (g.xWidth || 0) - 25
            )
        )
      : false;
  return overConnected;
};

const NewBracketGameSlot = ({
  game,
  isDnd,
  teams,
  facility,
  gameCount,
  pageEvent,
  isUseAbbr,
  bracketGames,
  sourcesOptions,
  onRemove,
  onNoteOpenPopup,
  onEditNotePopup,
  // tslint:disable-next-line:no-shadowed-variable
  changeCustomBracketGame,
  setGamesChanged,
  scale,
}: IProps) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const time = formatTimeSlot(game?.startTime || "");
  const date = dateToMMMDD(game?.gameDate);

  useEffect(() => {
    if (!game.xWidth && !game.yHeight) {
      onChangeCustomBracketGame({
        ...game,
        yTop: 1,
        xLeft: 1,
        xWidth: minWidth,
        yHeight: minHeight,
        direction: bracketDirectionEnum.Right,
      });
    }
  }, []);

  const onAddNotePressed = () => {
    if (onNoteOpenPopup) onNoteOpenPopup(game.id);
  };

  const onEditNotePressed = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onEditNotePopup) onEditNotePopup(game.id);
  };

  const onRemovePressed = () => {
    if (bracketGames) {
      const dependent = getDependentGames([game.index], bracketGames);
      // No need to remove dependent games
      if (dependent.length > 0)
        bracketGames.map((g: IBracketGame) => {
          if (dependent.includes(g.index)) {
            const connectors:
              | IBracketConnector[]
              | undefined = g.connectedBrackets?.filter(
              (c: IBracketConnector) => c.id !== getGameByIndex(game.index)?.id
            );
            changeCustomBracketGame({
              ...g,
              direction: connectors
                ? getBracketDirection(connectors)
                : bracketDirectionEnum.Right,
              connectedBrackets: connectors,
              homeDependsUpon:
                g.homeDependsUpon !== game.index
                  ? g.homeDependsUpon
                  : undefined,
              awayDependsUpon:
                g.awayDependsUpon !== game.index
                  ? g.awayDependsUpon
                  : undefined,
            });
          }
        });
    }
    onRemove(game.index);
  };

  const getGameByIndex = (index: number) => {
    return bracketGames?.find((g: IBracketGame) => g.index === index);
  };

  const onDrag = (_e: DraggableEvent, _data: DraggableData) => {
    setIsDragging(true);
    /* if (
      game.isChecked &&
      bracketGames?.filter((g: IBracketGame) => g.isChecked)!.length > 1
    ) {
      changePositionOfCheckedGames(
        data.x - (game.xLeft || 0),
        data.y - (game.yTop || 0)
      );
    } */
  };

  const onChangeCustomBracketGame = (
    changedGame: IBracketGame | undefined,
    fastChange: boolean = false
  ) => {
    if (!changedGame) return;
    if (fastChange) {
      changeCustomBracketGame(changedGame);
      setGamesChanged(changedGame.id);
      return;
    }

    const over = isOverlapping(
      changedGame,
      bracketGames?.filter(
        (g: IBracketGame) => !changedGame.isChecked || !g.isChecked
      )!
    );

    const conBrackets = (changedGame.connectedBrackets &&
    changedGame.connectedBrackets.length > 0
      ? over && over.length > 0
        ? over.map(
            (o: IBracketGame) =>
              ({
                id: o.id,
                index: o.index,
                y: o.yTop,
                x: o.xLeft,
                direction:
                  (o.xLeft || 0) > (changedGame.xLeft || 0)
                    ? bracketDirectionEnum.Right
                    : bracketDirectionEnum.Left,
              } as IBracketConnector)
          )
        : []
      : (over || []).map(
          (o: IBracketGame) =>
            ({
              id: o.id,
              index: o.index,
              y: o.yTop,
              x: o.xLeft,
              direction:
                (o.xLeft || 0) > (changedGame.xLeft || 0)
                  ? bracketDirectionEnum.Right
                  : bracketDirectionEnum.Left,
            } as IBracketConnector)
        )
    ).sort((a: IBracketConnector, b: IBracketConnector) => a.y - b.y);

    if (over && over.length > 0) {
      const leftConnectors = conBrackets?.filter(
        (c: IBracketConnector) => c.direction === bracketDirectionEnum.Left
      );
      const rightConnectors = conBrackets?.filter(
        (c: IBracketConnector) => c.direction === bracketDirectionEnum.Right
      );
      const conBracket =
        leftConnectors && leftConnectors.length > 0
          ? bracketGames?.find((g) => g.id === leftConnectors[0].id)
          : rightConnectors && rightConnectors?.length > 0
          ? bracketGames?.find((g) => g.id === rightConnectors[0].id)
          : undefined;
      const direction: bracketDirectionEnum =
        rightConnectors &&
        rightConnectors.length === 1 &&
        leftConnectors &&
        leftConnectors.length === 1
          ? bracketDirectionEnum.Both
          : rightConnectors && rightConnectors.length > 1
          ? bracketDirectionEnum.Left
          : bracketDirectionEnum.Right;
      const rightConnected =
        direction !== bracketDirectionEnum.Both &&
        (changedGame?.xLeft || 0) >
          (conBracket?.xLeft || 0) + (conBracket?.xWidth || 0) / 2;
      const lastConBracket = conBracket
        ? bracketGames?.find(
            (g) =>
              g.id ===
              (leftConnectors && leftConnectors.length > 0
                ? leftConnectors[leftConnectors.length - 1].id
                : conBrackets[conBrackets.length - 1].id)
          )
        : undefined;
      const x =
        (conBracket?.xLeft || 1) +
        (rightConnected || direction === bracketDirectionEnum.Both
          ? conBracket?.xWidth || 0
          : -(changedGame?.xWidth || 0) + 1);
      const y =
        rightConnected || direction === bracketDirectionEnum.Left
          ? (conBracket?.yTop || 1) +
            (conBracket?.yHeight || 0) / 2 -
            ((changedGame.yTop || 1) < (conBracket?.yTop || 0)
              ? changedGame.yHeight || 0
              : 0)
          : changedGame?.yTop;
      const height =
        lastConBracket && conBracket && lastConBracket.id !== conBracket.id
          ? Math.abs(
              (lastConBracket?.yTop || 0) +
                (lastConBracket?.yHeight || 0) / 2 -
                ((conBracket?.yTop || 0) + (conBracket?.yHeight || 0) / 2)
            )
          : changedGame.yHeight;
      changeCustomBracketGame({
        ...changedGame!,
        xLeft: x,
        yTop: y,
        yHeight: (height || 0) > minHeight ? height : minHeight,
        direction,
        connectedBrackets: conBrackets,
      });
      over.map((g: IBracketGame) => {
        const connections = [
          ...(g.connectedBrackets && g.connectedBrackets.length > 0
            ? g.connectedBrackets.filter(
                (cB: IBracketConnector) => cB.id !== changedGame.id
              )
            : []),
          {
            id: changedGame.id,
            index: changedGame.index,
            y: changedGame.yTop,
            x: changedGame.xLeft,
            direction:
              (changedGame.xLeft || 0) > (g?.xLeft || 0)
                ? bracketDirectionEnum.Right
                : bracketDirectionEnum.Left,
          } as IBracketConnector,
        ];

        const dir =
          direction === bracketDirectionEnum.Left &&
          connections?.find((c: IBracketConnector) => c.id === changedGame.id)
            ?.direction === bracketDirectionEnum.Left;
        const newDirection = dir
          ? connections.filter(
              (c: IBracketConnector) =>
                c.direction === bracketDirectionEnum.Right
            ).length === 1
            ? bracketDirectionEnum.Both
            : bracketDirectionEnum.Left
          : getBracketDirection(connections);
        changeCustomBracketGame({
          ...g,
          direction: newDirection,
          connectedBrackets: connections,
        });
        setGamesChanged(g.id);
      });
      /* Rerender all brackets
      setTimeout(
        () =>
          conBrackets
            ?.sort((a: IBracketConnector, b: IBracketConnector) =>
              a.direction > b.direction ? 1 : -1
            )
            .map((c: IBracketConnector) => {
              if (
                ((changedGame.direction === bracketDirectionEnum.Both ||
                  direction !== bracketDirectionEnum.Left) &&
                  c.x > (changedGame.xLeft || c.x)) ||
                ((changedGame.direction === bracketDirectionEnum.Both ||
                  direction !== bracketDirectionEnum.Right) &&
                  c.x < (changedGame.xLeft || c.x))
              ) {
                onChangeCustomBracketGame(
                  bracketGames?.find((g: IBracketGame) => g.id === c.id)
                );
              }
            }),
        0
      );*/
    }

    if (!over) {
      changedGame.connectedBrackets = conBrackets;
      changeCustomBracketGame({
        ...changedGame,
        direction: bracketDirectionEnum.Right,
      });
      setGamesChanged(changedGame.id);
    }

    bracketGames?.map((g: IBracketGame) => {
      if (
        g.connectedBrackets?.find(
          (c: IBracketConnector) => changedGame.id === c.id
        ) &&
        !changedGame.connectedBrackets?.find(
          (ch: IBracketConnector) => ch.id === g.id
        )
      ) {
        const connections = g.connectedBrackets?.filter(
          (c: IBracketConnector) => c.id !== changedGame.id
        );
        changeCustomBracketGame({
          ...g,
          connectedBrackets: connections,
          direction: getBracketDirection(connections),
        });
        setGamesChanged(g.id);
      }
    });

    setGamesChanged(game.id);
  };

  const getBracketDirection = (connections: IBracketConnector[]) => {
    const leftConnections = bracketGames?.filter(
      (b: IBracketGame) =>
        b.direction === bracketDirectionEnum.Left &&
        connections?.find((c: IBracketConnector) => c.id === b.id)
    );
    const rightConnections = bracketGames?.filter(
      (b: IBracketGame) =>
        b.direction === bracketDirectionEnum.Right &&
        connections?.find((c: IBracketConnector) => c.id === b.id)
    );
    return leftConnections && leftConnections.length > 0
      ? rightConnections && rightConnections.length > 0
        ? bracketDirectionEnum.Both
        : bracketDirectionEnum.Left
      : bracketDirectionEnum.Right;
  };

  const onCheckDiv = () => {
    if (!isDragging) {
      onChangeCustomBracketGame(
        {
          ...game,
          isChecked: !game.isChecked,
        },
        true
      );
    }
  };

  const onResize = (
    _e: MouseEvent | TouchEvent,
    _dir: any,
    elementRef: HTMLElement,
    _delta: ResizableDelta,
    _position: any
  ) => {
    const newWidth = +elementRef.style.width.slice(0, -2);
    const newHeight = +elementRef.style.height.slice(0, -2);

    onChangeCustomBracketGame({
      ...game,
      direction: game.direction || bracketDirectionEnum.Right,
      xWidth: newWidth > minWidth ? newWidth : minWidth,
      yHeight: newHeight > minHeight ? newHeight : minHeight,
    });
  };

  const onDragEnd = (_e: DraggableEvent, data: DraggableData) => {
    if (data.x - (game.xLeft || 0) === 0 && data.y - (game.yTop || 0) === 0) {
      setIsDragging(false);
      return;
    }

    setTimeout(() => setIsDragging(false), 100);
    if (game.isChecked) {
      changePositionOfCheckedGames(
        data.x - (game.xLeft || 0),
        data.y - (game.yTop || 0)
      );
    } else {
      onChangeCustomBracketGame({
        ...game,
        xLeft: data.x,
        yTop: data.y,
      });
    }
  };

  const changePositionOfCheckedGames = (deltaX: number, deltaY: number) => {
    const overlaped = bracketGames?.find(
      (item: IBracketGame) =>
        item.isChecked &&
        isOverlapping(
          {
            ...item,
            xLeft: (item?.xLeft || 0) + deltaX,
            yTop: (item?.yTop || 0) + deltaY,
          },
          bracketGames?.filter((g: IBracketGame) => !g.isChecked)
        )
    );
    if (!overlaped) {
      bracketGames?.map((item: IBracketGame) => {
        if (item.isChecked) {
          onChangeCustomBracketGame(
            {
              ...item,
              xLeft: (item?.xLeft || 0) + deltaX,
              yTop: (item?.yTop || 0) + deltaY,
            },
            true
          );
        }
        return item;
      });
    }
  };

  const onChangeSources = (fields: string[]) => {
    changeCustomBracketGame({
      ...game,
      ...fields,
    });
    setGamesChanged(game.id);
  };

  return (
    <Rnd
      size={{
        width: game.xWidth || minWidth,
        height: game.yHeight || minHeight,
      }}
      position={{ x: game.xLeft || 0, y: game.yTop || 0 }}
      disableDragging={!isDnd}
      onDrag={onDrag}
      onDragStop={onDragEnd}
      onResizeStop={onResize}
      enableResizing={{
        top: false,
        topLeft: false,
        topRight: false,
        bottom: true,
        bottomLeft: true,
        bottomRight: true,
        left: game.direction !== bracketDirectionEnum.Right,
        right: game.direction !== bracketDirectionEnum.Left,
      }}
      scale={scale}
    >
      <div
        className={`${styles.bracketGame} ${game?.hidden && styles.hidden}`}
        style={{
          minWidth,
          minHeight,
          width: "100%",
          height: "100%",
        }}
      >
        <div className={styles.gameNote}>
          {game.gameNote && (
            <div className={styles.gameNoteContainer}>
              <span>{game.gameNote}</span>
              <div className={styles.btnEdit} onClick={onEditNotePressed}>
                {getIcon(Icons.EDIT)}
              </div>
            </div>
          )}
        </div>
        <SeedsContext.Consumer>
          {() => (
            <>
              <div className={styles.bracketAwayTeam}>
                <NewSeed
                  game={game}
                  teams={teams}
                  score={game.awayTeamScore}
                  typeTeam={"AwayTeam"}
                  gameCount={gameCount}
                  sourcesOptions={sourcesOptions}
                  topNumberOfTeam={pageEvent?.num_teams_bracket}
                  onChange={onChangeSources}
                />
              </div>
              <div
                className={styles.bracketGameDescription}
                style={{
                  minHeight,
                  height: "100%",
                  width: "100%",
                  minWidth,
                  paddingLeft: "5px",
                  borderRight:
                    !game.direction ||
                    game.direction === bracketDirectionEnum.Right ||
                    game.direction === bracketDirectionEnum.Both
                      ? game.isChecked
                        ? bracketDescriptionSizes.checkedBorder
                        : game.connectedBrackets &&
                          game.connectedBrackets.length > 0
                        ? bracketDescriptionSizes.connected
                        : bracketDescriptionSizes.border
                      : "none",
                  borderLeft:
                    game.direction === bracketDirectionEnum.Left ||
                    game.direction === bracketDirectionEnum.Both
                      ? game.isChecked
                        ? bracketDescriptionSizes.checkedBorder
                        : game.connectedBrackets &&
                          game.connectedBrackets.length > 0
                        ? bracketDescriptionSizes.connected
                        : bracketDescriptionSizes.border
                      : "none",
                  borderTop: game.isChecked
                    ? bracketDescriptionSizes.checkedBorder
                    : game.connectedBrackets &&
                      game.connectedBrackets.length > 0
                    ? bracketDescriptionSizes.connected
                    : bracketDescriptionSizes.border,
                  borderBottom: game.isChecked
                    ? bracketDescriptionSizes.checkedBorder
                    : game.connectedBrackets &&
                      game.connectedBrackets.length > 0
                    ? bracketDescriptionSizes.connected
                    : bracketDescriptionSizes.border,
                }}
              >
                <Checkbox
                  options={[
                    {
                      label: "",
                      checked: Boolean(game.isChecked),
                    },
                  ]}
                  onChange={onCheckDiv}
                />
                <div className={styles.descriptionInfo}>
                  {game.fieldId && game.startTime ? (
                    <>
                      <span>{`Game ${game?.index}: ${game?.fieldName} - ${
                        isUseAbbr ? facility?.abbr : facility?.name
                      }`}</span>
                      <span>{`${time}, ${date}`}</span>
                    </>
                  ) : (
                    <>
                      <span>{`Game ${game?.index}`}</span>
                      <span>Unassigned Game</span>
                    </>
                  )}
                </div>
                <div className={styles.bracketManage}>
                  {game.awaySeedId || game.homeSeedId ? null : (
                    <div className={styles.btnTrash} onClick={onRemovePressed}>
                      {getIcon(Icons.DELETE)}
                    </div>
                  )}
                  <div className={styles.btnNote} onClick={onAddNotePressed}>
                    {getIcon(Icons.NOTEADD)}
                  </div>
                  {isDnd && (
                    <div className={styles.btnCross}>
                      {getIcon(Icons.FULL_SCREEN_CROSS)}
                    </div>
                  )}
                </div>
                <div className={styles.bracketHomeTeam}>
                  <NewSeed
                    game={game}
                    teams={teams}
                    score={game.homeTeamScore}
                    typeTeam={"HomeTeam"}
                    gameCount={gameCount}
                    sourcesOptions={sourcesOptions}
                    topNumberOfTeam={pageEvent?.num_teams_bracket}
                    onChange={onChangeSources}
                  />
                </div>
              </div>
            </>
          )}
        </SeedsContext.Consumer>
      </div>
    </Rnd>
  );
};

const mapStateToProps = ({
  playoffs,
  pageEvent,
}: IAppState): IMapStateToProps => ({
  pageEvent: pageEvent.tournamentData.event,
  bracketGames: playoffs.selectedDivision
    ? playoffs?.bracketGames?.filter(
        (g: IBracketGame) => g.divisionId === playoffs.selectedDivision
      ) || playoffs?.bracketGames
    : playoffs?.bracketGames,
});

const mapDispatchToProps = (dispatch: Dispatch): IMapDispatchToProps =>
  bindActionCreators(
    {
      changeCustomBracketGame,
    },
    dispatch
  );
export default connect(mapStateToProps, mapDispatchToProps)(NewBracketGameSlot);
