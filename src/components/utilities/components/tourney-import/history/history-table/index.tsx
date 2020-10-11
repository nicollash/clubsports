import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import { Button } from 'components/common';
import { ButtonVariant, ButtonColors, ButtonFormTypes } from 'common/enums';
import { BindingCbWithOne, BindingCbWithTwo } from 'common/models';
import { DeleteComformBox, RerunComfirmBox } from '../confirm-box';
interface Data {
  job_id: string | number;
  created_datetime: string | number;
  IDTournament: string | number;
  name: string | number;
  num_games: string | number;
  num_locations: string | number;
  is_active_YN: string | number;
  reRun?: any;
  delete?: any;
}

interface Props {
  histories: any[];
  onDelete: BindingCbWithOne<string | number>;
  onRerun: BindingCbWithTwo<string | number, string | number>;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

interface HeadCell {
  id: keyof Data;
  numeric: boolean;
  width: number;
  label: string;
}

const headCells: HeadCell[] = [
  {
    id: 'created_datetime',
    numeric: false,
    width: 10,
    label: 'Import Date - Time',
  },
  { id: 'IDTournament', numeric: false, width: 10, label: 'Tourney ID' },
  { id: 'name', numeric: false, width: 10, label: 'Name' },
  { id: 'num_games', numeric: true, width: 10, label: 'Games Imported' },
  { id: 'num_locations', numeric: true, width: 10, label: 'Fields Imported' },
  { id: 'is_active_YN', numeric: false, width: 10, label: 'Status' },
  { id: 'reRun', numeric: false, width: 10, label: 'Re-Run' },
  { id: 'delete', numeric: false, width: 10, label: 'Delete' },
];

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (
    event: React.MouseEvent<unknown>
  ) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            style={{ width: headCell.width + '%' }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
  })
);

const EnhancedTable = ({ histories, onDelete, onRerun }: Props) => {
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('created_datetime');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [deleteBoxOpened, setDeleteBoxOpened] = React.useState(false);
  const [rerunBoxOpened, setRerunBoxOpened] = React.useState(false);
  const [jobId, setJobId] = React.useState<string | number>('');
  const [idTournament, setIdTournament] = React.useState<string | number>('');

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    event.preventDefault();
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log(event);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const deleteHandler = (job_id: string | number) => {
    setJobId(job_id);
    setDeleteBoxOpened(true);
  };

  const noDeleteHandler = () => {
    setDeleteBoxOpened(false);
  };

  const rerunHandler = (
    job_id: string | number,
    idtournament: string | number
  ) => {
    setJobId(job_id);
    setIdTournament(idtournament);
    setRerunBoxOpened(true);
  };

  const noRerunHandler = () => {
    setRerunBoxOpened(false);
  };

  const yesDeleteHandler = () => {
    onDelete(jobId);
  };

  const yesRerunHandler = () => {
    onRerun(jobId, idTournament);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, histories.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <DeleteComformBox
          opened={deleteBoxOpened}
          onNo={noDeleteHandler}
          onYes={yesDeleteHandler}
        />
        <RerunComfirmBox
          opened={rerunBoxOpened}
          onNo={noRerunHandler}
          onYes={yesRerunHandler}
        />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(histories, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((history, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;
                  let status: string;
                  if (history.is_active_YN === 1) status = 'Complete';
                  else status = 'Fail';

                  return (
                    <TableRow hover tabIndex={-1} key={index}>
                      <TableCell align="left">
                        {moment(history.created_datetime).format(
                          'MM.DD.YYYY hh:mm A'
                        )}
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {history.IDTournament}
                      </TableCell>
                      <TableCell align="left">{history.name}</TableCell>
                      <TableCell align="right">{history.num_games}</TableCell>
                      <TableCell align="right">
                        {history.num_locations}
                      </TableCell>
                      <TableCell align="left">{status}</TableCell>
                      <TableCell align="left">
                        <Button
                          label="Re-Run"
                          variant={ButtonVariant.OUTLINED}
                          color={ButtonColors.SECONDARY}
                          onClick={() =>
                            rerunHandler(history.job_id, history.IDTournament)
                          }
                          btnType={ButtonFormTypes.SUBMIT}
                        />
                      </TableCell>
                      <TableCell align="left">
                        <Button
                          label="Delete"
                          variant={ButtonVariant.OUTLINED}
                          color={ButtonColors.SECONDARY}
                          onClick={() => deleteHandler(history.job_id)}
                          btnType={ButtonFormTypes.SUBMIT}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={histories.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

export default EnhancedTable;
