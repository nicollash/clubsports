import React from 'react';
import TeamItem from '../team-item';
import { IPool, ITeam, IDivision } from '../../../../common/models';
import styles from './styles.module.scss';
import { sortByField } from 'helpers';
import { SortByFilesTypes } from 'common/enums';

interface Props {
  pool?: IPool;
  teams: ITeam[];
  division: IDivision;
  onEditPopupOpen: (contactId: string, team: ITeam, division: IDivision, poolName: string) => void;
}

const PoolItem = ({ pool, teams, division, onEditPopupOpen }: Props) => {
  const sortedTeams = sortByField(teams, SortByFilesTypes.TEAMS);

  return (
    <li className={styles.pool}>
      <h5 className={styles.poolTitle}>
        Pool:{' '}
        {pool ? (
          <>
            {pool.pool_name} <span>(Team Count: {teams.length})</span>
          </>
        ) : (
          'Unassigned'
        )}
      </h5>
      {teams.length !== 0 && (
        <table className={styles.teamsTable}>
          <thead>
            <tr>
              <th className={styles.teamLeftAlign}>Team</th>
              <th className={styles.teamLeftAlign}>Coach Name</th>
              <th className={styles.teamActions}>Mobile # (printed on gameday reports)</th>
              <th className={styles.teamActions}>Actions</th>
              <th className={styles.teamActions}>Invite to Register</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map(it => (
              <TeamItem
                team={it}
                division={division}
                poolName={pool?.pool_name}
                onEditPopupOpen={onEditPopupOpen}
                key={it.team_id}
              />
            ))}
          </tbody>
        </table>
      )}
    </li>
  );
};

export default PoolItem;
