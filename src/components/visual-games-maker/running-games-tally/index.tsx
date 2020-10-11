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
  TableFooter,
} from '@material-ui/core';
import { IMatchup, IMatchupTeam, ITableRunningTally } from '../helpers';

interface IProps {
  teams: IMatchupTeam[];
  showNames: boolean;
  games: IMatchup[];
}

const useStyles = makeStyles({
  tableContainer: {
    maxHeight: '428px',
    minWidth: '360px',
    overflowY: 'auto',
    overflowX: 'visible',
  },
  tableTeamCell: {
    backgroundColor: 'rgb(235, 235, 235)',
    whiteSpace: 'nowrap',
    fontSize: '12px',
  },
  tableCountCell: {
    fontWeight: 700,
    border: 0,
    fontSize: '12px',
  },
  tableCell: {
    border: 0,
    fontSize: '12px',
  },
  tableHeaderCell: {
    borderBottom: '2px solid black',
    fontSize: '12px',
  },
  tableFooterCell: {
    borderTop: '2px solid black',
    borderBottom: 0,
    position: 'sticky',
    bottom: 0,
    backgroundColor: 'white',
    fontSize: '12px',
  },
  labelWrapp: {
    background: 'linear-gradient(121deg, #073b65 38%, #0079ae)',
    padding: '8px',
    marginBottom: '8px',
    color: 'white',
    textAlign: 'center',
  },
});

const RunningTally = (props: IProps) => {
  const { teams, games, showNames } = props;
  const classes = useStyles();

  const dataForTable: ITableRunningTally[] = [];
  let totalCount = 0;
  if (teams) {
    teams.forEach(team => {
      let countAllGames = 0;
      let countHomeGames = 0;
      let countAwayGames = 0;
      games.forEach((game: IMatchup) => {
        if (game.awayTeamId === team.id) {
          countAllGames++;
          countAwayGames++;
        }
        if (game.homeTeamId === team.id) {
          countAllGames++;
          countHomeGames++;
        }
      });
      totalCount += countAllGames;
      dataForTable.push({
        teamId: team.id,
        teamName: team.name,
        homeGamesNumber: countHomeGames,
        awayGamesNumber: countAwayGames,
        allGamesNumber: countAllGames,
      } as ITableRunningTally);
    });
  }

  return (
    <div>
      <div className={classes.labelWrapp}> Running Tally of Games </div>
      <TableContainer className={classes.tableContainer} component={Paper}>
        <Table size="small" stickyHeader={true}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableHeaderCell} align="center">
                Team
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="center">
                Away
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="center">
                Home
              </TableCell>
              <TableCell className={classes.tableHeaderCell} align="center">
                Count
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataForTable.map(row => {
              const index = teams!.findIndex(o => o.id === row.teamId);
              return (
                <TableRow key={row.teamName}>
                  <TableCell className={classes.tableTeamCell} align="center">
                    {showNames ? (
                      row.teamName
                    ) : (
                        <p title={row.teamName}>{index + 1}</p>
                      )}
                  </TableCell>
                  <TableCell className={classes.tableCell} align="center">
                    {row.awayGamesNumber}
                  </TableCell>
                  <TableCell className={classes.tableCell} align="center">
                    {row.homeGamesNumber}
                  </TableCell>
                  <TableCell className={classes.tableCountCell} align="center">
                    {row.allGamesNumber}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell
                className={classes.tableFooterCell}
                align="right"
                colSpan={4}
              >
                Total: {totalCount}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </div>
  );
};

export default RunningTally;
