import React from 'react';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { BindingAction } from '../../../common/models/callback';

interface Props {
  isOpen: boolean;
  onClose: BindingAction;
  children: React.ReactElement;
}

const useStyles = makeStyles(
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalWrapper: {
      backgroundColor: '#F4F4F4',
      borderRadius: '5px',
      boxShadow: '0 1px 10px 0 rgba(0,0,0,0.1)',
      outline: '0',
    },
  })
);

const ModalRoot = ({ isOpen, onClose, children }: Props) => {
  const styles = useStyles();

  return (
    <Modal
      className={styles.modal}
      onClose={onClose}
      open={isOpen}
      closeAfterTransition={false}
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      disableAutoFocus={true}
    >
      <Fade in={isOpen}>
        <div className={styles.modalWrapper}>{children}</div>
      </Fade>
    </Modal>
  );
};
export default ModalRoot;
