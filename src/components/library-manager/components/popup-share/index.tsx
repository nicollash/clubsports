import React from 'react';
import { Modal, HeadingLevelTwo, Select, Button } from 'components/common';
import { IEventDetails, BindingAction, BindingCbWithOne } from 'common/models';
import { ButtonVariant, ButtonColors } from 'common/enums';
import styles from './styles.module.scss';
import { IInputEvent } from 'common/types';
import { orderBy } from 'lodash-es';

interface Props {
  activeEvent: IEventDetails | null;
  events: IEventDetails[];
  isOpen: boolean;
  onClose: BindingAction;
  onSave: BindingAction;
  onChangeActiveEvent: BindingCbWithOne<IEventDetails>;
}

const PopupShare = ({
  activeEvent,
  events,
  isOpen,
  onClose,
  onSave,
  onChangeActiveEvent,
}: Props) => {
  const selectOptions = events.map(it => ({
    label: it.event_name,
    value: it.event_id,
  }));

  const sortedSelecOptions = orderBy(selectOptions, 'label', 'asc');

  const onChange = ({ target: { value } }: IInputEvent) => {
    const currentEvent = events.find(it => it.event_id === value);

    onChangeActiveEvent(currentEvent!);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className={styles.section}>
        <div className={styles.titleWrapper}>
          <HeadingLevelTwo>Share with event</HeadingLevelTwo>
        </div>
        <div className={styles.SelectWrapper}>
          <Select
            onChange={onChange}
            value={activeEvent?.event_id || ''}
            options={sortedSelecOptions}
            label="Select event"
            width="100%"
          />
        </div>
        <p className={styles.btnsWrapper}>
          <span className={styles.btnWrapper}>
            <Button
              onClick={onClose}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              label="Cancel"
            />
          </span>
          <span className={styles.btnWrapper}>
            <Button
              onClick={onSave}
              variant={ButtonVariant.CONTAINED}
              color={ButtonColors.PRIMARY}
              label="Save"
            />
          </span>
        </p>
      </section>
    </Modal>
  );
};

export default PopupShare;
