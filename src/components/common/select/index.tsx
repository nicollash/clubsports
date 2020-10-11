import React from "react";
import { TextField, MenuItem } from "@material-ui/core";
import { ISelectOption } from "common/models";
import styles from "./style.module.scss";

interface ISelectProps {
  options: ISelectOption[];
  label?: string;
  value: string;
  width?: string;
  onChange?: any;
  name?: string;
  disabled?: boolean;
  align?: string;
  placeholder?: string;
  isRequired?: boolean;
  isFullWith?: boolean;
}

const Select: React.FC<ISelectProps> = ({
  options,
  label,
  value,
  onChange,
  width,
  name,
  disabled,
  align,
  placeholder,
  isRequired,
  isFullWith,
}) => {
  if (!options || options.length === 0) {
    return (
      <div
        className={styles.container}
        style={{
          alignItems: align || "",
          width: isFullWith ? "100%" : undefined,
        }}
      >
        {label ? <span className={styles.label}>{label}</span> : null}
        {!value ? (
          <span
            className={styles.placeholder}
            style={label?.length ? { top: 45 } : {}}
          >
            {placeholder}
          </span>
        ) : null}
        <TextField
          style={{ width }}
          variant="outlined"
          size="small"
          select={true}
          value={value}
          onChange={onChange}
          fullWidth={true}
          name={name}
          disabled={disabled}
          required={isRequired}
          SelectProps={{
            native: Boolean(isRequired),
          }}
        >
          <MenuItem value={""} disabled={true}>
            {`No ${label} Currently Exist`}
          </MenuItem>
        </TextField>
      </div>
    );
  }

  return (
    <div
      className={styles.container}
      style={{
        alignItems: align || "",
        width: isFullWith ? "100%" : undefined,
      }}
    >
      {label ? <span className={styles.label}>{label}</span> : null}
      {!value ? (
        <span
          className={styles.placeholder}
          style={label?.length ? { top: 45 } : {}}
        >
          {placeholder}
        </span>
      ) : null}
      <TextField
        style={{ width }}
        variant="outlined"
        size="small"
        select={true}
        value={value}
        onChange={onChange}
        fullWidth={true}
        name={name}
        disabled={disabled}
        required={isRequired}
        SelectProps={{
          native: Boolean(isRequired),
        }}
      >
        {isRequired ? (
          <>
            <option />
            {options.map((option: ISelectOption, index: number) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </>
        ) : (
          options.map((option: ISelectOption, index: number) => (
            <MenuItem key={index} value={option.value}>
              {option.label}
            </MenuItem>
          ))
        )}
      </TextField>
    </div>
  );
};

export default Select;
