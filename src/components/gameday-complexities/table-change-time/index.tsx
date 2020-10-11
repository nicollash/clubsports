import React from 'react';
import RowChangeTime from '../row-change-time';
import { CardMessage } from 'components/common';
import { CardMessageTypes } from 'components/common/card-message/types';
import ITimeSlot from 'common/models/schedule/timeSlots';
import { IChangedTimeSlot } from '../common';
import { BindingCbWithOne } from 'common/models';
import styles from './styles.module.scss';

interface Props {
  timeSlots: ITimeSlot[];
  changedTimeSlots: IChangedTimeSlot[];
  onChangeToChange: (timeSlot: IChangedTimeSlot, flag: boolean) => void;
  onChangeChangedTimeSlot: BindingCbWithOne<IChangedTimeSlot>;
}

const TableChangeTime = ({
  timeSlots,
  changedTimeSlots,
  onChangeToChange,
  onChangeChangedTimeSlot,
}: Props) => {
  if (!timeSlots?.length) {
    return null;
  }

  const getChanedTimeSlot = (timeSlot: ITimeSlot) => {
    const changedTimeSlot = changedTimeSlots.find(
      it => it.timeSlotTime === timeSlot.time
    );

    return changedTimeSlot;
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.cardMessageWrapper}>
        <CardMessage type={CardMessageTypes.EMODJI_OBJECTS}>
          Please enter timeslots in the format: HH:MM (24 hour format)
        </CardMessage>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Existing Timeslots</th>
            <th>Timeslot Impacted</th>
            <th>Enter New Start Time</th>
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(it => (
            <RowChangeTime
              timeSlot={it}
              chanedTimeSlot={getChanedTimeSlot(it)}
              onChangeChangedTimeSlot={onChangeChangedTimeSlot}
              onChangeToChange={onChangeToChange}
              key={it.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableChangeTime;
