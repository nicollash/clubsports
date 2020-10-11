import {
  EntryPoints,
  IRegistrationFields,
  IFacilityFields,
  IDivisionFields,
  IEventDetailsFields,
  IScheduleFields,
} from 'common/enums';
import { IEntity } from 'common/types';

const getVarcharEight = () =>
  Array.apply(0, Array(8))
    .map(() =>
      (charset => charset.charAt(Math.floor(Math.random() * charset.length)))(
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      )
    )
    .join('');

const generateEntityId = (entity: IEntity, entryPoint: EntryPoints) => {
  switch (entryPoint) {
    case EntryPoints.EVENTS: {
      return {
        ...entity,
        [IEventDetailsFields.EVENT_ID]: getVarcharEight(),
      };
    }
    case EntryPoints.REGISTRATIONS: {
      return {
        ...entity,
        [IRegistrationFields.REGISTRATION_ID]: getVarcharEight(),
      };
    }
    case EntryPoints.FACILITIES: {
      return {
        ...entity,
        [IFacilityFields.FACILITIES_ID]: getVarcharEight(),
      };
    }
    case EntryPoints.DIVISIONS: {
      return {
        ...entity,
        [IDivisionFields.DIVISION_ID]: getVarcharEight(),
      };
    }
    case EntryPoints.SCHEDULES:
      return {
        ...entity,
        [IScheduleFields.SCHEDULE_ID]: getVarcharEight(),
      };
  }

  return entity;
};

export { getVarcharEight, generateEntityId };
