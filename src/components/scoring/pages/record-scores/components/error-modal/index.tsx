import React from 'react';
import { Modal, HeadingLevelFour, Button } from 'components/common';
import styles from './styles.module.scss';

interface IProps {
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

export default (props: IProps) => {
  const { title, message, isOpen, onClose } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalBody}>
        <HeadingLevelFour>
          <>{title}</>
        </HeadingLevelFour>
        <div className={styles.message}>
          {message.split('\n').map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
        <div className={styles.btnsWrapper}>
          <Button
            label="Ok"
            variant="contained"
            color="primary"
            onClick={onClose}
          />
        </div>
      </div>
    </Modal>
  );
};
