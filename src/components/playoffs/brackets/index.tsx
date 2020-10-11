import React, { useEffect, useState, Fragment } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomControls } from "components/common";
import { groupBy, keys } from "lodash-es";
import BracketRound from "./round";
import { IBracketGame, IBracketSeed } from "../bracketGames";
import BracketConnector from "./connector";
import { IPinchProps, IBracket } from "common/models";
import NoteModal from './note-modal/note-modal';

import styles from "./styles.module.scss";

const TRANSFORM_WRAPPER_OPTIONS = {
  minScale: 0.3,
  limitToWrapper: true,
  limitToBounds: true,
  centerContent: true,
};

interface IProps {
  bracket: IBracket;
  seeds: IBracketSeed[];
  games: IBracketGame[];
  onRemove: (gameIndex: number) => void;
  addNoteForGame: (game: IBracketGame, bracket: IBracket) => void;
};

export const SeedsContext = React.createContext<{
  seeds?: IBracketSeed[];
  highlightedTeam?: string;
  setHighlightedTeamId: (teamId: string) => void;
}>({ setHighlightedTeamId: () => {} });

const Brackets = (props: IProps) => {
  const { 
    games, 
    seeds, 
    bracket, 
    onRemove, 
    addNoteForGame, 
  } = props;
  const [highlightedTeam, setHighlighteamTeam] = useState<string | undefined>();
  const [selectedGameForNote, setSelectedGameForNote] = useState<IBracketGame | undefined>();

  const setHighlightedTeamId = (teamId: string) => {
    setHighlighteamTeam(teamId);
  };

  const getRoundTitle = (grid: string, round: string, gamesLength: number) => {
    if (grid !== "1") return;
    if (
      grids![grid][round]?.length <
        grids![grid][Number(round) + 1]?.length * 2 ||
      Number(round) <= 0
    ) {
      return "";
    }

    switch (gamesLength) {
      case 8:
        return "Sweet 16";
      case 4:
        return "Elite Eight";
      case 2:
        return "Final Four";
      case 1:
        return "Championship";
    }
  };

  const [grids, setNewGrids] = useState<
    { [key: string]: { [key: string]: IBracketGame[] } } | undefined
  >(undefined);

  const [playInRound, setPlayInRound] = useState<
    { [key: string]: IBracketGame[] } | undefined
  >();

  const [visualScale, setVisualScale] = useState(0.8);

  const [hidden, setHidden] = useState<any>();
  const [isOpenNotePopup, setIsOpenNotePopup] = useState<boolean>(false);
  const [isOpenEditNotePopup, setIsOpenEditNotePopup] = useState<boolean>(false);

  const onNoteOpenPopup = (gameId: string) => {
    setIsOpenNotePopup(true);
    setSelectedGameForNote(games.find((game: IBracketGame) => game.id === gameId));
  };

  const onEditNotePopup = (gameId: string) => {
    setIsOpenNotePopup(true);
    setIsOpenEditNotePopup(true);
    setSelectedGameForNote(games.find((game: IBracketGame) => game.id === gameId));
  };

  const onCloseNotePopup = () => {
    setIsOpenNotePopup(false);
    setIsOpenEditNotePopup(false);
    setSelectedGameForNote(undefined);
  };

  const onSetNote = (note: string, isDeleteNote?: boolean) => {
    if (!selectedGameForNote) {
      return;
    }

    isDeleteNote ? selectedGameForNote.gameNote = "" : selectedGameForNote.gameNote = note;
    
    addNoteForGame(selectedGameForNote, bracket);
    onCloseNotePopup();
  };

  const getPosByIndex = (index: number, games: IBracketGame[]) => {
    const gameDepend = games.map((v) => ({
      index: v.index,
      awayDependsUpon: v.awayDependsUpon,
      homeDependsUpon: v.homeDependsUpon,
    }));

    const thisIndex = index + 1;
    const foundGameIndex = gameDepend.find(
      (item) =>
        item.awayDependsUpon &&
        item.homeDependsUpon &&
        Math.round((item.awayDependsUpon + item.homeDependsUpon) / 2) / 2 ===
          thisIndex
    )?.index;

    return games.find((item) => item.index === foundGameIndex);
  };

  useEffect(() => {
    const grids = groupBy(games, "gridNum");
    const newGrids = {};

    keys(grids).forEach(
      (key: string) => (newGrids[key] = groupBy(grids[key], "round"))
    );

    if (
      newGrids &&
      newGrids[1] &&
      newGrids[1][1]?.length < newGrids[1][2]?.length &&
      games.length > 7
    ) {
      setPlayInRound({
        1: setInPlayGames(newGrids[1][1], newGrids[1][2]),
      });
      delete newGrids[1][1];
    } else {
      setPlayInRound(undefined);
    }

    keys(newGrids).forEach((gridKey) =>
      Object.keys(newGrids[gridKey])
        .sort((a, b) => +a - +b)
        .forEach((key, i, arr) => {
          const thisRound = newGrids[gridKey][key].filter(
            (v: IBracketGame) => !v.hidden
          );
          const nextRound = newGrids[gridKey][arr[i + 1]];

          if (
            nextRound &&
            nextRound.length > thisRound.length &&
            nextRound.length - thisRound.length !== 1
          ) {
            const games = [...thisRound].filter((v: any) => !v?.hidden);
            newGrids[gridKey][key] = [];

            [...Array(Math.round(nextRound.length / 2))].map((_, i: number) =>
              newGrids[gridKey][key].push(
                getPosByIndex(i, games) || { hidden: true }
              )
            );
          }
        })
    );

    setNewGrids(newGrids);
  }, [games]);

  useEffect(() => {
    if (playInRound && grids) {
      const hiddenConnectors = setHiddenConnectors(playInRound[1], grids[1][2]);
      setHidden(hiddenConnectors);
    }
  }, [playInRound, grids]);

  useEffect(() => {
    setVisualScale(1);
  }, [grids]);

  const setHiddenConnectors = (
    leftRound: any[],
    rightRound: any[],
    negative?: boolean
  ) => {
    if (!leftRound || !rightRound) return;

    const arr: any[] = [];

    if (games.length > 7 || negative) {
      if (leftRound.length < rightRound.length) {
        [...Array(leftRound.length)].forEach((_, i) => {
          arr.push({
            hiddenTop: leftRound[i]?.hidden,
            hiddenBottom: leftRound[i]?.hidden,
          });
        });
      } else {
        [...Array(Math.round(leftRound.length / 2))].forEach((_, i) => {
          arr.push({
            hiddenTop: leftRound[i * 2]?.hidden,
            hiddenBottom: leftRound[i * 2 + 1]?.hidden,
          });
        });
      }
    }

    return arr;
  };

  const setInPlayGames = (games: IBracketGame[], nextGames: IBracketGame[]) => {
    const arr = [...Array(nextGames.length * 2)];
    const order = [1, 3, 5, 7, 6, 4, 2];
    order.forEach((v, i) => (arr[v] = games[i]));

    return arr.map((item, ind) => ({
      ...item,
      hidden: ind === 0 || !item,
    }));
  };

  const renderGames = (gridKey: string, loosers?: boolean) => {
    if (grids) {
      const roundsList = [...new Set(keys(grids[1]).concat("1"))].sort(
        (a: string, b: string) => Number(a) - Number(b)
      );
      return keys(grids[gridKey])
        .sort((a: string, b: string) => Number(a) - Number(b))
        .map((roundKey: string, index: number, arr: string[]) =>
          (loosers ? Number(roundKey) <= 0 : Number(roundKey) > 0) &&
          grids[gridKey][roundKey].filter((item: IBracketGame) => !item.hidden)
            ?.length > 0 ? (
            <Fragment key={`${roundKey}-playInRound`}>
              {roundsList.map(
                (item: string) =>
                  gridKey !== "1" &&
                  Number(item) < Number(arr[index]) && (
                    <div
                      key={`${item}-roundHidden`}
                      className={`${styles.bracketRound} ${styles.bracketHidden}`}
                    />
                  )
              )}
              <BracketRound
                games={grids[gridKey][roundKey]}
                bracketGames={games}
                onDrop={() => {}}
                negative={
                  Number(roundKey) < 1 &&
                  (!!playInRound ||
                    grids[gridKey][arr[index + 1]]?.length === 3)
                }
                title={getRoundTitle(
                  gridKey,
                  roundKey,
                  grids[gridKey][roundKey].length
                )}
                onRemove={onRemove}
                onNoteOpenPopup={(gameId: string) => onNoteOpenPopup(gameId)}
                onEditNotePopup={(gameId: string) => onEditNotePopup(gameId)}
              />
              {Math.abs(index) < arr.length - (!loosers ? 1 : 0) ? (
                <BracketConnector
                  leftGamesNum={grids[gridKey][roundKey].length}
                  rightGamesNum={
                    grids[gridKey][arr[index + 1]]
                      ? grids[gridKey][arr[index + 1]]?.length
                      : playInRound
                      ? playInRound[1]?.length
                      : 0
                  }
                  negative={Number(roundKey) < 1}
                  displayNegative={Number(roundKey) < 1 && !!playInRound}
                  games={grids[gridKey][roundKey]}
                  hidden={
                    grids[gridKey][roundKey].some((v) => v.hidden)
                      ? setHiddenConnectors(
                          grids[gridKey][roundKey],
                          !grids[gridKey][arr[index + 1]]
                            ? playInRound![1]
                            : grids[gridKey][arr[index + 1]],
                          Number(roundKey) < 1
                        )
                      : undefined
                  }
                />
              ) : undefined}
            </Fragment>
          ) : undefined
        );
    }
    return undefined;
  };

  return (
    <div className={styles.container}>
      <TransformWrapper
        defaultScale={visualScale}
        options={{ ...TRANSFORM_WRAPPER_OPTIONS, disabled: false }}
      >
        {({ zoomIn, zoomOut }: IPinchProps) => (
          <>
            <ZoomControls zoomIn={zoomIn} zoomOut={zoomOut} />
            <TransformComponent>
              <SeedsContext.Provider
                value={{ seeds, highlightedTeam, setHighlightedTeamId }}
              >
                {grids &&
                  keys(grids).map((gridKey) => (
                    <div
                      key={`${gridKey}-grid`}
                      className={styles.bracketContainer}
                    >
                      {renderGames(gridKey, true)}
                      {gridKey === "1" &&
                        keys(playInRound)?.map((roundKey) => (
                          <Fragment key={`${roundKey}-playInRound`}>
                            <BracketRound
                              games={playInRound![roundKey]}
                              bracketGames={games}
                              onDrop={() => {}}
                              title="Play-In Games"
                              onRemove={onRemove}
                              onNoteOpenPopup={onNoteOpenPopup}
                              onEditNotePopup={onEditNotePopup}
                            />
                            <BracketConnector
                              hidden={hidden}
                              games={playInRound![roundKey]}
                              leftGamesNum={playInRound![roundKey]?.length}
                              rightGamesNum={grids[gridKey][1]?.length}
                            />
                          </Fragment>
                        ))}
                      {renderGames(gridKey)}
                    </div>
                  ))}
              </SeedsContext.Provider>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
      <NoteModal 
        game={selectedGameForNote}
        isOpen={isOpenNotePopup}
        isEdit={isOpenEditNotePopup}
        onClose={onCloseNotePopup}
        onSetNote={onSetNote}
      />
    </div>
  );
};

export default Brackets;
