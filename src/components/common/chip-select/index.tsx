import React from "react";
import { Chip, Select, MenuItem, FormControl } from "@material-ui/core";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import { ISelectOption } from "common/models";
import styles from "./style.module.scss";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    width: "100%",
    border: "1px solid #cdcfd2",
    borderRadius: 4,
  },
  selector: {
    backgroundColor: "#ffffff",
    height: 46,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
    backgroundColor: "#00A3EA !important",
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
}));

interface ISelectProps {
  options: ISelectOption[];
  label?: string;
  value: string[];
  width?: string;
  onChange?: any;
  onDelete: any;
  name?: string;
  disabled?: boolean;
  align?: string;
  placeholder?: string;
  isRequired?: boolean;
  isFullWidth?: boolean;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const getStyles = (name: string, personName: string[], theme: Theme) => {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
};

const ChipSelect: React.FC<ISelectProps> = ({
  options,
  label,
  value,
  onChange,
  onDelete,
  disabled,
  align,
  placeholder,
  isFullWidth,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div
      className={styles.container}
      style={{
        alignItems: align || "",
        width: isFullWidth ? "100%" : undefined,
      }}
    >
      {label ? <span className={styles.label}>{label}</span> : null}
      <FormControl variant="outlined" className={classes.formControl}>
        <Select
          className={classes.selector}
          id="demo-mutiple-chip"
          multiple={true}
          value={value}
          disabled={disabled}
          onChange={onChange}
          placeholder={placeholder}
          renderValue={(selected) => (
            <div className={classes.chips}>
              {(selected as string[]).map((value, index) => (
                <Chip
                  key={index}
                  label={
                    options.find((option) => option.value === value)?.label
                  }
                  color="primary"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                  onDelete={() => onDelete(value)}
                  className={classes.chip}
                />
              ))}
            </div>
          )}
          MenuProps={MenuProps}
        >
          {options.map((it, index) => (
            <MenuItem
              key={index}
              value={it.value}
              style={getStyles(String(it.value), value, theme)}
            >
              {it.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ChipSelect;
