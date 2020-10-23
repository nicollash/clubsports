/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { ITeamCard } from 'common/models/schedule/teams';
import styles from './styles.module.scss';
import TeamDragCard from 'components/common/matrix-table/dnd/drag';
import { useDrop } from 'react-dnd';
import { IDropParams } from 'components/common/matrix-table/dnd/drop';
import { TableScheduleTypes } from 'common/enums';
import { getUnsatisfiedTeams, getSatisfiedTeams } from '../../helpers';
import Checkbox from 'components/common/buttons/checkbox';
import { TableSortLabel } from '@material-ui/core';
import { orderBy } from 'lodash-es';
import { IPool, IEventDetails } from 'common/models';
import { calculateTournamentDays } from 'helpers';

interface IProps {
  event: IEventDetails;
  pools: IPool[];
  tableType: TableScheduleTypes;
  teamCards: ITeamCard[];
  showHeatmap?: boolean;
  minGamesNum: number | null;
  inner?: boolean;
  onDrop: (dropParams: IDropParams) => void;
  onDrag: (id: string) => void;
}

const UnassignedList = (props: IProps) => {
  const {
    teamCards,
    onDrop,
    showHeatmap,
    tableType,
    minGamesNum,
    pools,
    inner,
    onDrag,
  } = props;
  const acceptType = 'teamdrop';

  const [unsatisfiedTeamCards, setUnsatisfiedTeamCards] = useState(teamCards);
  const [satisfiedTeamCards, setSatisfiedTeamCards] = useState<
    ITeamCard[] | undefined
  >(undefined);
  const [showAllTeams, setShowAllTeams] = useState(true);
  const [showPools, setShowPools] = useState(true);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  const sortData = (by: string) => {
    setSortBy(by);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setUnsatisfiedTeamCards(
      orderBy(
        unsatisfiedTeamCards,
        ['divisionShortName', by],
        ['asc', sortOrder === 'asc' ? 'asc' : 'desc']
      )
    );
    setSatisfiedTeamCards(
      orderBy(
        satisfiedTeamCards,
        ['divisionShortName', by],
        ['asc', sortOrder === 'asc' ? 'asc' : 'desc']
      )
    );
  };

  const onCheck = () => {
    setShowAllTeams(!showAllTeams);
  };

  const [{ isOver }, drop] = useDrop({
    accept: acceptType,
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
    drop: (item: any) => {
      onDrop({
        gameId: undefined,
        position: undefined,
        teamId: item.id,
        fieldId: undefined,
        startTime: undefined,
        originGameId: item.originGameId,
        possibleGame: item.possibleGame,
        originGameDate: item.originGameDate,
      });
    },
  });

  useEffect(() => {
    const daysNum = calculateTournamentDays(props.event).length;
    const newUnsatisfiedTeamCards = getUnsatisfiedTeams(
      teamCards,
      minGamesNum,
      daysNum
    );
    const newSatisfiedTeamCards = getSatisfiedTeams(
      teamCards,
      minGamesNum,
      daysNum
    );

    const orderedUnsatisfiedTeamCards = orderBy(
      newUnsatisfiedTeamCards,
      ['divisionShortName', sortBy],
      ['asc', sortOrder === 'asc' ? 'desc' : 'asc']
    );
    const orderedSatisfiedTeamCards = orderBy(
      newSatisfiedTeamCards,
      ['divisionShortName', sortBy],
      ['asc', sortOrder === 'asc' ? 'desc' : 'asc']
    );

    setUnsatisfiedTeamCards(orderedUnsatisfiedTeamCards);
    setSatisfiedTeamCards(orderedSatisfiedTeamCards);
  }, [teamCards, showAllTeams]);

  return (
    <div
      className={`${styles.container} ${inner ? styles.inner : ''}`}
      style={{ background: isOver ? '#fcfcfc' : '#ececec' }}
    >
      {!inner && <h3 className={styles.title}>Needs Assignment</h3>}
      <div className={styles.checkboxWrapper}>
        <Checkbox
          options={[{ label: 'All Teams', checked: showAllTeams }]}
          onChange={onCheck}
        />
        <Checkbox
          options={[{ label: 'Show Pools', checked: showPools }]}
          onChange={() => setShowPools(!showPools)}
        />
      </div>
      <div ref={drop} className={styles.dropArea}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={!showPools ? styles.collapsed : undefined}>
                Games{' '}
              </th>
              {showPools ? (
                <th className={styles.poolName}>
                  Pool
                  <TableSortLabel
                    className={styles.sortButton}
                    active={sortBy === 'poolId'}
                    direction={
                      sortOrder === 'desc' && sortBy === 'poolId'
                        ? 'asc'
                        : 'desc'
                    }
                    onClick={() => sortData('poolId')}
                  />
                </th>
              ) : null}
              <th>Team Name</th>
            </tr>
          </thead>
          <tbody className={!showPools ? styles.collapsed : undefined}>
            {unsatisfiedTeamCards.map((teamCard, ind) => (
              <tr key={`tr-${ind}`}>
                <td className={styles.gamesNum}>{teamCard.games?.length}</td>
                {showPools ? (
                  <td className={styles.poolName}>
                    {
                      pools.find(pool => teamCard.poolId === pool.pool_id)
                        ?.pool_name
                    }
                  </td>
                ) : null}
                <td>
                  <TeamDragCard
                    inList={true}
                    tableType={tableType}
                    showHeatmap={showHeatmap}
                    key={ind}
                    teamCard={teamCard}
                    type={acceptType}
                    onDrag={onDrag}
                  />
                </td>
              </tr>
            ))}
            {!!(showAllTeams && unsatisfiedTeamCards.length) && (
              <tr className={styles.emptyRow}>
                <td />
                <td>Completed Teams</td>
              </tr>
            )}
            {showAllTeams &&
              satisfiedTeamCards?.map((teamCard, ind) => (
                <tr key={`tctr-${ind}`}>
                  <td className={styles.gamesNum}>{teamCard.games?.length}</td>
                  {showPools ? (
                    <td className={styles.poolName}>
                      {
                        pools.find(pool => teamCard.poolId === pool.pool_id)
                          ?.pool_name
                      }
                    </td>
                  ) : null}
                  <td>
                    <TeamDragCard
                      inList={true}
                      tableType={tableType}
                      showHeatmap={showHeatmap}
                      key={ind}
                      teamCard={teamCard}
                      type={acceptType}
                      onDrag={onDrag}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnassignedList;
