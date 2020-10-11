import { IEntity } from 'common/types';
import { EntryPoints } from 'common/enums';
import { IFacility, IDivision, ISchedule } from 'common/models';

const getSelectOptions = (entities: IEntity[], entryPoint: EntryPoints) => {
  switch (entryPoint) {
    case EntryPoints.FACILITIES: {
      const facilities = entities as IFacility[];

      return facilities.map(it => ({
        label: it.facilities_description,
        value: it.facilities_id,
      }));
    }
    case EntryPoints.DIVISIONS: {
      const divisions = entities as IDivision[];

      return divisions.map(it => ({
        label: it.long_name,
        value: it.division_id,
      }));
    }
    case EntryPoints.SCHEDULES: {
      const schedules = entities as ISchedule[];

      return schedules.map(it => ({
        label: it.schedule_name,
        value: it.schedule_id,
      }));
    }
  }
};

const getEntityByOptions = (
  entities: IEntity[],
  checkedValues: string[],
  entryPoint: EntryPoints
) => {
  switch (entryPoint) {
    case EntryPoints.FACILITIES: {
      const facilities = entities as IFacility[];

      return facilities.filter(it => checkedValues.includes(it.facilities_id));
    }
    case EntryPoints.DIVISIONS: {
      const divisions = entities as IDivision[];

      return divisions.filter(it => checkedValues.includes(it.division_id));
    }
    case EntryPoints.SCHEDULES: {
      const schedules = entities as ISchedule[];

      return schedules.filter(it => checkedValues.includes(it.schedule_id));
    }
  }
};

export { getSelectOptions, getEntityByOptions };
