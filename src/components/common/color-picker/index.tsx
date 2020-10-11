import React from 'react';
import { ChromePicker } from 'react-color';
import { TextField as MuiTextField } from '@material-ui/core';
import {
  BindingAction,
  BindingCbWithOne,
} from '../../../common/models/callback';
import withSelectColor from './hocs/withSelectColor';
import styles from './styles.module.scss';

export interface Props {
  value: string;
  displayColorPicker: boolean;
  onShowColorPicker: BindingAction | BindingCbWithOne<boolean>;
  onChange: BindingAction | BindingCbWithOne<string>;
}

const ColorPicker = ({
  value,
  onChange,
  displayColorPicker,
  onShowColorPicker,
}: Props) => {
  return (
    <div className={styles.ColorPickerWrapper}>
      <div className={styles.ColorPickerContainer}>
        <div
          className={styles.ColorPickerPreview}
          style={{ backgroundColor: `#${value}` }}
        />
        <MuiTextField
          className={styles.ColorPickerText}
          fullWidth={true}
          type="text"
          name="color-picker-text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onClick={() => onShowColorPicker(true)}
        />
        {displayColorPicker && (
          <div className={styles.ColorPickerPalette}>
            <div
              className={styles.ColorPickerCover}
              onClick={() => onShowColorPicker(false)}
            />
            <ChromePicker
              color={value}
              onChange={(color: any) => onChange(color.hex)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default withSelectColor(ColorPicker);
