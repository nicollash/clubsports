import { IField, ISelectOption } from 'common/models';

const DEFAULT_COUN_SELECT_OPTIONST = 10;

const getIncrementSelectOptions = (
  incrementCount: number
): ISelectOption[] => {
  const currentCount =
    incrementCount >= DEFAULT_COUN_SELECT_OPTIONST
      ? incrementCount + 1
      : DEFAULT_COUN_SELECT_OPTIONST;

  const FacilitiesSelectOptions = Array.from(
    new Array(currentCount),
    (_, idx) => ({
      label: `${idx + 1}`,
      value: `${idx + 1}`,
    })
  );

  return FacilitiesSelectOptions;
};

const getSortedFieldsByFacility = (fields: IField[]) => {
  const sortedFields = fields.sort((a, b) => {
    return (
      a.facilities_id.localeCompare(b.facilities_id, undefined, {
        numeric: true,
      }) ||
      Number(b.is_premier_YN) - Number(a.is_premier_YN) ||
      a.field_name.localeCompare(b.field_name, undefined, { numeric: true })
    );
  });

  return sortedFields;
};

export { getIncrementSelectOptions, getSortedFieldsByFacility };
