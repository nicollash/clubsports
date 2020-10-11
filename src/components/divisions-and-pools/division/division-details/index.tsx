import React from 'react';
import styles from './styles.module.scss';
import { IDivision } from 'common/models';

interface IDivisionDetailProps {
  data: IDivision;
  numOfPools: number;
  numOfTeams: number;
}

const DivisionDetails = ({
  data,
  numOfPools,
  numOfTeams,
}: IDivisionDetailProps) => (
  <div className={styles.divisionDetailsContainer}>
    <div className={styles.divisionItem}>
      <span className={styles.divisionTitle}>Max Team Registration:</span>{' '}
      {data.max_num_teams || '—'}
    </div>
    <div className={styles.divisionItem}>
      <span className={styles.divisionTitle}>Teams Paid:</span> {'—'}
    </div>
    <div className={styles.divisionItem}>
      <span className={styles.divisionTitle}>Registration Fee:</span>{' '}
      {(data.entry_fee && `$${data.entry_fee}`) || '—'}
    </div>
    <div className={styles.divisionItem}>
      <span className={styles.divisionTitle}>Teams Registered:</span>{' '}
      {numOfTeams}
    </div>
    <div className={styles.divisionItem}>
      <span className={styles.divisionTitle}>Teams Tentitive:</span>{' '}
      {data.teams_tentitive || '—'}
    </div>
    <div className={styles.divisionItem}>
      <span className={styles.divisionTitle}>Number of Pools:</span>{' '}
      {numOfPools}
    </div>
  </div>
);

export default DivisionDetails;
