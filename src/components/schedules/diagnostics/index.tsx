import React, { Component, ReactText } from 'react';
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
} from '@material-ui/core';
import { orderBy } from 'lodash-es';
import { getIcon, onXLSXSave } from 'helpers';
import { ButtonColors, ButtonVariant, Icons } from 'common/enums';
import { Modal, Button, Input } from 'components/common';
import { DiagnosticTypes } from '../types';
import styles from './styles.module.scss';
import { IInputEvent } from 'common/types';

export interface IDiagnosticsInput {
  header: string[];
  body: Cell[][];
}

export interface IFilterValue {
  name: string;
  value: string;
  index: number;
}

interface Props {
  isOpen: boolean;
  tableData: IDiagnosticsInput;
  diagnosticType: DiagnosticTypes;
  filterValues: IFilterValue[];
  onClose: () => void;
}

interface State {
  sortBy: string;
  sortOrder: string;
  tableData: IDiagnosticsInput;
  filterValues: IFilterValue[];
}

type Cell = ReactText | boolean | undefined;

enum sortOrderEnum {
  asc = 1,
  desc = 2,
}

class Diagnostics extends Component<Props, State> {
  state = {
    sortOrder: sortOrderEnum[1],
    sortBy: '',
    tableData: this.props.tableData,
    filterValues: this.props.filterValues,
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.tableData !== this.props.tableData) {
      this.setState({ tableData: this.props.tableData });
    }
  }

  sortData = (sortByArg: string, sortOrderArg?: 'asc' | 'desc') => {
    const { tableData } = this.state;

    const sortBy = tableData.header.indexOf(sortByArg);

    this.setState(({ sortOrder, tableData }) => ({
      sortBy: sortByArg,
      sortOrder:
        sortOrderArg || sortOrderEnum[sortOrder] === 1
          ? sortOrderEnum[2]
          : sortOrderEnum[1],
      tableData: {
        ...tableData,
        body: orderBy(
          tableData.body,
          sortBy,
          sortOrder === 'asc' ? 'asc' : 'desc'
        ),
      },
    }));
  };

  filteringCells = (e: IInputEvent, cellText: Cell) => {
    const currentValues = this.state.filterValues.map((it: IFilterValue) =>
      it.name === cellText ? {
        name: cellText,
        value: e.target.value,
        index: it.index,
      } as IFilterValue : it
    );
    this.setState({
      filterValues: currentValues
    });
    let filteredTableData = this.props.tableData.body;
    currentValues.map((it: IFilterValue) => {
      filteredTableData = filteredTableData.filter(cell => {
        return cell[it.index]?.toString().toLowerCase().indexOf(it.value.toLowerCase()) != -1;
      })
    });

    filteredTableData.length !== 0
      ? this.setState({
          tableData: {
            header: this.state.tableData.header,
            body: filteredTableData,
          }
        })
      : this.setState({
          tableData: {
            header: this.state.tableData.header,
            body: this.props.tableData.body,
          }
        })
  };

  createTableCell = (cellText: Cell, index: number, isHeader?: boolean) => {
    const { sortBy, sortOrder } = this.state;
    return (
      <TableCell
        className={isHeader ? styles.tableHeadCell : styles.tableCell}
        key={'cell-' + index}
        align="center"
      >
        {
          cellText?.toString() && this.state.filterValues.map(it => it.name).includes(cellText?.toString())
              ? <div className={styles.cellText}>{cellText}
                  <Input
                    onChange={(event: IInputEvent) => this.filteringCells(event, cellText)}
                  />
                </div>
              : <div className={styles.cellText}>{cellText}</div>

        }

        {isHeader && (
          <TableSortLabel
            className={styles.sortButton}
            active={cellText === sortBy}
            direction={
              sortOrder === 'desc' && cellText === sortBy ? 'asc' : 'desc'
            }
            onClick={() => this.sortData(String(cellText))}
          />
        )}
      </TableCell>
    );
  };

  createTableRow = (cells: Cell[], index?: number, isHeader?: boolean) => (
    <TableRow key={index} hover={true}>
      {cells.map((cell: Cell, cellIndex: number) =>
        this.createTableCell(cell, cellIndex, isHeader)
      )}
    </TableRow>
  );

  render() {
    const { isOpen, onClose, diagnosticType } = this.props;
    const { tableData } = this.state;
    const { header, body } = tableData;

    const onSave = () => onXLSXSave(header, body, diagnosticType);

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <Paper className={styles.root}>
          <TableContainer className={styles.container}>
            <Table stickyHeader={true} aria-label="sticky table">
              <TableHead>
                {this.createTableRow(header, undefined, true)}
              </TableHead>
              <TableBody>
                {body.map((element, index) =>
                  this.createTableRow(element, index)
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <div className={styles.btnsWrapper}>
            <Button
              onClick={onSave}
              icon={getIcon(Icons.DESCRIPTION)}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              label="Save in XLSX"
            />
          </div>
          {/* <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          /> */}
        </Paper>
      </Modal>
    );
  }
}

export default Diagnostics;
