﻿import { IDivision } from 'common/models';

export const getNumList = () => {
  let i = 1;
  const numList = [];
  while (i <= 10) {
    numList.push({
      value: i,
      label: i.toString(),
    });
    i++;
  }
  return numList;
};

export const getDivisionsOptions = (divisions: IDivision[]) => {
  return divisions.map((it: IDivision) => ({
    value: it.division_id,
    label: it.long_name,
    checked: false,
  }));
};
