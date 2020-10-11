import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Paper } from 'components/common';
import { getIcon } from 'helpers';
import { ButtonColors, ButtonVariant, Routes, Icons } from 'common/enums';
import { BindingAction } from 'common/models';
import styles from '../styles.module.scss';

const ICON_STYLES = {
  marginRight: '5px',
};

interface Props {
  eventId: string;
  onAddToLibraryManager: BindingAction;
}

const Navigation = ({ eventId, onAddToLibraryManager }: Props) => (
  <Paper sticky={true}>
    <div className={styles.paperWrapper}>
      <div className={styles.loadBtnsWrapper}>
        <Link className={styles.libraryBtn} to={Routes.LIBRARY_MANAGER}>
          {getIcon(Icons.GET_APP, ICON_STYLES)} Load From Library
        </Link>
        <Button
          onClick={onAddToLibraryManager}
          icon={getIcon(Icons.PUBLISH, ICON_STYLES)}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.SECONDARY}
          label="Save to Library"
        />
      </div>
      <div className={styles.btnsWrapper}>
        <Button
          color={ButtonColors.PRIMARY}
          variant={ButtonVariant.CONTAINED}
          onClick={() => {}}
          label="+ Create Schedule Review"
        />
        <Link
          to={
            eventId ? `/event/create-message/${eventId}` : Routes.CREATE_MESSAGE
          }
        >
          <Button
            color={ButtonColors.PRIMARY}
            variant={ButtonVariant.CONTAINED}
            onClick={() => {}}
            label="+ Create Message"
          />
        </Link>
      </div>
    </div>
  </Paper>
);

export default Navigation;
