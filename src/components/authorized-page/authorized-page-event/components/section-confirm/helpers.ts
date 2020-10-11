import { ISchedule, IFetchedBracket } from 'common/models';
import { ScheduleStatuses, BracketStatuses } from 'common/enums';

const getPublishedSchedule = (schedules: ISchedule[]) => {
  const publishedSchedule = schedules.find(
    it => it.is_published_YN === ScheduleStatuses.Published
  );

  return publishedSchedule || null;
};

const getPublishedBracket = (schedules: IFetchedBracket[]) => {
  const publishedBracket = schedules.find(
    it => it.is_published_YN === BracketStatuses.Published
  );

  return publishedBracket || null;
};

export { getPublishedSchedule, getPublishedBracket };
