import { IFacility, IField, IEventDetails } from 'common/models';
import { IMultiSelectOption } from 'components/common/multi-select';
import { sortByField, formatTimeSlot } from 'helpers';
import { SortByFilesTypes } from 'common/enums';
import { IComplexityTimeslot, OptionsEnum, IChangedTimeSlot } from '../common';

export const mapFacilitiesToOptions = (
  allFacilities: IFacility[],
  facilitiesImpacted: string
) => {
  const facilities = JSON.parse(facilitiesImpacted);
  return allFacilities
    .filter(fac => facilities && facilities.includes(fac.facilities_id))
    .map(fac => ({
      label: fac.facilities_description,
      value: fac.facilities_id,
    }));
};

export const mapFieldsToOptions = (
  allFields: IField[],
  fieldsImpacted: string
) => {
  const fields = JSON.parse(fieldsImpacted);
  return allFields
    .filter(field => fields && fields.includes(field.field_id))
    .map(field => ({
      label: field.field_name,
      value: field.field_id,
      checked: true,
    }));
};

export const mapTimeslotsToOptions = (
  timeslots: string,
  backupType: string
) => {
  switch (backupType) {
    case OptionsEnum['Cancel Games']:
    case OptionsEnum['Weather Interruption: Modify Game Timeslots']: {
      const parsedTimeslots = JSON.parse(timeslots);

      return parsedTimeslots.map((timeslot: string) => ({
        label: formatTimeSlot(timeslot) as string,
        value: timeslot,
      }));
    }
    default:
      return [{ label: 'default', value: 'default' }];
  }
};

export const mapChangeValueOptions = (changeValue: string) => {
  const parsedChangeValue = JSON.parse(changeValue) as IChangedTimeSlot[];

  const mappedChangedValues = parsedChangeValue.map(it => ({
    ...it,
    newTimeSlotTime: it.newTimeSlotTime.slice(0, 5),
  }));

  return mappedChangedValues;
};

export const getEventOptions = (events: IEventDetails[]) => {
  const eventOptions = events.map(event => ({
    label: event.event_name,
    value: event.event_id,
  }));

  const sortedEventOptions = sortByField(eventOptions, SortByFilesTypes.SELECT);

  return sortedEventOptions;
};

export const getFacilitiesOptionsForEvent = (
  facilities: IFacility[],
  eventId: string
) => {
  const facilityOptions = facilities
    .filter(facility => facility.event_id === eventId)
    .map(facility => ({
      label: facility.facilities_description,
      value: facility.facilities_id,
    }));

  const sortedFacilityOptions = sortByField(
    facilityOptions,
    SortByFilesTypes.SELECT
  );

  return sortedFacilityOptions;
};

export const getFieldsOptionsForFacilities = (
  fields: IField[],
  facilitiesOptions: IMultiSelectOption[],
  fieldOptions: IMultiSelectOption[] | undefined
) => {
  const fieldOptionsForFacilities = facilitiesOptions.reduce((acc, option) => {
    const fieldsByFacilityId = fields.filter(
      field => field.facilities_id === option.value
    );

    const options = fieldsByFacilityId.map(field => ({
      label: `${field.field_name} (${option.label})`,
      value: field.field_id,
      checked: fieldOptions
        ? fieldOptions.some(
            it => it.value === field.field_id && Boolean(it.checked)
          )
        : false,
    }));

    return [...acc, ...options];
  }, [] as IMultiSelectOption[]);

  const sortedFieldOptions = sortByField(
    fieldOptionsForFacilities,
    SortByFilesTypes.SELECT
  );

  return sortedFieldOptions;
};

export const stringifyBackupPlan = (backupPlan: any) => {
  const MILLISECONDS_VALUE = ':00';

  return {
    ...backupPlan,
    facilities_impacted: JSON.stringify(
      backupPlan.facilities_impacted.map((fac: any) => fac.value)
    ),
    fields_impacted: JSON.stringify(
      backupPlan.fields_impacted.map((field: any) => field.value)
    ),
    timeslots_impacted: JSON.stringify(
      backupPlan.timeslots_impacted.map((timeslot: any) => timeslot.value)
    ),
    change_value: backupPlan.change_value
      ? JSON.stringify(
          backupPlan.change_value.map((it: IChangedTimeSlot) => ({
            ...it,
            newTimeSlotTime: it.newTimeSlotTime + MILLISECONDS_VALUE,
          }))
        )
      : null,
  };
};

export const getTimeSlotOptions = (timeSlots: IComplexityTimeslot) => {
  if (!timeSlots.eventTimeSlots) {
    return [];
  }

  const timeSlotOptions = timeSlots.eventTimeSlots.map(it => ({
    value: it.time,
    label: formatTimeSlot(it.time) as string,
  }));

  return timeSlotOptions;
};

export const getMapNewTimeSlots = (changedTimeSlots: IChangedTimeSlot[]) => {
  const mappedNewTimeSlots = changedTimeSlots.reduce((acc, timeslot) => {
    acc[timeslot.timeSlotTime] = timeslot.newTimeSlotTime;

    return acc;
  }, {});

  return mappedNewTimeSlots;
};

export const checkNewTimeSlots = (changedTimeSlot: IChangedTimeSlot[]) => {
  const rgx2 = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  const isCorrectTimeValues =
    changedTimeSlot &&
    changedTimeSlot.every((it: IChangedTimeSlot) =>
      rgx2.test(it.newTimeSlotTime)
    );

  return isCorrectTimeValues;
};
