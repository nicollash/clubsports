import React, { useState, useEffect } from 'react';
import { Checkbox, Input } from 'components/common';
import { formatTimeSlot } from 'helpers';
import ITimeSlot from 'common/models/schedule/timeSlots';
import { IInputEvent } from 'common/types';
import { IChangedTimeSlot } from '../common';
import styles from './styles.module.scss';
import { BindingCbWithOne } from 'common/models';

interface Props {
  timeSlot: ITimeSlot;
  chanedTimeSlot: IChangedTimeSlot | undefined;
  onChangeToChange: (timeSlot: IChangedTimeSlot, flag: boolean) => void;
  onChangeChangedTimeSlot: BindingCbWithOne<IChangedTimeSlot>;
}

const RowChangeTime = ({
  timeSlot,
  chanedTimeSlot,
  onChangeToChange,
  onChangeChangedTimeSlot,
}: Props) => {
  const checkBoxOption = {
    label: '',
    checked: Boolean(chanedTimeSlot),
  };

  const [newTimeValue, changeNewTimeValue] = useState<string>('');

  useEffect(() => {
    changeNewTimeValue(chanedTimeSlot ? chanedTimeSlot.newTimeSlotTime : '');
  }, [chanedTimeSlot]);

  const onChangeNewTime = ({ target }: IInputEvent) => {
    const { checked } = target;

    const formattedTimeSlotValue = timeSlot.time.slice(0, 5);

    const changedTimeSlot = {
      timeSlotTime: timeSlot.time,
      newTimeSlotTime: formattedTimeSlotValue,
    };

    onChangeToChange(changedTimeSlot, checked);
  };

  const onChangeNewTimeValue = (evt: IInputEvent) => {
    if (chanedTimeSlot) {
      const updatedChangetTimeSlot: IChangedTimeSlot = {
        ...chanedTimeSlot,
        newTimeSlotTime: evt.target.value,
      };

      onChangeChangedTimeSlot(updatedChangetTimeSlot);
    }
  };

  return (
    <tr>
      <td>{formatTimeSlot(timeSlot.time)}</td>
      <td>
        <div className={styles.checkBoxWrapper}>
          <Checkbox onChange={onChangeNewTime} options={[checkBoxOption]} />
        </div>
      </td>
      <td>
        <div className={styles.inputWrapper}>
          <Input
            onChange={onChangeNewTimeValue}
            value={newTimeValue}
            disabled={!checkBoxOption.checked}
            width="150px"
          />
        </div>
      </td>
    </tr>
  );
};

export default RowChangeTime;
