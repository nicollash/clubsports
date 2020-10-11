import React from 'react';
import Button from 'components/common/buttons/button';
import { BindingAction } from 'common/models';
import FabButton from 'components/common/fab-button';
import styles from './styles.module.scss';
import { ButtonVariant, ButtonColors } from 'common/enums';

interface Props {
  onSaveClick: BindingAction;
  onCancelClick: BindingAction;
}

const Navigation = ({
  onSaveClick,
  onCancelClick,
}: Props) => {
  return (
    <div className={styles.navWrapper}>
      <span className={styles.btnsWrapper}>
        <Button
          onClick={onCancelClick}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.SECONDARY}
          label="Cancel"
        />
        <Button
          onClick={onSaveClick}
          variant={ButtonVariant.CONTAINED}
          color={ButtonColors.PRIMARY}
          label="Save"
        />
        <FabButton
          onClick={onCancelClick}
          sequence={1}
          label="Cancel"
          variant="outlined"
        />
        <FabButton
          onClick={onSaveClick}
          sequence={2}
          label="Save"
          variant="contained"
        />
      </span>
    </div>
  );
};

export default Navigation;
