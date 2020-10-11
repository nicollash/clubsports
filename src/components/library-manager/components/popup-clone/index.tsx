import React from 'react';
import { Modal, HeadingLevelTwo, Input, Button } from 'components/common';
import { BindingAction } from 'common/models';
import { ButtonVariant, ButtonColors } from 'common/enums';
import styles from './styles.module.scss';
import { IInputEvent } from 'common/types';

interface Props {
  isOpen: boolean;
  onClose: BindingAction;
  onSave: (newName: string) => void;
}

const PopupClone = ({ isOpen, onClose, onSave }: Props) => {
  const [newName, changeName] = React.useState<string>('');

  React.useEffect(() => {
    return () => {
      changeName('');
    };
  }, [isOpen]);

  const onChangeName = ({ target }: IInputEvent) => {
    changeName(target.value);
  };

  const onSaveCloneItem = () => {
    onSave(newName);

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className={styles.section}>
        <div className={styles.titleWrapper}>
          <HeadingLevelTwo>Clone from library</HeadingLevelTwo>
        </div>
        <div className={styles.inputWrapper}>
          <Input
            onChange={onChangeName}
            value={newName}
            label="Enter name"
            width="100%"
            autofocus
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
              onClick={onSaveCloneItem}
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

export default PopupClone;
