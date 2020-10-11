import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TableHeader from './components/table-header';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import moment from 'moment';
import { Button } from 'components/common';
import { getComparator, stableSort } from './helpers';
import { ButtonColors, ButtonVariant } from 'common/enums';
import { OrderTypes, TableSortRowTypes } from './common';
import { ITableSortEntity } from '../../common';
import styles from './styles.module.scss';
import { BindingCbWithOne } from 'common/models';
const useStyles = makeStyles({
  tableRowEven: {
    backgroundColor: '#F7F7F7',
  },
  tableRowOdd: {
    backgroundColor: '#ffffff',
  },
  tableCell: {
    width: '25%',
    border: 0,
  },
  cellTitle: {
    width: '50%',
    color: '#00A3EA;',
  },
});

const BTN_STYLES = {
  fontSize: '15px',
};
interface Props {
  rows: ITableSortEntity[];
  onDelete: BindingCbWithOne<ITableSortEntity>;
  onShare?: (id: string) => void;
  onClone?: (id: string) => void;
}

const TableSort = ({ rows, onShare, onDelete, onClone }: Props) => {
  const classes = useStyles();
  const [order, setOrder] = React.useState<OrderTypes>(OrderTypes.ASC);
  const [orderBy, setOrderBy] = React.useState<TableSortRowTypes>(
    TableSortRowTypes.EVENT
  );

  const handleRequestSort = (property: TableSortRowTypes) => {
    const isAsc = orderBy === property && order === OrderTypes.ASC;

    setOrder(isAsc ? OrderTypes.DESC : OrderTypes.ASC);

    setOrderBy(property);
  };

  const sorteRows = stableSort(rows, getComparator(order, orderBy));

  return (
    <div className={styles.tableWrapper}>
      <TableContainer>
        <Table>
          <TableHeader
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
          />
          <TableBody>
            {sorteRows.map((row: ITableSortEntity, idx: number) => (
              <TableRow
                className={
                  idx % 2 === 0 ? classes.tableRowEven : classes.tableRowOdd
                }
                key={row.id}
                hover
              >
                <TableCell className={classes.tableCell}>{row.event}</TableCell>
                <TableCell className={classes.tableCell}>{row.name}</TableCell>
                <TableCell className={classes.tableCell}>
                  {moment(row.lastModified).format('lll')}
                </TableCell>
                <TableCell className={classes.tableCell}>
                  <p className={styles.btnsWrapper}>
                    {onShare && (
                      <Button
                        onClick={() => onShare(row.id)}
                        variant={ButtonVariant.TEXT}
                        color={ButtonColors.SECONDARY}
                        btnStyles={BTN_STYLES}
                        label="Apply to…"
                      />
                    )}
                    {onClone && (
                      <Button
                        onClick={() => onClone(row.id)}
                        variant={ButtonVariant.TEXT}
                        color={ButtonColors.SECONDARY}
                        btnStyles={BTN_STYLES}
                        label="Clone"
                      />
                    )}
                    <span className={styles.deleteBtnWrapper}>
                      <Button
                        onClick={() => onDelete(row)}
                        variant={ButtonVariant.TEXT}
                        color={ButtonColors.INHERIT}
                        btnStyles={BTN_STYLES}
                        label="Delete"
                      />
                    </span>
                  </p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TableSort;
