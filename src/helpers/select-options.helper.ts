import moment from "moment";
import { DefaultSelectValues } from "common/enums";
import { ISelectOption } from "common/models";

const getSelectOptions = <T>(
  entities: T[],
  valueKey: string,
  labelKey: string
): ISelectOption[] => {
  const selectOptions = entities.map((it) => ({
    value: it[valueKey],
    label: it[labelKey],
  }));

  return selectOptions;
};

const getSelectDayOptions = (eventDays: string[]) => {
  const selectDayOptions = [
    {
      label: DefaultSelectValues.ALL,
      value: DefaultSelectValues.ALL,
    },
    ...eventDays.map((day: string) => ({
      label: moment.utc(new Date(day)).format("l"),
      value: day,
    })),
  ];

  return selectDayOptions;
};

export { getSelectDayOptions, getSelectOptions };
