import React from 'react';
import { Button } from 'components/common';
// import { BindingAction } from 'common/models';
import { ButtonVariant, ButtonColors, ButtonFormTypes } from 'common/enums';
import styles from './styles.module.scss';

interface Props {
  onSave: () => void;// BindingAction;
}

export const Navigation = ({ onSave }: Props) => (
  <div className={styles.wrapper}>
    <Button
      onClick={onSave}
      label="Save"
      variant={ButtonVariant.CONTAINED}
      color={ButtonColors.PRIMARY}
      btnType={ButtonFormTypes.SUBMIT}
    />
  </div>
);
