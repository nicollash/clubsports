import React from 'react';
import { SectionDropdown, Loader } from 'components/common';
import GroupItem from '../group-item';
import styles from './styles.module.scss';
import {
  IDivision,
  IPool,
  ITeamWithResults,
  IEventDetails,
  ISchedulesGameWithNames,
} from 'common/models';

interface Props {
  event: IEventDetails | null;
  division: IDivision;
  pools: IPool[];
  teams: ITeamWithResults[];
  games: ISchedulesGameWithNames[];
  loadPools: (divisionId: string) => void;
  onOpenTeamDetails: (
    team: ITeamWithResults,
    division: IDivision,
    poolName: string
  ) => void;
  isSectionExpand: boolean;
}

const ScoringItem = ({
  division,
  pools,
  teams,
  event,
  games,
  loadPools,
  onOpenTeamDetails,
  isSectionExpand,
}: Props) => {
  if (!division.isPoolsLoading && !division.isPoolsLoaded) {
    loadPools(division.division_id);
  }

  if (division.isPoolsLoading) {
    return <Loader />;
  }

  return (
    <li>
      <SectionDropdown headingColor={'#1C315F'} expanded={isSectionExpand}>
        <span>{division.long_name}</span>
        <div>
          <ul className={styles.groupList}>
            {pools.map(pool => (
              <GroupItem
                event={event}
                division={division}
                pool={pool}
                teams={teams.filter(it => it.pool_id === pool.pool_id)}
                games={games}
                onOpenTeamDetails={onOpenTeamDetails}
                key={pool.pool_id}
              />
            ))}
          </ul>
        </div>
      </SectionDropdown>
    </li>
  );
};

export default ScoringItem;
