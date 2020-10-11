﻿import React, { useState } from 'react';
import { TextField as MuiTextField, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import styles from './style.module.scss';
import { BindingCbWithOne } from "common/models";

interface IEmailInputProps {
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
  isRequired?: boolean;
  autofocus?: boolean;
  onError: BindingCbWithOne<boolean>;
}

const EmailInput: React.FC<IEmailInputProps> = ({
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
  align,
  isRequired,
  autofocus,
  onError,
}) => {
  const [error, setError] = useState<boolean>(false);

  const isEmail = (email: string) => {
    return email.search(/^\S+@\S+\.\S+$/) !== -1;
  };

  const onHandleBlur = () => {
    const isError = Boolean(value && !isEmail(value.toString()));
    setError(isError);
    onError(isError);
  };

  return (
    <div className={styles.container} style={{ alignItems: align || "" }}>
      <span className={styles.label}>{label}</span>
      <MuiTextField
        onBlur={onHandleBlur}
        onFocus={() => setError(false)}
        name={name}
        error={error}
        type='text'
        helperText={error ? "Invalid email format." : null}
        style={{ width, minWidth }}
        placeholder={placeholder}
        fullWidth={fullWidth}
        variant="outlined"
        size="small"
        multiline={multiline}
        disabled={disabled}
        rows={rows}
        value={value}
        onChange={onChange}
        required={isRequired}
        autoFocus={autofocus}
        InputProps={{
          endAdornment: endAdornment && (
            <InputAdornment position="start">
              {endAdornment === 'search' ? <SearchIcon /> : endAdornment}
            </InputAdornment>
          ),
          startAdornment: startAdornment && (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ),
        }}
      />
    </div>
  )
};

export default EmailInput;
