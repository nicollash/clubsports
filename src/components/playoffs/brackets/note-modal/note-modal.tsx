import React, {useState, useEffect} from "react";
import {
    Input,
    Modal,
    Button,
    HeadingLevelTwo,
  } from "components/common";
import { getIcon } from 'helpers';
import { IInputEvent } from 'common/types';
import { IBracketGame } from 'components/playoffs/bracketGames';
import { BindingAction } from 'common/models';
import { ButtonColors, ButtonVariant, Icons } from 'common/enums';

import styles from "../styles.module.scss";

interface IProps {
  game: IBracketGame | undefined;
  isEdit: boolean;
  isOpen: boolean;
  onClose: BindingAction
  onSetNote: (note: string, isDelete?: boolean) => void;
};

const DELETE_ICON_STYLES = {
  fill: '#ff0f19',
};

const NoteModal = ({ 
  game,
  isEdit,
  isOpen, 
  onClose, 
  onSetNote, 
}: IProps) => {

  const [note, setNote] = useState<string>('');
  const [validateNote, setValidateNote] = useState<boolean>(false);

  useEffect(() => {
    if(!isEdit) {
      return;
    }
    
    if(game && game.gameNote) {
      setNote(game.gameNote);
    }
  }, [game, game?.gameNote]);

  const onChangeNote = (event: IInputEvent) => {
    const valueNote = event.target.value;
    if (valueNote.length >= 20) {
      setValidateNote(true);
      return;
    }
    setNote(valueNote);
    setValidateNote(false);
  };

  const onCloseAddModal = () => {
    onClose();
    setNote('');
    setValidateNote(false);
  };

  const onAddNote = () => {
    onSetNote(note);
    setNote('');
    setValidateNote(false);
  };

  const onSetNewNote = (deleteNote?: boolean) => {
    onSetNote(note,  deleteNote);
    onCloseAddModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={onCloseAddModal}>
      <section className={styles.section}>
        <div className={styles.titleWrapper}>
          { isEdit 
            ? <HeadingLevelTwo>Edit note for game:</HeadingLevelTwo>
            : <HeadingLevelTwo>Add note for game:</HeadingLevelTwo>
          }
        </div>
        <div className={styles.addNoteInput}>
            <Input
              label="Enter a Note"
              error={validateNote}
              value={note}
              fullWidth={true}
              autofocus={true}
              placeholder="Note"
              onChange={onChangeNote}
            />
            <span
              className={
                validateNote
                  ? `${styles.validate} ${styles.validationSpan}`
                  : `${styles.validationSpan}`
                }
            >
              Max 20 Chars
            </span>
        </div>
        <div className={styles.btnsWrapper}>
            {isEdit && (
              <div className={styles.deleteBtn}>
                <Button
                  type="dangerLink"
                  icon={getIcon(Icons.DELETE, DELETE_ICON_STYLES)}
                  label="Delete note"
                  color={ButtonColors.SECONDARY}
                  variant={ButtonVariant.TEXT}
                  onClick={() => onSetNewNote(true)}
                />
              </div>
            )}
          <div className={styles.cancelBtn}>
            <Button
              label="Cancel"
              color={ButtonColors.SECONDARY}
              variant={ButtonVariant.TEXT}
              onClick={onCloseAddModal}
            />
          </div>
          <div>
            <Button
              label="Add"
              color={ButtonColors.PRIMARY}
              variant={ButtonVariant.CONTAINED}
              onClick={onAddNote}
            />
          </div>
        </div>
      </section>
    </Modal>
  );
};

export default NoteModal;