import React, { useState } from 'react';
import Modal from 'components/common/modal';
import { Input, Button } from 'components/common';
import styles from './styles.module.scss';
import { BindingAction, BindingCbWithOne } from 'common/models';

interface IProps {
  isOpen: boolean;
  onClose: BindingAction;
  onSave: BindingCbWithOne<string>;
  onCancel: BindingAction;
}

const SaveMapping = ({ isOpen, onClose, onSave, onCancel }: IProps) => {
  const [name, setName] = useState('');

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const onMappingSave = () => {
    onSave(name);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.sectionTitle}>Save Mapping</div>
        <Input
          fullWidth={true}
          label="Name"
          value={name}
          onChange={onNameChange}
          autofocus={true}
        />
        <div className={styles.buttonsGroup}>
          <Button
            label="Cancel"
            color="secondary"
            variant="text"
            onClick={onCancel}
          />
          <Button
            label="Save"
            color="primary"
            variant="contained"
            onClick={onMappingSave}
            disabled={!name}
          />
        </div>
      </div>
    </Modal>
  );
};

export default SaveMapping;
