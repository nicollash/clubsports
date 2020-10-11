import * as Yup from 'yup';
import Api from 'api/api';
import {
  IRegistration,
  IEventDetails,
  IFacility,
  IDivision,
  ISchedule,
} from 'common/models';
import { EntryPoints } from 'common/enums';
import { IEntity } from 'common/types';
import {
  facilitySchema,
  divisionSchema,
  scheduleSchema,
  eventDetailsSchema,
} from 'validations';

const checkSharedItem = async (
  sharedItem: IEntity,
  event: IEventDetails,
  entryPoint: EntryPoints
) => {
  const ownSharedItems = await Api.get(
    `${entryPoint}?event_id=${event.event_id}`
  );

  switch (entryPoint) {
    case EntryPoints.EVENTS: {
      const event = sharedItem as IEventDetails;

      if (
        ownSharedItems.some(
          (it: IEventDetails) => it.event_id === event.event_id
        )
      ) {
        throw new Error('The event already has such an event');
      }
      break;
    }
    case EntryPoints.REGISTRATIONS: {
      const registration = sharedItem as IRegistration;

      if (
        ownSharedItems.some(
          (it: IRegistration) =>
            it.registration_id === registration.registration_id
        )
      ) {
        throw new Error('The event already has such a registration');
      }
      break;
    }
    case EntryPoints.FACILITIES: {
      const facility = sharedItem as IFacility;

      if (
        ownSharedItems.some(
          (it: IFacility) => it.facilities_id === facility.facilities_id
        )
      ) {
        throw new Error('The event already has such a facility');
      }

      await Yup.array()
        .of(facilitySchema)
        .unique(
          facility => facility.facilities_description,
          'Oops. It looks like you already have facilities with the same name. The facility must have a unique name.'
        )
        .validate([...ownSharedItems, facility]);

      break;
    }
    case EntryPoints.DIVISIONS: {
      const division = sharedItem as IDivision;

      if (
        ownSharedItems.some(
          (it: IDivision) => it.division_id === division.division_id
        )
      ) {
        throw new Error('The event already has such a division');
      }

      await Yup.array()
        .of(divisionSchema)
        .unique(
          division => division.long_name,
          'Oops. It looks like you already have division with the same long name. The division must have a unique long name.'
        )
        .unique(
          division => division.short_name,
          'Oops. It looks like you already have division with the same short name. The division must have a unique short name.'
        )
        .validate([...ownSharedItems, division]);

      break;
    }
    case EntryPoints.SCHEDULES: {
      const schedule = sharedItem as ISchedule;

      if (
        ownSharedItems.some(
          (it: ISchedule) => it.schedule_id === schedule.schedule_id
        )
      ) {
        throw new Error('The event already has such a schedule');
      }

      await Yup.array()
        .of(scheduleSchema)
        .unique(
          schedule => schedule.schedule_name,
          'Oops. It looks like you already have schedule with the same name. The schedule must have a unique name.'
        )
        .validate([...ownSharedItems, schedule]);

      break;
    }
  }
};

const checkClonedItem = async (
  clonedItem: IEntity,
  entryPoint: EntryPoints
) => {
  switch (entryPoint) {
    case EntryPoints.EVENTS: {
      const event = clonedItem as IEventDetails;
      const allEvents = await Api.get(EntryPoints.EVENTS);

      await Yup.array()
        .of(eventDetailsSchema)
        .unique(
          event => event.event_name,
          'Oops. It looks like you already have an event with the same name. The event must have a unique name.'
        )
        .validate([...allEvents, event]);
    }
  }
};

export { checkSharedItem, checkClonedItem };
