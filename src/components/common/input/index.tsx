import React from 'react';
import { TextField as MuiTextField, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import styles from './style.module.scss';

interface ITextFieldProps {
  endAdornment?: string;
  startAdornment?: string;
  label?: string;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: string;
  value?: string | number;
  width?: string;
  minWidth?: string;
  placeholder?: string;
  onChange?: any;
  name?: string;
  disabled?: boolean;
  align?: string;
  type?: 'text' | 'number';
  error?: boolean;
  isRequired?: boolean;
  autofocus?: boolean;
  autoComplete?: string;
}

const TextField: React.FC<ITextFieldProps> = ({
  error,
  endAdornment,
  startAdornment,
  label,
  fullWidth,
  multiline,
  rows,
  value,
  onChange,
  width,
  minWidth,
  placeholder,
  name,
  disabled,
  type,
  align,
  isRequired,
  autofocus,
  autoComplete,
}) => (
  <div className={styles.container} style={{ alignItems: align || '' }}>
    {label && <span className={styles.label}>{label}</span>}
    <MuiTextField
      error={error}
      name={name}
      type={type || 'text'}
      style={{ width, minWidth }}
      placeholder={placeholder}
      fullWidth={fullWidth}
      variant='outlined'
      autoComplete={autoComplete}
      size='small'
      multiline={multiline}
      disabled={disabled}
      rows={rows}
      value={value}
      onChange={onChange}
      required={isRequired}
      autoFocus={autofocus}
      InputProps={{
        endAdornment: endAdornment && (
          <InputAdornment position='start'>
            {endAdornment === 'search' ? <SearchIcon /> : endAdornment}
          </InputAdornment>
        ),
        startAdornment: startAdornment && (
          <InputAdornment position='start'>{startAdornment}</InputAdornment>
        ),
      }}
    />
  </div>
);

export default TextField;
