import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
} from 'react';
import { DateRangePicker } from 'react-date-range';
import { Paper, Button } from 'components/common';

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import {
  IDoesFilterPassParams,
  IAfterGuiAttachedParams,
} from 'ag-grid-community';

export interface DateRangeFilterProps {
  filterChangedCallback: () => void;
  column: any;
  comparator: any;
  api: any;
  initialRange: any;
  closeFilter?: () => void;
}

export default forwardRef((props: DateRangeFilterProps, ref) => {
  const { closeFilter, initialRange, filterChangedCallback } = props;

  const inputRef = useRef<DateRangePicker>(null);
  const [range, setRange] = useState({
    startDate: null,
    endDate: null,
    key: 'selection',
  });
  const [hideFilter, setHideFilter] = useState<Function>();

  useEffect(() => {
    if (initialRange) {
      setRange(initialRange);
    }
  }, [initialRange]);

  useImperativeHandle(ref, () => {
    return {
      // -- Not working for some reason
      onResetClick: onResetClick,
      getModel: () => {
        return range;
      },
      setModel: (model: any) => {
        if (model) {
          setRange({ ...range, ...model });
        }
      },
      afterGuiAttached: (params: IAfterGuiAttachedParams) => {
        setHideFilter(() => {
          return params.hidePopup;
        });
        return;
      },
      isFilterActive: () => {
        return range.startDate || range.endDate;
      },
      doesFilterPass: (params: IDoesFilterPassParams) => {
        const { startDate, endDate } = range;
        if (startDate) {
          if (
            props.comparator(startDate, params.data[props.column.colId]) < 0
          ) {
            return false;
          }
        }
        if (endDate) {
          if (props.comparator(endDate, params.data[props.column.colId]) > 0) {
            return false;
          }
        }
        return true;
      },
    };
  });

  const onChange = (item: any) => {
    setRange(item.selection);
  };

  useEffect(() => {
    // if (!range.startDate && !range.endDate)
    filterChangedCallback();
  }, [range, filterChangedCallback]);

  const onResetClick = () => {
    setRange({ ...range, startDate: null, endDate: null });
  };

  const onApplyClick = () => {
    if (hideFilter) {
      hideFilter();
    } else if (closeFilter) {
      closeFilter();
    } else {
      // A workaround for not working afterGuiAttached
      let hideFunc =
        props?.api?.menuFactory?.popupService?.popupList[0]?.hideFunc;
      if (hideFunc) {
        hideFunc();
      }
    }
  };

  return (
    <>
      <Paper>
        <DateRangePicker
          ref={inputRef}
          onChange={onChange}
          months={1}
          direction='vertical'
          scroll={{ enabled: false }}
          ranges={[range]}
        />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            label='Apply'
            color='primary'
            variant='outlined'
            onClick={onApplyClick}
          />
          <Button
            label='Reset'
            color='primary'
            variant='outlined'
            onClick={onResetClick}
          />
        </div>
      </Paper>
    </>
  );
});
