import React from "react";

import {
  MenuItem,
  TextField,
  ThemeProvider,
  createMuiTheme,
} from "@material-ui/core";

interface IProps {
  value: string | number;
  options: { label: string; value: string | number }[];
  stretch?: boolean;
  onChange: (e: any) => void;
};

const firstTheme = createMuiTheme({
  overrides: {
    MuiSelect: {
      root: {
        width: '75px',
      },
      outlined: {
        paddingRight: "2px",
      },
      iconOutlined: {
        right: 0,
      },
    },
    MuiOutlinedInput: {
      inputMarginDense: {
        paddingTop: "2px",
        paddingBottom: "2px",
        fontSize: "18px",
      },
      input: {
        padding: "10px 5px",
      },
    },
    MuiList: {
      padding: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
    MuiMenuItem: {
      root: {
        fontSize: '14px',
        paddingTop: '2px',
        paddingBottom: '2px',
      },
    },
    MuiMenu: {
      paper: {
        width: '90px',
      },
    },
  },
});

const secondTheme = createMuiTheme({
  overrides: {
    MuiSelect: {
      root: {
        width: '100%',
      },
      outlined: {
        paddingRight: "2px",
      },
      iconOutlined: {
        right: 0,
      },
    },
    MuiOutlinedInput: {
      inputMarginDense: {
        paddingTop: "2px",
        paddingBottom: "2px",
        fontSize: "18px",
      },
      input: {
        padding: "10px 5px",
      },
    },
    MuiList: {
      padding: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
    MuiMenuItem: {
      root: {
        fontSize: '14px',
        paddingTop: '2px',
        paddingBottom: '2px',
      },
    },
    MuiMenu: {
      paper: {
        width: '90px',
      },
    },
    MuiFormControl: {
      root: {
        flex: 1,
      },
    },
  },
});

const a = (e: any) => {
  e.preventDefault()
}

const SelectSeed = ({ 
  value, 
  options,
  stretch, 
  onChange, 
}: IProps) => {
  return (
    <ThemeProvider theme={stretch ? secondTheme : firstTheme}>
      <TextField
        variant="outlined"
        size="small"
        select={true}
        value={value}
        onChange={onChange}
        onFocus={a}
      >
        {options.map(
          (option: { label: string; value: string | number }, index: number) => (
            <MenuItem key={index} value={option.value}>
              {option.label}
            </MenuItem>
          )
        )}
      </TextField>
    </ThemeProvider>
  );
};

export default SelectSeed;
