import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { BindingCbWithOne } from 'common/models';
import DefaultGroupField from '../defaultGroupField';
import { ButtonVariant, ButtonColors } from 'common/enums';
import { Button, Select } from 'components/common';
import { DndItems } from '../types';
import styles from '../styles.module.scss';

const addButton = {
  marginLeft: 'auto',
  display: 'block',
  fontSize: '14px',
};

interface IDefaultGroupProps {
  fields: any[];
  updateRequestedIds: BindingCbWithOne<any>;
  onAddNewField: () => void;
  updateOptions: BindingCbWithOne<any>;
  editField: BindingCbWithOne<any>;
}

const DefaultGroup = ({
  fields,
  updateRequestedIds,
  onAddNewField,
  updateOptions,
  editField,
}: IDefaultGroupProps) => {
  const [groupByValue, setGroupByValue] = useState('All');

  const [, drop] = useDrop({
    accept: DndItems.REGISTRANT_DATA_FIELD,
    drop: () => ({ name: 'defaultGroup' }),
  });

  const getFieldsByGroup = () => {
    const fieldsByGroup = {};
    fields.map((el: any) => {
      if (!fieldsByGroup.hasOwnProperty(el.data_group)) {
        fieldsByGroup[el.data_group] = [];
      }
      fieldsByGroup[el.data_group].push(el);
      return true;
    });
    return fieldsByGroup;
  };

  const getGroupByList = () => {
    const groupByList = new Set();
    fields.map((el: any) => {
      groupByList.add(el.data_group);
      return true;
    });
    const options: any = [];

    groupByList.forEach((el) => {
      options.push({
        label: el,
        value: el,
      });
    });
    options.push({ label: 'All', value: 'All' });

    return options;
  };

  const compare = (a: any, b: any) => {
    const fieldA = a.data_label.toUpperCase();
    const fieldB = b.data_label.toUpperCase();

    let comparison = 0;
    if (fieldA > fieldB) {
      comparison = 1;
    } else if (fieldA < fieldB) {
      comparison = -1;
    }
    return comparison;
  };

  const onChangeGroupBy = (e: any) => {
    setGroupByValue(e.target.value);
  };

  return (
    <div ref={drop} className={styles.defaultGroupWrapper}>
      <div className={styles.defaultGroupHeader}>
        <Select
          onChange={onChangeGroupBy}
          name={'Group by'}
          options={getGroupByList()}
          value={groupByValue}
          label="Group by"
        />
      </div>
      <div className={styles.defaultGroup}>
        {Object.entries(getFieldsByGroup())
          .filter((el) => groupByValue === 'All' || el[0] === groupByValue)
          .map((field: any, index: number) => (
            <div className={styles.subGroup} key={index}>
              <div className={styles.fieldGroupTitle}>{field[0] || <br />}</div>
              {field[1].sort(compare).map((el: any, index2: number) => (
                <DefaultGroupField
                  data={el}
                  updateRequestedIds={updateRequestedIds}
                  updateOptions={updateOptions}
                  editField={editField}
                  key={index2}
                />
              ))}
            </div>
          ))}
      </div>
      <Button
        onClick={onAddNewField}
        variant={ButtonVariant.TEXT}
        color={ButtonColors.SECONDARY}
        label="+ Add Custom"
        btnStyles={addButton}
      />
    </div>
  );
};

export default DefaultGroup;
