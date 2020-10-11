/* tslint:disable: jsx-no-lambda */
import React from "react";
import Autocomplete, { RenderInputParams } from "@material-ui/lab/Autocomplete";
import { Checkbox, TextField } from "@material-ui/core";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import styles from "./styles.module.scss";
import "./styles.scss";

export type MultipleSelectionField = { label: string; value: string };

interface IProps {
  options: MultipleSelectionField[];
  placeholder?: string;
  width?: string;
  onInputChange?: (event: React.ChangeEvent<{}>, value: string) => void;
  value: string;
  label?: string;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const SearchSelect = ({
  options,
  placeholder,
  width,
  value,
  onInputChange,
  label,
}: IProps) => {
  return (
    <Autocomplete
      size="small"
      options={options}
      getOptionSelected={(option, _value) => option.value === _value.value}
      getOptionLabel={(option: any) => option.label}
      onInputChange={onInputChange}
      inputValue={value || ""}
      renderOption={(option, { selected }) => {
        return (
          <>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.label}
          </>
        );
      }}
      className={styles.autocomplete}
      style={{ width }}
      renderInput={(params: RenderInputParams) => (
        <div className={styles.container}>
          <span className={styles.label}>{label}</span>
          <TextField
            type="text"
            className={styles.input}
            {...params}
            variant="outlined"
            size="small"
            placeholder={placeholder}
            fullWidth={true}
          />
        </div>
      )}
    />
  );
};

export default SearchSelect;
