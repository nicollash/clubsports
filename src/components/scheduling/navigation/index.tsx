import React from 'react';
import { Link } from 'react-router-dom';
import { Paper, Button } from 'components/common';
import { getIcon } from 'helpers';
import { BindingAction } from 'common/models';
import { Routes, Icons, ButtonVariant, ButtonColors } from 'common/enums';
import styles from './styles.module.scss';

const ICON_STYLES = {
  marginRight: '5px',
};

interface Props {
  toggleLibraryPopup: BindingAction;
}

const Navigation = ({ toggleLibraryPopup }: Props) => (
  <section className={styles.paper}>
    <Paper>
      <Link className={styles.libraryBtn} to={Routes.LIBRARY_MANAGER}>
        {getIcon(Icons.GET_APP, ICON_STYLES)} Load From Library
      </Link>
      <Button
        onClick={toggleLibraryPopup}
        icon={getIcon(Icons.PUBLISH, ICON_STYLES)}
        variant={ButtonVariant.TEXT}
        color={ButtonColors.SECONDARY}
        label="Save to Library"
      />
    </Paper>
  </section>
);

export default Navigation;
