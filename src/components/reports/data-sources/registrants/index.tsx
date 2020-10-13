import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { DataGrid, Button } from 'components/common';
import moment from 'moment';

import { getRegistrants } from '../../../registration/registration-edit/logic/actions';
import { initialColumns } from './fields';
import { GridReadyEvent, GridApi, ColumnApi } from 'ag-grid-community';
import { dateComparator } from 'components/common/data-grid';
import DateRangeFilter from 'components/common/data-grid/filters/DateRangeFilter';
import styles from './styles.module.scss';

interface RegistrantsReportProps {
  registrants: any[];
  getRegistrants: () => void;
  gridApi?: GridApi;
  gridColumnApi?: ColumnApi;
  onGridReady: (params: GridReadyEvent) => void;
}

// TODO: Payment Date filter in the Grid does not auto-synchronizes to
// the top filter until the user presses the to filter button.
// May need to use Redux to sync all of that

const RegistrantsReport = ({
  registrants,
  getRegistrants,
  gridApi,
  gridColumnApi,
  onGridReady,
}: RegistrantsReportProps) => {
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [range, setRange] = useState({
    startDate: null,
    endDate: null,
    key: 'selection',
  });

  const dateRangeRef = useRef();

  const invokeFilterMethod = (callback: (reactFilterInstance: any) => void) => {
    gridApi?.getFilterInstance('payment_date', agGridFilterInstance => {
      const reactFilterInstance = agGridFilterInstance.getFrameworkComponentInstance!();
      callback(reactFilterInstance);
    });
  };

  const syncGridFilterToState = () => {
    invokeFilterMethod(filter => setRange(filter.getModel()));
  };

  const onDateFilterButtonClick = () => {
    syncGridFilterToState();
    toggleDateFilter();
  };

  const filterChangedCallback = () => {
    invokeFilterMethod(filter => {
      const dateRange = dateRangeRef.current;
      const filterRange = (dateRange as any).getModel();
      filter.setModel(filterRange);
      setRange(filterRange);
    });
  };

  const toggleDateFilter = () => {
    setDateFilterOpen(oldDateFilterOpen => !oldDateFilterOpen);
  };

  let dateRangeString = 'All';
  const { startDate, endDate } = range;
  if (startDate || endDate) {
    if (dateComparator(startDate, endDate) === 0) {
      dateRangeString = moment(startDate!).format('MM/DD/YYYY');
    } else {
      dateRangeString = `${
        startDate ? moment(startDate!).format('MM/DD/YYYY') : ''
      } - ${endDate ? moment(endDate!).format('MM/DD/YYYY') : ''}`;
    }
  }

  return (
    <div>
      <Button
        label={`Dates: ${dateRangeString}`}
        color='primary'
        variant='outlined'
        onClick={onDateFilterButtonClick}
      />
      {dateFilterOpen && (
        <div className={styles.dateFilter}>
          <DateRangeFilter
            ref={dateRangeRef}
            column={gridColumnApi?.getColumn('payment_date')}
            comparator={dateComparator}
            api={gridApi}
            initialRange={range}
            filterChangedCallback={filterChangedCallback}
            closeFilter={toggleDateFilter}
          />
        </div>
      )}
      <div className={styles.dataGrid}>
        <DataGrid
          defaultToolPanel={'columns'}
          height={75}
          columns={initialColumns}
          rows={registrants}
          onGridReady={onGridReady}
          getData={getRegistrants}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  registrants: state.registration.registrants,
});

const mapDispatchToProps = {
  getRegistrants: getRegistrants,
};

export default connect(mapStateToProps, mapDispatchToProps)(RegistrantsReport);
