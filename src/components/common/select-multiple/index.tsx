/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import { ISelectOption } from 'common/models';
import styles from './style.module.scss';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      maxWidth: 300,
    },
    formControlRow: {
      flexDirection: 'row',
      alignItems: 'center',
      '& span': {
        margin: '0 15px 0 0',
      },
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
    select: {
      flexGrow: 1,
      width: 150,
    },
  })
);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
  getContentAnchorEl: null,
};

interface Props {
  options: ISelectOption[];
  label?: string;
  value: string[];
  width?: string;
  primaryValue?: string;
  isFormControlRow?: boolean;
  onChange: (values: string[] | null) => void;
}

const SelectMultiple = ({
  options,
  label,
  value,
  width,
  isFormControlRow,
  primaryValue,
  onChange,
}: Props) => {
  const classes = useStyles();

  const handleChange = ({ target }: React.ChangeEvent<{ value: unknown }>) => {
    const newValues = target.value as string[];

    if (primaryValue) {
      if (value.includes(primaryValue) && newValues.length > value.length) {
        const valuesWithoutPrimary = newValues.filter(
          it => it !== primaryValue
        );

        onChange(valuesWithoutPrimary);
      } else if (newValues.includes(primaryValue) === false) {
        onChange(newValues);
      } else {
        onChange([primaryValue]);
      }
    } else {
      onChange(newValues);
    }
  };

  const checkedLabel = options.reduce(
    (acc, it) =>
      value.includes(it.value.toString()) ? [...acc, it.label] : acc,
    [] as string[]
  );

  return (
    <div className={styles.container}>
      <FormControl
        className={`${classes.formControl} ${
          isFormControlRow ? classes.formControlRow : ''
        }`}
      >
        <span className={styles.label}>{label}</span>
        <Select
          className={classes.select}
          style={{ width }}
          value={value}
          onChange={handleChange}
          renderValue={() => checkedLabel.join(', ')}
          MenuProps={MenuProps}
          multiple
        >
          {options.map((option, idx) => (
            <MenuItem key={idx} value={option.value}>
              <Checkbox checked={value.includes(option.value.toString())} />
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default SelectMultiple;
