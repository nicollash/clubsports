import React, { useState } from 'react';
import PoolItem from '../pool-item';
import { DeletePopupConfrim, SectionDropdown, Loader } from 'components/common';
import { IDivision, IPool, ITeam } from 'common/models';
import styles from './styles.module.scss';
import Button from 'components/common/buttons/button';
import { sortByField } from 'helpers';
import { SortByFilesTypes } from 'common/enums';

interface Props {
  division: IDivision;
  pools: IPool[];
  teams: ITeam[];
  loadPools: (divisionId: string) => void;
  onEditPopupOpen: (team: ITeam, division: IDivision, poolName: string) => void;
  onDeleteAllTeams: (divisionId: string) => void;
  isSectionExpand: boolean;
}

const DivisionItem = ({
  division,
  pools,
  teams,
  loadPools,
  onEditPopupOpen,
  onDeleteAllTeams,
  isSectionExpand,
}: Props) => {
  const [isDeletePopupOpen, onDeletePopup] = useState(false);

  const onDeletePopupClose = () => {
    onDeletePopup(false);
  };

  if (!division.isPoolsLoading && !division.isPoolsLoaded) {
    loadPools(division.division_id);
  }

  if (division.isPoolsLoading) {
    return <Loader />;
  }

  const teamsWithoutPool = teams.filter(
    team => team.division_id === division.division_id && !team.pool_id
  );

  const handleDeletePopup = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onDeletePopup(true);
  };

  const handleDeleteAllTeams = () => {
    onDeleteAllTeams(division.division_id);
    onDeletePopupClose();
  };

  const hasTeamsInDivision = () => {
    const { division_id } = division;
    return !!teams.filter(it => it.division_id === division_id).length;
  };

  const sortedPools = sortByField(pools, SortByFilesTypes.POOLS);

  return (
    <li className={styles.divisionItem}>
      <SectionDropdown
        type="section"
        panelDetailsType="flat"
        headingColor="#1C315F"
        expanded={isSectionExpand}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Division: {division.long_name}</span>
          <div className={styles.buttonContainer}>
            {hasTeamsInDivision() ? (
              <Button
                label="Delete All"
                variant="text"
                color="inherit"
                onClick={handleDeletePopup}
              />
            ) : null}
          </div>
        </div>
        <ul className={styles.poolList}>
          {sortedPools.map(pool => {
            const filtredTeams = teams.filter(
              it => it.pool_id === pool.pool_id
            );

            return (
              <PoolItem
                pool={pool}
                teams={filtredTeams}
                division={division}
                onEditPopupOpen={onEditPopupOpen}
                key={pool.pool_id}
              />
            );
          })}
          {teamsWithoutPool.length ? (
            <PoolItem
              teams={teamsWithoutPool}
              division={division}
              onEditPopupOpen={onEditPopupOpen}
              key={pools.length}
            />
          ) : null}
        </ul>
      </SectionDropdown>
      <DeletePopupConfrim
        type={''}
        message={'Type "All Teams" to confirm this is what you want.'}
        deleteTitle={'All Teams'}
        isOpen={isDeletePopupOpen}
        onClose={onDeletePopupClose}
        onDeleteClick={handleDeleteAllTeams}
      />
    </li>
  );
};

export default DivisionItem;
