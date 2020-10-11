import {
  IRegistration,
  IPool,
  ITeam,
  IFacility,
  IDivision,
  ISchedule,
} from 'common/models';

export interface ILibraryManagerRegistration extends IRegistration {
  eventName: string;
}

export interface ILibraryManagerFacility extends IFacility {
  eventName: string;
}

export interface ILibraryManagerDivision extends IDivision {
  eventName: string;
}

export interface ILibraryManagerSchedule extends ISchedule {
  eventName: string;
}

export interface IPoolWithTeams extends IPool {
  teams: ITeam[];
}

export interface ITableSortEntity {
  id: string;
  event: string;
  name: string;
  lastModified: string;
}
