import React from 'react';
import moment from 'moment';
import { getGamesStatistics } from 'helpers';
import { ISchedulesGameWithNames } from 'common/models';
import styles from './styles.module.scss';

interface Props {
  games: ISchedulesGameWithNames[];
}

const ListStatistic = ({ games }: Props) => {
  const gamesStatistics = getGamesStatistics(games);

  const lastUpd = Math.max(
    ...games.map(it =>
      it.updatedTime
        ? Number(new Date(it.updatedTime))
        : Number(new Date(it.createTime))
    )
  );

  return (
    <ul className={styles.statisticList}>
      <li className={styles.statisticItem}>
        <b>Games Complete:</b> {gamesStatistics.completedGames}/
        {gamesStatistics.totalGames}
      </li>
      <li className={styles.statisticItem}>
        <b>Last Web Publishing: </b>
        <time dateTime={new Date(lastUpd).toString()}>
          {lastUpd ? moment(lastUpd).format('LLLL') : 'No scores published'}
        </time>
      </li>
    </ul>
  );
};

export default ListStatistic;
