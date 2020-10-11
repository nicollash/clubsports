import React, { useState, useMemo } from "react";
import { TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import styles from "./styles.module.scss";
import { ISelectOption } from "common/models";

const useStyles = makeStyles(() => ({
  searchField: {
    position: "sticky",
    top: 0,
    left: 0,
    width: "100%",
    marginBottom: 8,
  },
}));

interface IProps {
  label: string;
  options: ISelectOption[];
  selectedOptions?: string[];
  onHandleSelect: any;
  onHandleUnSelect: any;
}

const SearchableList: React.FC<IProps> = (props) => {
  const {
    options,
    selectedOptions,
    onHandleUnSelect,
    onHandleSelect,
    label,
  } = props;
  const classes = useStyles();
  const [searchTxt, setSearchTxt] = useState<string>();

  const list = useMemo(() => {
    if (searchTxt) {
      return options
        .filter((option: ISelectOption) =>
          option.label.toLowerCase().includes(searchTxt.toLowerCase())
        )
        .sort((a, b) => {
          if (a.label > b.label) return 1;
          if (a.label < b.label) return -1;
          return 0;
        });
    }

    return options.sort((a, b) => {
      if (a.label > b.label) return 1;
      if (a.label < b.label) return -1;
      return 0;
    });
  }, [options, searchTxt]);

  return (
    <div>
      <span className={styles.header}>{label}</span>
      <div className={styles.container}>
        <TextField
          className={classes.searchField}
          variant="outlined"
          type="text"
          size="small"
          fullWidth={true}
          value={searchTxt}
          onChange={(e) => setSearchTxt(e.target.value)}
        />
        {list &&
          list.length > 0 &&
          list.map((option: ISelectOption, index: number) => {
            if (
              selectedOptions &&
              selectedOptions.includes(String(option.value))
            ) {
              return (
                <div
                  key={index}
                  onClick={() => onHandleUnSelect(option)}
                  className={styles.selectedOption}
                >
                  {option.label}
                </div>
              );
            }

            return (
              <div
                key={index}
                onClick={() => onHandleSelect(option)}
                className={styles.unSelectedOption}
              >
                {option.label}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default SearchableList;
