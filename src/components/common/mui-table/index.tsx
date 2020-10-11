/* tslint:disable: jsx-no-lambda */
import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import styles from './styles.module.scss';

interface IProps {
  header: string[];
  fields: string[][];
}

const MuiTable = ({ header, fields }: IProps) => {
  return (
    <TableContainer component={Paper} className={styles.muiTableContainer}>
      <Table stickyHeader={true} aria-label="simple table" padding="none">
        <TableHead>
          <TableRow>
            {header.map((el, index) => (
              <TableCell component="th" scope="row" key={index}>
                <b>{el}</b>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.map((field, fieldsId) => (
            <TableRow key={fieldsId} style={{ backgroundColor: 'transparent' }}>
              {field.map((el, fieldId) => (
                <TableCell component="td" scope="row" key={fieldId}>
                  {el}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MuiTable;
