import React from 'react';
import styles from './styles.module.scss';
import { BindingCbWithOne } from "common/models";
import { Checkbox } from "components/common";

interface INavigationProps {
  onCheckboxClick: BindingCbWithOne<boolean>;
  isEmptyListsIncluded: boolean;
}

const Navigation = ({
  isEmptyListsIncluded,
  onCheckboxClick,
}: INavigationProps) => {
  const onClick = () => {
    onCheckboxClick(!isEmptyListsIncluded);
  };

  return (
    <p className={styles.wrapper}>
      <Checkbox
        options={[
          {
            label: 'Include Days with Empty Schedules when creating the PDF',
            checked: isEmptyListsIncluded,
          },
        ]}
        onChange={onClick}
      />
    </p>
  );
};

export default Navigation;
