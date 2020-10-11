import React, { useState } from 'react';
import {
  TableCell,
  createMuiTheme,
  ThemeProvider,
  makeStyles,
} from '@material-ui/core';
import { IMatchup } from '../helpers';
import {
  selectedIconMatrixColor,
  blockedCellsMatrixColor,
} from 'config/app.config';

interface IProps {
  homeTeamId: string;
  awayTeamId: string;
  divisionId: string;
  divisionHex: string;
  divisionName: string;
  onAddGame: (a: IMatchup) => void;
  onDeleteGame: (a: IMatchup) => void;
  isShow: boolean;
  isSamePool: boolean;
  isSelected: boolean;
}

const theme = createMuiTheme({
  overrides: {
    MuiTableCell: {
      root: {
        borderBottom: '1px solid black',
        padding: 0,
      },
    },
  },
});

const useStyles = makeStyles({
  blockedCell: {
    border: '1px solid black',
    backgroundColor: 'black',
  },
  selectedCell: {
    border: '1px solid black',
    backgroundColor: selectedIconMatrixColor,
  },
  availableCell: {
    border: '1px solid black',
    backgroundColor: 'lightgrey',
  },
  hiddenCell: {
    display: 'none',
    visibility: 'hidden',
  },
  undesirableCell: {
    border: '1px dashed black',
    backgroundColor: blockedCellsMatrixColor,
  },
});

const Cell = (props: IProps) => {
  const { homeTeamId, awayTeamId, divisionId, divisionHex, divisionName, isShow, isSamePool, isSelected, onAddGame, onDeleteGame } = props;
  const [isActive, setActive] = useState(isSelected);
  let isDisabled = false;

  const classes = useStyles();

  if (homeTeamId === awayTeamId) {
    isDisabled = !isDisabled;
  }

  const onCellClick = () => {
    if (isDisabled) {
      return;
    }
    const item = {
      homeTeamId,
      awayTeamId,
      divisionId,
      divisionHex,
      divisionName,
    } as IMatchup;
    setActive(!isActive);
    if (isActive) {
      onDeleteGame(item);
      return;
    }
    onAddGame(item);
  };

  const getClass = () => {
    if (!isShow) {
      return classes.hiddenCell;
    }
    if (isDisabled) {
      return classes.blockedCell;
    }
    if (isActive) {
      return classes.selectedCell;
    }
    if (!isSamePool) {
      return classes.undesirableCell;
    }
    return classes.availableCell;
  };

  return (
    <ThemeProvider theme={theme}>
      <TableCell className={getClass()} align="center" onClick={onCellClick} />
    </ThemeProvider>
  );
};

export default Cell;
