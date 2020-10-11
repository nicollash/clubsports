import React from 'react';
import { Button } from 'components/common';
import { BindingAction } from 'common/models';
import { ButtonVariant, ButtonColors, ButtonFormTypes } from 'common/enums';
import styles from './styles.module.scss';

interface Props {
  onSaveUser?: BindingAction;
}

export const Navigation = ({ onSaveUser }: Props) => (
  <div className={styles.wrapper}>
    <Button
      onClick={onSaveUser}
      label="Save"
      variant={ButtonVariant.CONTAINED}
      color={ButtonColors.PRIMARY}
      btnType={ButtonFormTypes.SUBMIT}
    />
  </div>
);
