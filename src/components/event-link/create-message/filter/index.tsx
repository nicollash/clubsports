import React from 'react';
import styles from './styles.module.scss';
import MultiSelect, {
  IMultiSelectOption,
} from 'components/common/multi-select';

export interface IScheduleFilter {
  divisionsOptions: IMultiSelectOption[];
  poolsOptions: IMultiSelectOption[];
  teamsOptions: IMultiSelectOption[];
  groupsOptions: IMultiSelectOption[];
}

interface IProps {
  filterValues: IScheduleFilter;
  onChangeFilterValue: (values: IScheduleFilter) => void;
}

const ScoringFilter = (props: IProps) => {
  const { filterValues, onChangeFilterValue } = props;

  const {
    divisionsOptions,
    poolsOptions,
    teamsOptions,
    groupsOptions,
  } = filterValues;

  const onSelectUpdate = (name: string, options: IMultiSelectOption[]) => {
    onChangeFilterValue({
      ...filterValues,
      [name]: options,
    });
  };

  return (
    <div className={styles.filterWrapper}>
      <div className={styles.selectWrapper}>
        <legend className={styles.selectTitle}>Groups</legend>
        <MultiSelect
          name="groupsOptions"
          selectOptions={groupsOptions}
          onChange={onSelectUpdate}
        />
      </div>
      <div className={styles.selectWrapper}>
        <legend className={styles.selectTitle}>Divisions</legend>
        <MultiSelect
          name="divisionsOptions"
          selectOptions={divisionsOptions}
          onChange={onSelectUpdate}
        />
      </div>
      <div className={styles.selectWrapper}>
        <legend className={styles.selectTitle}>Pools</legend>
        <MultiSelect
          name="poolsOptions"
          selectOptions={poolsOptions}
          onChange={onSelectUpdate}
        />
      </div>
      <div className={styles.selectWrapper}>
        <legend className={styles.selectTitle}>Teams</legend>
        <MultiSelect
          name="teamsOptions"
          selectOptions={teamsOptions}
          onChange={onSelectUpdate}
        />
      </div>
    </div>
  );
};

export default ScoringFilter;
