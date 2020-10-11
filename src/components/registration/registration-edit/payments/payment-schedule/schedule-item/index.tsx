import * as React from 'react';
import { BindingCbWithTwo, BindingAction } from 'common/models';
import { TableRow, TableCell } from '@material-ui/core';

import { Input, DatePicker, Button } from 'components/common';
import classes from './index.module.css';

export interface ScheduleItemProps {
  data: any;
  onChange: BindingCbWithTwo<string, string | number | null>;
  onDelete: BindingAction;
}

const ScheduleItem: React.SFC<ScheduleItemProps> = ({
  data,
  onChange,
  onDelete,
}: ScheduleItemProps) => {
  const onDateChange = (e: Date) => {
    const date = new Date(e.toDateString()).getTime() / 1000;
    const ret = !isNaN(Number(e)) && onChange('date', date);
    return ret;
  };

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange('amount', e.target.value);

  return (
    <TableRow className={classes.ScheduleItem}>
      <TableCell>
        <DatePicker
          fullWidth={true}
          type="date"
          value={data?.date ? new Date(data.date * 1000) : new Date()}
          onChange={onDateChange}
        />
      </TableCell>
      <TableCell>
        <Input
          fullWidth={true}
          startAdornment="%"
          type="number"
          value={data?.amount ? data.amount : ''}
          onChange={onAmountChange}
        />
      </TableCell>
      <TableCell>
        <Button
          variant="outlined"
          color="primary"
          label="Delete"
          onClick={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default ScheduleItem;
