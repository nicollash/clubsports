/* tslint:disable: jsx-no-lambda */
import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import styles from '../styles.module.scss';
import { Select, Checkbox } from 'components/common/';
import { IField } from 'common/models/table-columns';
import { BindingAction, BindingCbWithTwo } from 'common/models';

interface IProps {
  preview: { header: string[]; row: string[] };
  fields: IField[];
  onFieldIncludeChange: BindingCbWithTwo<
    React.ChangeEvent<HTMLInputElement>,
    number
  >;
  onSelect: BindingCbWithTwo<React.ChangeEvent<HTMLInputElement>, number>;
  columnOptions: { label: string; value: string }[];
  onIncludeAllChange: BindingAction;
}

const CsvTable = ({
  preview,
  fields,
  onFieldIncludeChange,
  onSelect,
  columnOptions,
  onIncludeAllChange,
}: IProps) => {
  return (
    <TableContainer component={Paper} className={styles.tableContainer}>
      <Table stickyHeader={true} aria-label="simple table" padding="none">
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="row" style={{ width: 206 }}>
              <b>Data Header</b>
            </TableCell>
            <TableCell component="th" scope="row" style={{ width: 120 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <b>Include</b>
                <div style={{ paddingLeft: '5px' }}>
                  <Checkbox
                    options={[
                      {
                        label: '',
                        checked: fields.every(field => field.included),
                      },
                    ]}
                    onChange={onIncludeAllChange}
                    withoutLabel={true}
                  />
                </div>
              </div>
            </TableCell>
            <TableCell component="th" scope="row" style={{ width: 250 }}>
              <b>Maps To</b>
            </TableCell>
            <TableCell component="th" scope="row" style={{ width: 180 }}>
              <b>Mapping Data Type</b>
            </TableCell>
            <TableCell component="th" scope="row">
              <b>Data Preview</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {preview.header.map((col, index: number) => (
            <TableRow
              key={index}
              style={{
                backgroundColor: !fields[index]?.included
                  ? '#ececec'
                  : 'transparent',
              }}
            >
              <TableCell component="td" scope="row" style={{ width: 206 }}>
                {col}
              </TableCell>
              <TableCell
                component="td"
                scope="row"
                style={{
                  width: 120,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Checkbox
                  options={[
                    {
                      label: '',
                      checked: fields[index]?.included,
                    },
                  ]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onFieldIncludeChange(e, index);
                  }}
                  withoutLabel={true}
                />
              </TableCell>
              <TableCell component="td" scope="row" style={{ width: 250 }}>
                <div className={styles.selectWrapper} style={{ width: 220 }}>
                  <Select
                    options={columnOptions || []}
                    label=""
                    value={fields[index]?.value || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      onSelect(e, index);
                    }}
                    disabled={fields[index] && !fields[index]?.included}
                  />
                </div>
              </TableCell>
              <TableCell component="td" scope="row" style={{ width: 180 }}>
                {fields[index]?.dataType}
              </TableCell>
              <TableCell component="td" scope="row">
                {preview.row[index]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CsvTable;
