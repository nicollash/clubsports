import React, { useState } from 'react';
import { Button, Modal, Input } from 'components/common';
import { BindingAction } from 'common/models';
import styles from './styles.module.scss';

export interface IOnAddGame {
  awayDependsUpon: string;
  homeDependsUpon: string;
  gridNum: number;
  isWinner: boolean;
}

interface Props {
  isOpen: boolean;
  gameIndex: number;
  onClose: BindingAction;
  onRemoveGame: () => void;
}

const RemoveGameModal = ({
  gameIndex,
  isOpen,
  onClose,
  onRemoveGame,
}: Props) => {
  const [gameNum, setGameNum] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className={styles.popupWrapper}>
        <h2 className={styles.title}>Remove Game {gameIndex}</h2>
        <div className={styles.bodyWrapper}>
          <span>Enter "Game {gameIndex}" to delete the game</span>
          <Input
            autofocus={true}
            value={gameNum}
            onChange={(e: any) => setGameNum(e.target.value)}
          />
        </div>
        <div className={styles.btnsWrapper}>
          <Button
            label="Cancel"
            variant="text"
            color="secondary"
            onClick={onClose}
          />
          <Button
            label="Remove Game"
            variant="contained"
            color="primary"
            onClick={onRemoveGame}
            disabled={gameNum !== `Game ${gameIndex}`}
          />
        </div>
      </section>
    </Modal>
  );
};

export default RemoveGameModal;
