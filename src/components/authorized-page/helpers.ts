import {
  IMenuItem,
  IEventDetails,
  IFacility,
  IRegistration,
  IDivision,
  ITeam,
  ISchedule,
} from 'common/models';
import {
  RequiredMenuKeys,
  EventMenuTitles,
  ScheduleStatuses,
} from 'common/enums';

const getIncompleteMenuItems = (
  menuList: IMenuItem[],
  ignorList: EventMenuTitles[]
) => {
  const incompleteMenuItems = menuList.filter(
    item =>
      item.hasOwnProperty(RequiredMenuKeys.IS_COMPLETED) &&
      !item.isCompleted &&
      ignorList.every(ignore => item.title !== ignore)
  );

  return incompleteMenuItems;
};

const checkIsCompletedEvent = (event: IEventDetails | null): boolean => {
  const isEventCompleted = Boolean(event);

  return isEventCompleted;
};

const checkIsCompletedRegistration = (
  registration: IRegistration | null
): boolean => {
  const isRegistrationCompleted = Boolean(registration);

  return isRegistrationCompleted;
};

const checkIsCompletedFacilities = (facilities: IFacility[]): boolean => {
  const isFacilitiesCompleted = facilities.length > 0;

  return isFacilitiesCompleted;
};

const checkIsCompletedDivisions = (divisions: IDivision[]): boolean => {
  const isDivisionsCompleted = divisions.length > 0;

  return isDivisionsCompleted;
};

const checkIsCompletedTeams = (teams: ITeam[]): boolean => {
  const isTeamsCompleted =
    teams.length > 0 && !teams.some(it => !it.pool_id || it.isDelete);

  return isTeamsCompleted;
};

const checkIsCompletedSchedules = (schedules: ISchedule[]): boolean => {
  const isSchedulesCompleted = schedules.some(
    it => it.is_published_YN === ScheduleStatuses.Published
  );

  return isSchedulesCompleted;
};

const CheckIsCompleted = {
  checkIsCompletedEvent,
  checkIsCompletedRegistration,
  checkIsCompletedFacilities,
  checkIsCompletedDivisions,
  checkIsCompletedTeams,
  checkIsCompletedSchedules,
};

export { getIncompleteMenuItems, CheckIsCompleted };
