import React from 'react';
import {
  Radio as MuiRadio,
  FormControlLabel,
  RadioGroup,
} from '@material-ui/core';
import styles from './style.module.scss';

interface IRadioProps {
  options: string[];
  checked: string;
  formLabel?: string;
  onChange: any;
  row?: boolean;
}

const Radio: React.FC<IRadioProps> = ({
  options,
  formLabel,
  checked,
  onChange,
  row,
}) => (
    <div className={styles.container}>
      {formLabel && <span className={styles.label}>{formLabel}</span>}
      <RadioGroup aria-label="gender" name="gender1" row={row}>
        {options.map((option: string, index: number) => (
          <FormControlLabel
            key={index}
            value={option}
            control={<MuiRadio checked={option === checked} color="secondary" />}
            label={option}
            onChange={onChange}
          />
        ))}
      </RadioGroup>
    </div>
  );

export default Radio;
