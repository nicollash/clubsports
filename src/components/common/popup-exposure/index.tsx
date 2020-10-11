import React from 'react';
import { CardMessage, Button, Modal } from 'components/common';
import { CardMessageTypes } from 'components/common/card-message/types';
import { BindingAction } from 'common/models';
import styles from './styles.module.scss';

const CARD_MESSAGE_STYLES = {
  marginBottom: '15px',
  fontSize: '16px',
  lineHeight: '22px',
  fontWeight: '700',
};

const ICON_CARD_STYLES = {
  fill: '#FFCB00',
};

interface Props {
  isOpen: boolean;
  onClose: BindingAction;
  onExitClick: BindingAction;
  onSaveClick: BindingAction;
}

const PopupExposure = ({
  isOpen,
  onClose,
  onExitClick,
  onSaveClick,
}: Props) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <section className={styles.popupWrapper}>
      <h2 className="visually-hidden">Warning</h2>
      <CardMessage
        type={CardMessageTypes.WARNING}
        style={CARD_MESSAGE_STYLES}
        iconStyle={ICON_CARD_STYLES}
      >
        You have unsaved changes
      </CardMessage>
      <p className={styles.popupText}>Save your information before leaving?</p>
      <p className={styles.btnsWrapper}>
        <span className={styles.exitBtnWrapper}>
          <Button
            onClick={onExitClick}
            label="Exit"
            variant="text"
            color="secondary"
          />
        </span>
        <Button
          onClick={onSaveClick}
          label="Save"
          variant="contained"
          color="primary"
        />
      </p>
    </section>
  </Modal>
);

export default PopupExposure;
