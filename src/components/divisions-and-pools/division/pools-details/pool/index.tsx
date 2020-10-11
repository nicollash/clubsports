import React from 'react';
import { useDrop } from 'react-dnd';
import { IPool, ITeam, IDivision } from 'common/models';
import { DndItems } from '../../../common';
import ItemTeam from '../../item-team';
import { sortByField } from 'helpers';
import { SortByFilesTypes } from 'common/enums';
import { getBackgroundColor } from '../helpers';
import styles from '../styles.module.scss';

interface IPoolProps {
  division: IDivision;
  pool?: Partial<IPool>;
  teams: ITeam[];
  isArrange: boolean;
  changePool: (team: ITeam, divisionId: string, poolId: string | null) => void;
  onDeletePopupOpen: (team: ITeam) => void;
  onEditPopupOpen: (team: ITeam, division: IDivision, poolName: string) => void;
  toggleChangesAreMade: any;
}

const Pool = ({
  pool,
  teams,
  division,
  isArrange,
  changePool,
  onDeletePopupOpen,
  onEditPopupOpen,
  toggleChangesAreMade,
}: IPoolProps) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DndItems.TEAM,
    drop: () => {
      toggleChangesAreMade(true);
      return {
        divisionId: division.division_id,
        poolId: pool ? pool.pool_id : null,
      };
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  const backgroundColor = getBackgroundColor(isActive, canDrop);

  return (
    <div className={styles.pool} style={{ backgroundColor }}>
      <p className={styles.poolTitle}>{pool ? pool.pool_name : 'Unassigned'}</p>
      <ul className={styles.teamList} ref={isArrange ? drop : null}>
        {sortByField(teams, SortByFilesTypes.TEAMS).map(it => (
          <ItemTeam
            team={it}
            division={division}
            poolName={pool?.pool_name}
            isArrange={isArrange}
            changePool={changePool}
            onDeletePopupOpen={onDeletePopupOpen}
            onEditPopupOpen={onEditPopupOpen}
            key={it.team_id}
          />
        ))}
      </ul>
    </div>
  );
};

export default Pool;
