﻿import React from 'react';
import { Button, Modal } from 'components/common';
import { BindingAction, IDivision } from 'common/models';
import styles from './styles.module.scss';
import WarningIcon from '@material-ui/icons/Warning';

interface Props {
  divisions: IDivision[];
  isOpen: boolean;
  onDeleteAllPools: BindingAction;
  onAddToExisting: BindingAction;
  onClose: BindingAction;
}

const WarnPopupOnGeneratePools = ({
  divisions,
  isOpen,
  onDeleteAllPools,
  onAddToExisting,
  onClose,
}: Props) => {
  const divisionsList = divisions.map(div => div.long_name).join(', ');
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className={styles.popupWrapper}>
        <div className={styles.sectionItemWarning}>
          <div className={styles.iconContainer}>
            <WarningIcon style={{ fill: '#FFCB00' }} />
          </div>
          <p className={styles.popupText}>In the divisions {divisionsList} already exist pools.</p>
        </div>
        <p className={styles.btnsWrapper}>
          <span className={styles.exitBtnWrapper}>
            <Button
              onClick={onDeleteAllPools}
              label={"Delete All Existing Pools"}
              variant="text"
              color="secondary"
            />
          </span>
          <Button
            onClick={onAddToExisting}
            label="Add to Existing"
            variant="contained"
            color="primary"
          />
        </p>
      </section>
    </Modal>
  );
};

export default WarnPopupOnGeneratePools;
