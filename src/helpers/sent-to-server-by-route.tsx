import { IEntity } from 'common/types';
import { EntryPoints, EntryPointsWithId, MethodTypes } from 'common/enums';
import Api from 'api/api';
import {
  IFacility,
  IEventDetails,
  IRegistration,
  IDivision,
  ISchedule,
} from 'common/models';

const sentToServerByRoute = async (
  entity: IEntity,
  entryPoint: EntryPoints,
  method: MethodTypes
) => {
  switch (entryPoint) {
    case EntryPoints.EVENTS: {
      const event = entity as IEventDetails;

      return await Api[method](
        `${EntryPointsWithId.EVENTS}${event.event_id}`,
        event
      );
    }
    case EntryPoints.REGISTRATIONS: {
      const registration = entity as IRegistration;

      return await Api[method](
        `${EntryPointsWithId.REGISTRATIONS}${registration.registration_id}`,
        registration
      );
    }
    case EntryPoints.FACILITIES: {
      const facility = entity as IFacility;

      return await Api[method](
        `${EntryPointsWithId.FACILITIES}${facility.facilities_id}`,
        facility
      );
    }
    case EntryPoints.DIVISIONS: {
      const division = entity as IDivision;

      return await Api[method](
        `${EntryPointsWithId.DIVISIONS}${division.division_id}`,
        division
      );
    }
    case EntryPoints.SCHEDULES: {
      const schedule = entity as ISchedule;

      return await Api[method](
        `${EntryPointsWithId.SCHEDULES}${schedule.schedule_id}`,
        schedule
      );
    }
  }
};

export { sentToServerByRoute };
