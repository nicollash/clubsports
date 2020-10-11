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

interface IProps {
  title?: string;
  isOpen: boolean;
  onClose: BindingAction;
  onSecondary: BindingAction;
  onPrimary: BindingAction;
}

export default ({ title, isOpen, onClose, onSecondary, onPrimary }: IProps) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <section className={styles.popupWrapper}>
      <CardMessage
        type={CardMessageTypes.WARNING}
        style={CARD_MESSAGE_STYLES}
        iconStyle={ICON_CARD_STYLES}
      >
        {`You will navigate to the ${title || ''} page.`}
      </CardMessage>
      <p className={styles.popupText}>
        Your changes will be saved automatically. Continue?
      </p>
      <p className={styles.btnsWrapper}>
        <Button
          label="Cancel"
          variant="text"
          color="secondary"
          onClick={onClose}
        />
        <span className={styles.exitBtnWrapper}>
          <Button
            label="Continue Without Saving"
            variant="text"
            color="secondary"
            onClick={onSecondary}
          />
        </span>
        <Button
          label="Continue"
          variant="contained"
          color="primary"
          onClick={onPrimary}
        />
      </p>
    </section>
  </Modal>
);
