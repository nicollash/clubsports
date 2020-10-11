/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { SectionDropdown } from 'components/common';
import GroupItemHeader from '../grop-item-header';
import TeamItem from '../team-item';
import { sortTeamByScored } from 'helpers';
import {
  IPool,
  ITeamWithResults,
  IDivision,
  IEventDetails,
  ISchedulesGameWithNames,
} from 'common/models';
import styles from './styles.module.scss';
import { getScoringSettings } from 'helpers/scoring';

interface Props {
  event: IEventDetails | null;
  division: IDivision;
  pool: IPool;
  teams: ITeamWithResults[];
  games: ISchedulesGameWithNames[];
  onOpenTeamDetails: (
    team: ITeamWithResults,
    division: IDivision,
    poolName: string
  ) => void;
}

const GroupItem = ({
  event,
  division,
  pool,
  teams,
  games,
  onOpenTeamDetails,
}: Props) => {
  const sortedTeams = event?.ranking_factor_pools
    ? sortTeamByScored(teams, games, event.ranking_factor_pools)
    : teams;

  const scoringSettings = getScoringSettings(event!);

  return (
    <li className={styles.groupItem}>
      <SectionDropdown isDefaultExpanded={true} headingColor={'#1C315F'}>
        <span>{pool.pool_name}</span>
        <table className={styles.groupTable}>
          <GroupItemHeader scoringSettings={scoringSettings} />
          <tbody>
            {sortedTeams.map(it => (
              <TeamItem
                team={it}
                division={division}
                poolName={pool.pool_name}
                scoringSettings={scoringSettings}
                onOpenTeamDetails={onOpenTeamDetails}
                key={it.team_id}
              />
            ))}
          </tbody>
        </table>
      </SectionDropdown>
    </li>
  );
};

export default GroupItem;
