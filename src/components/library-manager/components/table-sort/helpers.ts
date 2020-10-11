import { OrderTypes, TableSortRowTypes } from './common';
import { ITableSortEntity } from '../../common';

const descendingComparator = <T>(a: T, b: T, orderBy: TableSortRowTypes) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order: OrderTypes, orderBy: TableSortRowTypes) => {
  return order === OrderTypes.DESC
    ? (a: ITableSortEntity, b: ITableSortEntity) =>
        descendingComparator(a, b, orderBy)
    : (a: ITableSortEntity, b: ITableSortEntity) =>
        -descendingComparator(a, b, orderBy);
};

const stableSort = <T>(array: T[], comparator: (a: T, b: T) => number): T[] => {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);

    if (order !== 0) {
      return order;
    }

    return a[1] - b[1];
  });

  return stabilizedThis.map(el => el[0]);
};

export { getComparator, stableSort };
