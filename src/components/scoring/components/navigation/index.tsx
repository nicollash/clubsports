import React from 'react';
import { Button } from 'components/common';
import history from 'browserhistory';
import { Routes } from 'common/enums';
import styles from './styles.module.scss';

interface Props {
  eventId?: string;
}

const Navigation = ({ eventId }: Props) => (
  <p className={styles.navWrapper}>
    <a
      href="https://tourneymaster.s3.amazonaws.com/public/Quickstarts/Tourney+Master+Scoring+Quick+Start+Guide.pdf"
      target="_blank"
      rel="noopener noreferrer"
    >
      Quickstart Guide to Scoring
    </a>
    <Button
      onClick={() => {
        history.push(`${Routes.RECORD_SCORES}${eventId || ''}`);
      }}
      label="Record Scores"
      variant="contained"
      color="primary"
    />
  </p>
);

export default Navigation;
