import React from 'react';
import { Link } from 'react-router-dom';
import { Paper, Button } from 'components/common';
import FabButton from 'components/common/fab-button';
import { getIcon } from 'helpers';
import { IRegistration, BindingAction } from 'common/models';
import { ButtonVariant, ButtonColors, Routes, Icons } from 'common/enums';
import styles from '../styles.module.scss';

const ICON_STYLES = {
  marginRight: '5px',
};

interface Props {
  registration: IRegistration;
  onRegistrationEdit: BindingAction;
  onAddToLibraryManager: BindingAction;
}

const Navigation = ({
  registration,
  onRegistrationEdit,
  onAddToLibraryManager,
}: Props) => (
  <Paper sticky={true}>
    <div className={styles.mainMenu}>
      <p className={styles.loadBtnsWrapper}>
        <Link className={styles.libraryBtn} to={Routes.LIBRARY_MANAGER}>
          {getIcon(Icons.GET_APP, ICON_STYLES)} Load From Library
        </Link>
        {registration && (
          <Button
            onClick={onAddToLibraryManager}
            icon={getIcon(Icons.PUBLISH, ICON_STYLES)}
            variant={ButtonVariant.TEXT}
            color={ButtonColors.SECONDARY}
            label="Save to Library"
          />
        )}
      </p>
      <Button
        variant={ButtonVariant.CONTAINED}
        color={ButtonColors.PRIMARY}
        onClick={onRegistrationEdit}
        label={registration ? 'Edit' : '+ Add Registrations'}
      />
      <FabButton
        onClick={onRegistrationEdit}
        sequence={1}
        label={registration ? 'Edit' : '+ Add Registrations'}
        variant="contained"
      />
    </div>
  </Paper>
);

export default Navigation;
