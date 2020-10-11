import React from 'react';
import { Button, CardMessage } from 'components/common';
import { CardMessageTypes } from 'components/common/card-message/types';
import { getIcon } from 'helpers';
import { ButtonColors, ButtonVariant, Icons } from 'common/enums';
import { OptimizeTypes } from '../../types';
import styles from './styles.module.scss';
import { BindingAction } from 'common/models';

const CARD_MESSAGE_FOR_UNDO = 'Press multiple times to go back more than once.';

interface IProps {
  zoomingDisabled: boolean;
  optimizeBy: OptimizeTypes;
  onUndoClick: BindingAction;
  onLockAllClick: BindingAction;
  onUnlockAllClick: BindingAction;
  historyLength?: number;
  toggleZooming: () => void;
  onOptimizeClick: (optimizeBy: OptimizeTypes) => void;
  togglePopupSaveReport: BindingAction;
}

const TableActions = (props: IProps) => {
  const {
    onUndoClick,
    onLockAllClick,
    onUnlockAllClick,
    historyLength,
    togglePopupSaveReport,
  } = props;

  return (
    <section>
      <h3 className="visually-hidden">More functions</h3>
      <form className={styles.form}>
        <div className={styles.undoBtnWrapper}>
          <Button
            onClick={onUndoClick}
            icon={getIcon(Icons.SETTINGS_BACKUP_RESTORE)}
            label="Undo"
            variant={ButtonVariant.TEXT}
            disabled={!!(historyLength && historyLength < 2)}
            color={ButtonColors.SECONDARY}
          />
          <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
            {CARD_MESSAGE_FOR_UNDO}
          </CardMessage>
        </div>
        <p className={styles.lockBtnsWrapper}>
          <Button
            onClick={onLockAllClick}
            icon={getIcon(Icons.LOCK)}
            label="Lock All"
            variant={ButtonVariant.TEXT}
            color={ButtonColors.SECONDARY}
          />
          <Button
            onClick={onUnlockAllClick}
            icon={getIcon(Icons.LOCK_OPEN)}
            label="Unlock All"
            variant={ButtonVariant.TEXT}
            color={ButtonColors.SECONDARY}
          />
          <Button
            onClick={togglePopupSaveReport}
            icon={getIcon(Icons.PRINT)}
            variant={ButtonVariant.TEXT}
            color={ButtonColors.SECONDARY}
            label="Print"
          />
        </p>
      </form>
    </section>
  );
};

export default TableActions;
