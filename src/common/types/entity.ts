import {
  IRegistration,
  IEventDetails,
  IFacility,
  IDivision,
  ITeam,
  ISchedule,
} from 'common/models';

export type IEntity =
  | IEventDetails
  | IRegistration
  | IFacility
  | IDivision
  | ITeam
  | ISchedule;
