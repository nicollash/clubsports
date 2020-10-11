﻿const trimValue = (value: object | string | number | null) => {
  if (!value) return value;
  if (typeof value === 'object') {
    const trimedObj = {};
    Object.entries(value).forEach(item => {
      trimedObj[item[0]] = trimValue(item[1]);
    });
    return trimedObj;
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return value;
  }
};

export { trimValue };
