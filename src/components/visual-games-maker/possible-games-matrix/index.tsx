import React from 'react';
import uuidv4 from 'uuid/v4';
import {
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  makeStyles,
  createMuiTheme,
  ThemeProvider,
} from '@material-ui/core';
import Cell from '../cell';
import { ISelectOption } from 'common/models';
import { IMatchup, IMatchupTeam } from '../helpers';
import { sideBarsMatrixColor } from 'config/app.config';

interface IProps {
  games: IMatchup[];
  teams: IMatchupTeam[];
  poolId: string;
  pools: ISelectOption[];
  showNames: boolean;
  divisionId: string;
  divisionHex: string;
  divisionName: string;
  onChangeGames: (a: IMatchup[]) => void;
}

const useStyles = makeStyles({
  tableContainer: {
    overflow: 'hidden',
  },
  tableCell: {
    border: '1px solid black',
    backgroundColor: 'rgb(0, 130, 185)',
    width: '20px',
    color: 'white',
    font: 'calibri',
  },
  tableTextCell: {
    whiteSpace: 'nowrap',
  },
  teamTextCell: {
    border: '1px solid black',
    backgroundColor: 'rgb(235, 235, 235)',
    width: '20px',
    font: 'calibri',
  },
  labelWrapp: {
    background: 'linear-gradient(121deg, #073b65 38%, #0079ae)',
    padding: '8px',
    marginBottom: '8px',
    color: 'white',
    textAlign: 'center',
  },
  flexWrapp: {
    display: 'flex',
  },
  awayTextWrapp: {
    transform: 'rotate(-90deg)',
  },
  awayWrapp: {
    width: '40px',
    backgroundColor: sideBarsMatrixColor,
    border: '2px solid white',
    color: 'white',
    font: 'calibri',
  },
  homeWrapp: {
    border: 0,
    padding: '8px',
    backgroundColor: sideBarsMatrixColor,
    color: 'white',
    font: 'calibri',
  },
  cellsWithNames: {
    verticalAlign: 'bottom',
    border: '1px solid black',
    backgroundColor: 'rgb(235, 235, 235)',
    width: '20px',
    font: 'calibri',
  },
  innercellsWithNames: {
    width: '20px',
    transform: 'rotate(180deg)',
    textAlign: 'right',
    padding: '7px 0',
    whiteSpace: 'nowrap',
    writingMode: 'vertical-lr',
    font: 'calibri',
    color: '#1C315F',
  },
  hiddenCell: {
    display: 'none',
    visibility: 'hidden',
  },
  awayTeamCellWithNames: {
    textAlign: 'right',
    padding: '0 7px',
    border: '1px solid black',
    backgroundColor: 'rgb(235, 235, 235)',
    color: '#1C315F',
    font: 'calibri',
  },
  pool: {
    border: '2px solid white',
    height: '20px',
    backgroundColor: sideBarsMatrixColor,
    color: 'white',
    font: 'calibri',
  },
  poolName: {
    whiteSpace: 'nowrap',
    writingMode: 'vertical-lr',
    transform: 'rotate(180deg)',
  },
});

const theme = createMuiTheme({
  overrides: {
    MuiTableCell: {
      root: {
        padding: 0,
        '&:last-child': {
          paddingRight: 0,
        },
        borderBottom: 0,
      },
    },
    MuiTable: {
      root: {
        height: '100%',
        boxSizing: 'border-box',
      },
    },
  },
});

const MatrixOfPossibleGames = (props: IProps) => {
  const {
    games,
    teams,
    poolId,
    pools,
    showNames,
    divisionId,
    divisionHex,
    divisionName,
    onChangeGames,
  } = props;

  const classes = useStyles();

  const onAddGame = (item: IMatchup) => {
    item.id = uuidv4();
    onChangeGames([...games, item]);
  };

  const onDeleteGame = (item: IMatchup) => {
    const newGames = games.filter(
      game =>
        game.divisionId !== item.divisionId ||
        game.awayTeamId !== item.awayTeamId ||
        game.homeTeamId !== item.homeTeamId
    );
    onChangeGames(newGames);
  };

  let selectedPoolId = '';
  const renderPoolCell = (team: IMatchupTeam) => {
    if (team.poolId && team.poolId !== selectedPoolId && poolId === 'allPools') {
      let count = 0;
      teams.map(item => (item.poolId === team.poolId ? count++ : null));
      selectedPoolId = team.poolId;
      const label = pools.find(pool => pool.value === team.poolId)?.label;
      return (
        <TableCell className={classes.pool} rowSpan={count} align="center">
          <p className={classes.poolName}>{label}</p>
        </TableCell>
      );
    }
  };

  return (
    <div>
      <div className={classes.labelWrapp}> Matrix Of Possible Games </div>
      <ThemeProvider theme={theme}>
        <TableContainer className={classes.tableContainer} component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell />
                <TableCell />
                {poolId === 'allPools' ? <TableCell /> : null}
                <TableCell
                  className={classes.homeWrapp}
                  colSpan={teams.length + 1}
                  align="center"
                >
                  Home Team
                </TableCell>
              </TableRow>
              <TableRow>
                {poolId === 'allPools' ? <TableCell /> : null}
                <TableCell />
                <TableCell className={classes.tableCell} align="center">
                  Teams
                </TableCell>
                {teams.map((team, index) => {
                  if (!(team.poolId === poolId) && !(poolId === 'allPools')) {
                    return <></>;
                  }
                  return (
                    <TableCell
                      key={team.id}
                      className={
                        showNames ? classes.cellsWithNames : classes.tableCell
                      }
                      align="center"
                    >
                      <p
                        title={team.name}
                        className={
                          showNames
                            ? classes.innercellsWithNames
                            : classes.tableTextCell
                        }
                      >
                        {showNames ? team.name : index + 1}
                      </p>
                    </TableCell>
                  );
                })}
              </TableRow>
              {teams.map((awayTeam, index) => (
                <TableRow key={awayTeam.id}>
                  {index === 0 ? (
                    <TableCell
                      className={classes.awayWrapp}
                      rowSpan={teams.length + 1}
                      align="center"
                    >
                      <p className={classes.awayTextWrapp}>Away</p>
                    </TableCell>
                  ) : null}
                  {renderPoolCell(awayTeam)}
                  <TableCell
                    style={{
                      display:
                        poolId === awayTeam.poolId || poolId === 'allPools'
                          ? 'table-cell'
                          : 'none',
                    }}
                    className={
                      showNames
                        ? classes.awayTeamCellWithNames
                        : classes.tableCell
                    }
                    align="center"
                  >
                    <p title={awayTeam.name} className={classes.tableTextCell}>
                      {showNames ? awayTeam.name : index + 1}
                    </p>
                  </TableCell>
                  {teams.map(homeTeam => (
                    <Cell
                      key={awayTeam.id + homeTeam.id}
                      awayTeamId={awayTeam.id}
                      homeTeamId={homeTeam.id}
                      divisionId={divisionId}
                      divisionHex={divisionHex}
                      divisionName={divisionName}
                      isShow={
                        (poolId === awayTeam.poolId &&
                          poolId === homeTeam.poolId) ||
                        poolId === 'allPools'
                      }
                      isSamePool={awayTeam.poolId === homeTeam.poolId}
                      isSelected={games.some(
                        v =>
                          v.divisionId === divisionId &&
                          v.awayTeamId === awayTeam.id &&
                          v.homeTeamId === homeTeam.id
                      )}
                      onAddGame={onAddGame}
                      onDeleteGame={onDeleteGame}
                    />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ThemeProvider>
    </div>
  );
};

export default MatrixOfPossibleGames;
