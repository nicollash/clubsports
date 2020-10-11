import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { List } from 'react-movable';
import { BindingCbWithOne } from 'common/models';
import { Checkbox as MuiCheckbox } from '@material-ui/core';
import { DndItems } from '../types';
import RequestGroupField from '../requestGroupField';
import styles from '../styles.module.scss';

interface IRequestGroupProps {
  fields: any[];
  requestedIds: number[];
  options: any;
  updateRequestedIds: BindingCbWithOne<any>;
  swapRequestedIds: BindingCbWithOne<any>;
  updateOptions: BindingCbWithOne<any>;
}

const RequestGroup = ({
  fields,
  options,
  updateRequestedIds,
  swapRequestedIds,
  updateOptions,
}: // requestedIds,
IRequestGroupProps) => {
  const [allRequired, setAllRequired] = useState(false);
  const [allRequested, setAllRequested] = useState(false);

  const [, drop] = useDrop({
    accept: DndItems.REGISTRANT_DATA_FIELD,
    drop: () => ({ name: 'requestGroup' }),
  });

  const toggleAllRequired = () => {
    if (!allRequired) {
      setAllRequested(false);
    }
    setAllRequired(!allRequired);
  };

  const toggleAllRequested = () => {
    if (!allRequested) {
      setAllRequired(false);
    }
    setAllRequested(!allRequested);
  };

  const swapFields = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => swapRequestedIds({ oldIndex, newIndex });

  const renderList = ({
    children,
    props,
    isDragged,
  }: {
    children: any;
    props: any;
    isDragged: boolean;
  }) => (
    <div
      {...props}
      style={{
        cursor: isDragged ? 'grabbing' : 'pointer',
      }}
    >
      {children}
    </div>
  );

  const renderItem = ({
    value,
    props,
    isDragged,
  }: {
    value: any;
    props: any;
    isDragged: boolean;
  }) => (
    <div
      {...props}
      style={{
        ...props.style,
        cursor: isDragged ? 'grabbing' : 'inherit',
      }}
    >
      <RequestGroupField
        data={value}
        checkedValue={options[value.data_field_id]}
        updateRequestedIds={updateRequestedIds}
        updateOptions={updateOptions}
        allRequested={allRequested}
        allRequired={allRequired}
      />
    </div>
  );

  return (
    <div ref={drop} className={styles.requestGroup}>
      <div className={styles.requestGroupHeader}>
        <div className={styles.requestGroupHeaderTitle}>Ordered List</div>
        <div className={styles.requestGroupHeaderLabel}>
          <div className={styles.leftHeaderLabel}>Required</div>
          <MuiCheckbox
            color="secondary"
            checked={allRequired}
            onChange={toggleAllRequired}
          />
        </div>
        <div className={styles.requestGroupHeaderLabel}>
          <div className={styles.rightHeaderLabel}>Requested</div>
          <MuiCheckbox
            color="secondary"
            checked={allRequested}
            onChange={toggleAllRequested}
          />
        </div>
      </div>
      <List
        values={fields}
        onChange={swapFields}
        renderList={renderList}
        renderItem={renderItem}
      />
    </div>
  );
};

export default RequestGroup;
