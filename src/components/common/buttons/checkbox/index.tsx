import React from 'react';
import {
  Checkbox as MuiCheckbox,
  FormControlLabel,
  FormGroup,
} from '@material-ui/core';
import styles from './style.module.scss';

interface IOption {
  label: string;
  checked: boolean;
  name?: string;
  disabled?: boolean;
}

interface ICheckboxProps {
  options: IOption[];
  formLabel?: string;
  onChange?: any;
  withoutLabel?: boolean;
}

const Checkbox: React.FC<ICheckboxProps> = ({
  options,
  formLabel,
  onChange,
  withoutLabel,
}) =>
  withoutLabel ? (
    <>
      {options.map((option: IOption, index: number) => (
        <MuiCheckbox
          key={index}
          value={option.label}
          color="secondary"
          checked={option.checked}
          onChange={onChange}
          disabled={option.disabled}
        />
      ))}
    </>
  ) : (
    <div className={styles.container}>
      {formLabel && <div className={styles.label}>{formLabel}</div>}
      <FormGroup>
        {options.map((option: IOption, index: number) => (
          <FormControlLabel
            key={index}
            control={
              <MuiCheckbox
                value={option.label}
                color="secondary"
                checked={option.checked}
                disabled={option.disabled}
              />
            }
            label={option.label}
            onChange={onChange}
            name={option.name}
          />
        ))}
      </FormGroup>
    </div>
  );

export default Checkbox;
