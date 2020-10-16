import React, { useEffect, useState } from 'react';
import moment from 'moment';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import { ColDef, GridReadyEvent } from 'ag-grid-community';
import DateRangeFilter from './filters/DateRangeFilter';

const currencyFormatter = (params: any) => {
  try {
    return (
      '$' + params.value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    );
  } catch (err) {
    return params.value;
  }
};

function formatPhoneNumber(phoneNumberString: string) {
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    var intlCode = match[1] ? '+1 ' : '';
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
  }
  return null;
}

const dateValueFormatter = (params: any) => {
  try {
    return params.value ? moment(params.value).format('MM/DD/YYYY') : '';
  } catch (err) {
    return params.value;
  }
};

const dateTimeValueFormatter = (params: any) => {
  try {
    return params.value ? moment(params.value).format('MMM D, hh:mm A') : '';
  } catch (err) {
    return params.value;
  }
};

export const dateComparator = function (
  filterLocalDateAtMidnight: any,
  cellValue: any
) {
  if (!cellValue) return -1;

  var dateAsString = moment(cellValue).format('MM/DD/YYYY');
  if (dateAsString == null) return -1;
  var dateParts = dateAsString.split('/');
  var cellDate = new Date(
    Number(dateParts[2]),
    Number(dateParts[0]) - 1,
    Number(dateParts[1])
  );
  if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
    return 0;
  }
  if (cellDate < filterLocalDateAtMidnight) {
    return -1;
  }
  if (cellDate > filterLocalDateAtMidnight) {
    return 1;
  }
};

const columnTypes = {
  numberColumn: {
    width: 130,
    filter: 'agNumberColumnFilter',
    filterParams: {
      closeOnApply: true,
      buttons: ['apply', 'reset'],
    },
  },
  currencyColumn: {
    width: 130,
    filter: 'agNumberColumnFilter',
    filterParams: {
      closeOnApply: true,
      buttons: ['apply', 'reset'],
    },
    valueFormatter: currencyFormatter,
  },
  phoneColumn: {
    valueFormatter: function (params: any) {
      try {
        return params.value ? formatPhoneNumber(params.value) : '';
      } catch (err) {
        return params.value;
      }
    },
  },
  nonEditableColumn: { editable: false },
  dateColumn: {
    filter: 'agDateColumnFilter',
    width: 120,
    filterParams: {
      comparator: dateComparator,
      browserDatePicker: true,
      closeOnApply: true,
      buttons: ['apply', 'reset'],
    },
    valueFormatter: dateValueFormatter,
  },
  dateColumnWithDateRangeFilter: {
    width: 120,
    filter: 'dateRangeFilter',
    filterParams: {
      comparator: dateComparator,
    },
    valueFormatter: dateValueFormatter,
  },
  dateColumnWithTimeFilter: {
    width: 120,
    filter: 'dateRangeFilter',
    filterParams: {
      comparator: dateComparator,
    },
    valueFormatter: dateTimeValueFormatter,
  },
};

const defaultColDef: ColDef = {
  enableValue: true,
  enableRowGroup: true,
  sortable: true,
  resizable: true,
  filter: true,
  editable: true,
};

interface DataGridProps {
  columns: any[];
  rows: any[];
  defaultToolPanel: string;
  height: number;
  onGridReady?: (params: GridReadyEvent) => void;
  getData?: () => void;
}

const DataGrid = ({
  columns,
  rows,
  defaultToolPanel,
  height,
  onGridReady,
  getData,
}: DataGridProps) => {
  const [columnDefs, setColumnDefs] = useState([] as any[]);

  useEffect(() => {
    if (getData) {
      getData();
    }
  }, [getData]);

  useEffect(() => {
    let cols = new Set();
    for (const row of rows) {
      // TODO: Convert to reduce
      cols = new Set([...cols, ...Object.keys(row)]);
    }

    const allColumnDefs: any[] = [
      ...columns,
      ...Array.from(cols)
        .filter(fieldName => !columns.find(x => x.field === fieldName))
        .map(fieldName => {
          const col = {
            headerName: fieldName,
            field: fieldName,
          };
          return col;
        }),
    ];

    setColumnDefs(allColumnDefs);
  }, [rows, columns]);

  const onFirstDataRendered = (params: any) => {
    const allColumnIds: any[] = [];
    params.columnApi.getAllColumns().forEach(function (column: any) {
      allColumnIds.push(column.colId);
    });
    params.columnApi.autoSizeColumns(allColumnIds);
  };

  return (
    <div
      className='ag-theme-alpine'
      style={{
        height: `${height}vh`,
        width: '100%',
      }}
    >
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rows}
        defaultColDef={defaultColDef}
        columnTypes={columnTypes}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        frameworkComponents={{ dateRangeFilter: DateRangeFilter }}
        sideBar={{
          toolPanels: ['columns', 'filters'],
          defaultToolPanel,
        }}
      />
    </div>
  );
};

export default DataGrid;
