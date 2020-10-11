import React from 'react';
import moment from 'moment';
import { formatTimeSlot } from 'helpers';
import { ISchedulesGameWithNames } from 'common/models';
import styles from './styles.module.scss';

interface Props {
  game: ISchedulesGameWithNames;
}

const FieldItem = ({ game }: Props) => (
  <li className={styles.fieldItem}>
    <p className={styles.fieldDates}>
      <span>{game.fieldName}</span>
      <time dateTime={game.gameDate}>{moment(game.gameDate).format('L')}</time>
      <time dateTime={game.startTime}>{formatTimeSlot(game.startTime)}</time>
    </p>
    <table className={styles.fieldTable}>
      <tbody>
        <tr>
          <td className={styles.fieldTeamTitle}>{game.awayTeamName}</td>
          <td>
            <i>{game.awayTeamScore}</i>
          </td>
        </tr>
        <tr>
          <td className={styles.fieldTeamTitle}>{game.homeTeamName}</td>
          <td>
            <i>{game.homeTeamScore}</i>
          </td>
        </tr>
      </tbody>
    </table>
  </li>
);

export default FieldItem;
