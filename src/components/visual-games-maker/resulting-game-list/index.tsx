import React from 'react';
import {
  TableContainer,
  TableHead,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  makeStyles,
} from '@material-ui/core';
import { IMatchup, IMatchupTeam } from '../helpers';

interface IProps {
  teams: IMatchupTeam[];
  showNames: boolean;
  games: IMatchup[];
}

const useStyles = makeStyles({
  container: {
    height: '100%',
  },
  tableContainer: {
    height: 'calc(100% - 45px)',
    maxHeight: '428px',
    overflow: 'auto',
    minWidth: '350px',
  },
  tableCell: {
    border: 0,
    whiteSpace: 'nowrap',
    fontSize: '12px',
  },
  tableHeaderCell: {
    borderBottom: '2px solid black',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  labelWrapp: {
    background: 'linear-gradient(121deg, #073b65 38%, #0079ae)',
    padding: '8px',
    marginBottom: '8px',
    color: 'white',
    textAlign: 'center',
  },
  oddTableCell: {
    border: 0,
    backgroundColor: 'rgb(235, 235, 235)',
    whiteSpace: 'nowrap',
    fontSize: '12px',
  },
  gameCell: {
    width: '24%',
    fontSize: '12px',
  },
  homeCell: {
    width: '38%',
    fontSize: '12px',
  },
  awayCell: {
    width: '38%',
    fontSize: '12px',
  },
});

const ResultingGameList = (props: IProps) => {
  const { teams, games, showNames } = props;
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.labelWrapp}> Resulting Games List </div>
      <TableContainer className={classes.tableContainer} component={Paper}>
        <Table size="small" stickyHeader={true}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableHeaderCell} align="center">
                Game #
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="center">
                Away
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="center">
                Home
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map((row, index) => {
              const awayTeamIndex = teams!.findIndex(
                o => o.id === row.awayTeamId
              );
              const homeTeamIndex = teams!.findIndex(
                o => o.id === row.homeTeamId
              );
              const awayTeamName = teams && teams[awayTeamIndex]?.name;
              const homeTeamName = teams && teams[homeTeamIndex]?.name;
              return (
                <TableRow
                  key={index}
                  className={
                    (index + 1) % 2 === 1
                      ? classes.oddTableCell
                      : classes.tableCell
                  }
                >
                  <TableCell className={classes.gameCell} align="center">
                    {index + 1}
                  </TableCell>
                  <TableCell className={classes.awayCell} align="center">
                    {showNames ? (
                      awayTeamName
                    ) : (
                        <p title={awayTeamName}>{awayTeamIndex + 1}</p>
                      )}
                  </TableCell>
                  <TableCell className={classes.homeCell} align="center">
                    {showNames ? (
                      homeTeamName
                    ) : (
                        <p title={homeTeamName}>{homeTeamIndex + 1}</p>
                      )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ResultingGameList;
