import React, { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomControls } from "components/common";
import { IBracketGame, IBracketSeed } from "../bracketGames";
import { IBracket, IDivision, IPinchProps } from "common/models";
import NoteModal from "./note-modal/note-modal";

import styles from "./styles.module.scss";
import NewBracketGameSlot from "./new-game-slot";
import { IScheduleFacility } from 'common/models/schedule/facilities';

const TRANSFORM_WRAPPER_OPTIONS = {
  minScale: 0.2,
  limitToWrapper: false,
  limitToBounds: false,
  centerContent: false,
};

interface IProps {
  bracket: IBracket;
  seeds: IBracketSeed[];
  games: IBracketGame[];
  division?: IDivision;
  facilities?: IScheduleFacility[];
  sourcesOptions?: { label: string; value: string }[];
  isDnd: boolean;
  isUseAbbr: boolean;
  addNoteForGame: (game: IBracketGame, bracket: IBracket) => void;
  setGamesChanged: (gameid: string) => void;
  onRemove: (gameIndex: number) => void;
  onChangeScale: (scaleValue: number) => void;
  scale?: number;
}

export const SeedsContext = React.createContext<{
  seeds?: IBracketSeed[];
}>({});

const NewBrackets = (props: IProps) => {
  const {
    games,
    seeds,
    bracket,
    isDnd,
    sourcesOptions,
    division,
    isUseAbbr,
    facilities,
    addNoteForGame,
    setGamesChanged,
    onRemove,
    onChangeScale,
    scale,
  } = props;

  const [selectedGameForNote, setSelectedGameForNote] = useState<
    IBracketGame | undefined
  >();

  const [isOpenNotePopup, setIsOpenNotePopup] = useState<boolean>(false);
  const [isOpenEditNotePopup, setIsOpenEditNotePopup] = useState<boolean>(
    false
  );

  const onNoteOpenPopup = (gameId: string) => {
    setIsOpenNotePopup(true);
    setSelectedGameForNote(
      games.find((game: IBracketGame) => game.id === gameId)
    );
  };

  const onEditNotePopup = (gameId: string) => {
    setIsOpenNotePopup(true);
    setIsOpenEditNotePopup(true);
    setSelectedGameForNote(
      games.find((game: IBracketGame) => game.id === gameId)
    );
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

    isDeleteNote
      ? (selectedGameForNote.gameNote = "")
      : (selectedGameForNote.gameNote = note);

    addNoteForGame(selectedGameForNote, bracket);
    onCloseNotePopup();
  };

  return (
    <div className={styles.container}>
      <TransformWrapper
        defaultScale={scale}
        scale={scale}
        defaultPositionX={0}
        defaultPositionY={30}
        options={{ ...TRANSFORM_WRAPPER_OPTIONS, disabled: isDnd }}
        onZoomChange={onChangeScale}
        zoomIn={{ step: 5 }}
        zoomOut={{ step: 5 }}
      >
        {({ zoomIn, zoomOut }: IPinchProps) => (
          <>
            <ZoomControls zoomIn={zoomIn} zoomOut={zoomOut} />
            <TransformComponent>
              <SeedsContext.Provider value={{ seeds }}>
                {games &&
                  games.map((game: IBracketGame, index: number) => (
                    <NewBracketGameSlot
                      key={`${index}-grid`}
                      game={game}
                      scale={scale}
                      isDnd={isDnd}
                      teams={division?.teams}
                      facility={facilities?.find(facil => facil.id === game.facilitiesId)}
                      gameCount={games.length}
                      isUseAbbr={isUseAbbr}
                      sourcesOptions={sourcesOptions!}
                      onNoteOpenPopup={onNoteOpenPopup}
                      onEditNotePopup={onEditNotePopup}
                      setGamesChanged={setGamesChanged}
                      onRemove={onRemove}
                    />
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

export default NewBrackets;
