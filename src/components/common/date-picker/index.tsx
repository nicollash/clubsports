import React from 'react';
import {
  DatePicker as InputDatePicker,
  TimePicker as InputTimePicker,
  KeyboardDatePicker,
  KeyboardTimePicker,
  MuiPickersUtilsProvider,
  DatePickerView,
  DateTimePicker,
} from '@material-ui/pickers';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import styles from './style.module.scss';
import { ParsableDate } from '@material-ui/pickers/constants/prop-types';

// const defaultWidth = 100;

interface IDatePickerProps {
  label?: string;
  value?: string | Date | null;
  type: string;
  width?: string;
  minWidth?: string;
  onChange: any;
  views?: DatePickerView[];
  dateFormat?: string;
  viewType?: 'default' | 'input';
  fullWidth?: boolean;
  disabled?: boolean;
  disableFuture?: boolean;
  isRequired?: boolean;
  initialFocusedDate?: ParsableDate;
}

const DatePicker: React.FC<IDatePickerProps> = ({
  label,
  value,
  onChange,
  type,
  width,
  minWidth,
  views,
  dateFormat,
  viewType,
  fullWidth,
  disabled,
  disableFuture,
  isRequired,
  initialFocusedDate,
}) => {
  const renderInputDatePicker = () => (
    <InputDatePicker
      autoOk={true}
      fullWidth={fullWidth}
      views={views}
      style={{ width, minWidth }}
      variant='inline'
      size='small'
      inputVariant='outlined'
      value={value}
      format={dateFormat || 'MM/dd/yyyy'}
      onChange={onChange}
      disabled={disabled}
      disableFuture={disableFuture}
      required={isRequired}
      initialFocusedDate={initialFocusedDate}
    />
  );
  const renderDatePicker = () => (
    <KeyboardDatePicker
      autoOk={true}
      fullWidth={fullWidth}
      views={views}
      style={{ width, minWidth }}
      variant='inline'
      size='small'
      inputVariant='outlined'
      value={value}
      format={dateFormat || 'MM/dd/yyyy'}
      disableFuture={disableFuture}
      onChange={onChange}
      disabled={disabled}
      required={isRequired}
      initialFocusedDate={initialFocusedDate}
    />
  );
  const renderInputTimePicker = () => (
    <InputTimePicker
      autoOk={true}
      fullWidth={fullWidth}
      style={{ width, minWidth }}
      variant='inline'
      size='small'
      inputVariant='outlined'
      placeholder='08:00 AM'
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={isRequired}
    />
  );
  const renderTimePicker = () => (
    <KeyboardTimePicker
      autoOk={true}
      fullWidth={fullWidth}
      style={{ width, minWidth }}
      variant='inline'
      size='small'
      inputVariant='outlined'
      placeholder='08:00 AM'
      mask='__:__ _M'
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={isRequired}
    />
  );

  const renderDateTimePicker = () => (
    <DateTimePicker
      autoOk={true}
      fullWidth={fullWidth}
      views={views}
      style={{ width, minWidth }}
      variant='inline'
      size='small'
      inputVariant='outlined'
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={isRequired}
    />
  );

  const chooseDatePicker = () =>
    viewType === 'input' ? renderInputDatePicker() : renderDatePicker();

  const chooseTimePicker = () =>
    viewType === 'input' ? renderInputTimePicker() : renderTimePicker();

  const renderPicker = () => {
    switch (type) {
      case 'time':
        return chooseTimePicker();
      case 'date-time':
        return renderDateTimePicker();
      default:
        return chooseDatePicker();
    }
  };

  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        {renderPicker()}
      </MuiPickersUtilsProvider>
    </div>
  );
};

export default DatePicker;
