import { removeObjKeysByKeys } from 'helpers';
import {
  IEventDetails,
  IRegistration,
  IFacility,
  IDivision,
  ISchedule,
} from 'common/models';
import {
  EntryPoints,
  IRegistrationFields,
  IFacilityFields,
  IDivisionFields,
  IEventDetailsFields,
  IScheduleFields,
} from 'common/enums';
import { IEntity } from 'common/types';

const arrToMap = <T>(arr: T[], field: string): Object => {
  return arr.reduce((acc, item) => {
    acc[item[field]] = item;

    return acc;
  }, {});
};

const mapToArr = <T>(obj: Object, field: string): Array<T> => {
  return Object.keys(obj).map(obj => obj[field]);
};

const mapArrWithEventName = <T extends IEntity>(
  arr: T[],
  events: IEventDetails[]
): T[] =>
  arr.map(it => {
    const currentEvent = events.find(event => event.event_id === it.event_id);

    return { ...it, eventName: currentEvent?.event_name };
  });

const removeObjKeysByEntryPoint = (
  entity: IEntity,
  entryPoint: EntryPoints
): IEntity => {
  switch (entryPoint) {
    case EntryPoints.EVENTS: {
      return removeObjKeysByKeys(
        entity,
        Object.values(IEventDetailsFields)
      ) as IEventDetails;
    }
    case EntryPoints.REGISTRATIONS: {
      return removeObjKeysByKeys(
        entity,
        Object.values(IRegistrationFields)
      ) as IRegistration;
    }
    case EntryPoints.FACILITIES: {
      return removeObjKeysByKeys(
        entity,
        Object.values(IFacilityFields)
      ) as IFacility;
    }
    case EntryPoints.DIVISIONS: {
      return removeObjKeysByKeys(
        entity,
        Object.values(IDivisionFields)
      ) as IDivision;
    }
    case EntryPoints.SCHEDULES: {
      return removeObjKeysByKeys(
        entity,
        Object.values(IScheduleFields)
      ) as ISchedule;
    }
  }

  return entity;
};

export { arrToMap, mapToArr, mapArrWithEventName, removeObjKeysByEntryPoint };
