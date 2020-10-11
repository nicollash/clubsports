import { createMuiTheme } from '@material-ui/core';

const defaultWidth = 100;

export default () =>
  createMuiTheme({
    typography: {
      fontFamily: 'Open Sans',
      fontSize: 14,
    },
    palette: {
      primary: {
        main: '#1C315F',
      },
      secondary: {
        main: '#00A3EA',
      },
    },
    overrides: {
      MuiTextField: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          minWidth: defaultWidth,
          borderColor: '#dddedf',
          boxShadow: 'none',
          border: '1px solid #CDCFD2',
          '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
            borderColor: '#00A3EA',
          },
          '& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
            display: 'none',
          },
        },
      },
      MuiOutlinedInput: {
        root: {
          color: '#6A6A6A',
        },
      },
      MuiButton: {
        root: {
          borderRadius: '21px',
          textTransform: 'none',
        },
      },
      MuiFormControlLabel: {
        root: {
          color: '#6A6A6A',
        },
      },
      MuiCheckbox: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
          },
          '& .MuiIconButton-label': {
            position: 'relative',
            zIndex: 0,
          },
          '&:not($checked) .MuiIconButton-label:after': {
            content: '""',
            left: 4,
            top: 4,
            height: 15,
            width: 15,
            position: 'absolute',
            backgroundColor: 'white',
            zIndex: -1,
          },
        },
      },
      MuiTableCell: {
        head: {
          fontWeight: 600,
        },
      },
      MuiRadio: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
          },
          '& .MuiIconButton-label': {
            position: 'relative',
            zIndex: 0,
          },
          '&:not($checked) .MuiIconButton-label:after': {
            content: '""',
            left: 4,
            top: 4,
            height: 15,
            width: 15,
            position: 'absolute',
            backgroundColor: 'white',
            zIndex: -1,
          },
        },
      },
    },
  });
