import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Paper } from 'components/common';
import { getIcon } from 'helpers';
import { ButtonColors, ButtonVariant, Icons, Routes } from 'common/enums';
import { BindingAction } from 'common/models';
import FabButton from 'components/common/fab-button';
import styles from '../styles.module.scss';

const ICON_STYLES = {
  marginRight: '5px',
};

interface Props {
  isEventId: boolean;
  onCsvLoaderBtn: BindingAction;
  onDataLoaderBtn: BindingAction;
  onCancelClick: BindingAction;
  onAddToLibraryManager: BindingAction;
  onSave: BindingAction;
}

const Navigation = ({
  isEventId,
  onCsvLoaderBtn,
  onDataLoaderBtn,
  onCancelClick,
  onAddToLibraryManager,
  onSave,
}: Props) => (
  <Paper sticky={true}>
    <div className={styles.paperWrapper}>
      <div className={styles.loadBtnsWrapper}>
        {isEventId && (
          <Button
            onClick={onAddToLibraryManager}
            icon={getIcon(Icons.PUBLISH, ICON_STYLES)}
            variant={ButtonVariant.TEXT}
            color={ButtonColors.SECONDARY}
            label="Save to Library"
          />
        )}
        {!isEventId && (
          <>
            <Link className={styles.libraryBtn} to={Routes.LIBRARY_MANAGER}>
              {getIcon(Icons.GET_APP, ICON_STYLES)} Load From Library
            </Link>
            <Button
              onClick={onCsvLoaderBtn}
              color={ButtonColors.SECONDARY}
              variant={ButtonVariant.TEXT}
              label="Import from CSV"
            />
          </>
        )}
        <Button
          onClick={onDataLoaderBtn}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.SECONDARY}
          label="Import CSV of All Divisions/Pools/Teams"
        />
      </div>
      <div className={styles.btnsWrapper}>
        <Button
          color={ButtonColors.SECONDARY}
          variant={ButtonVariant.TEXT}
          onClick={onCancelClick}
          label="Cancel"
        />
        <Button
          color={ButtonColors.PRIMARY}
          variant={ButtonVariant.CONTAINED}
          onClick={onSave}
          label="Save"
        />
        <FabButton
          onClick={onCancelClick}
          sequence={1}
          label="Cancel"
          variant="outlined"
        />
        <FabButton
          onClick={onSave}
          sequence={2}
          label="Save"
          variant="contained"
        />
      </div>
    </div>
  </Paper>
);

export default Navigation;
