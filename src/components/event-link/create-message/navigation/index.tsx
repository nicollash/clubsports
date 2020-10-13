import React from 'react';
import styles from '../styles.module.scss';
import { Button, Paper } from "components/common";

interface INavigationProps {
  onCancelClick: () => void;
  onSave: () => void;
};

const Navigation = ({ onCancelClick, onSave }: INavigationProps) => (
  <Paper sticky={true}>
    <div className={styles.btnsWrapper}>
      <Button
        color="secondary"
        variant="text"
        onClick={onCancelClick}
        label="Cancel"
      />
      <Button
        color="primary"
        variant="contained"
        onClick={onSave}
        label="Send"
      />
    </div>
  </Paper>
);

export default Navigation;