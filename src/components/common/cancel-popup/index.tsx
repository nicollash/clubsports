import React from 'react';
import Button from 'components/common/buttons/button';
import styles from './styles.module.scss';
import WarningIcon from '@material-ui/icons/Warning';
import history from '../../../browserhistory';

interface IConfirmModalProps {
  onSave: any;
}
const ConfirmModal = ({ onSave }: IConfirmModalProps) => {
  const onExit = () => {
    history.goBack();
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionItemWarning}>
        <div className={styles.iconContainer}>
          <WarningIcon style={{ fill: '#FFCB00' }} />
        </div>
        <div className={styles.title}>
          Do you want to save changes before leaving?
        </div>
      </div>
      <div className={styles.buttonsGroup}>
        <div>
          <Button
            label="Exit"
            variant="text"
            color="secondary"
            onClick={onExit}
          />
          <Button
            label="Save"
            variant="contained"
            color="primary"
            onClick={onSave}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
