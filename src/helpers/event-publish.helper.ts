import { ISchedule, IFetchedBracket, IEventDetails } from 'common/models';
import { BracketStatuses, EventStatuses, ScheduleStatuses } from 'common/enums';

const checkDraftEvent = (event: IEventDetails): boolean => {
  const isPublished = event.is_published_YN === EventStatuses.Draft;

  return isPublished;
};

const checkDraftSchedule = (schedules: ISchedule[]): boolean => {
  const hasPublished =
    schedules.length > 0 &&
    schedules.every(it => it.is_published_YN === ScheduleStatuses.Draft);

  return hasPublished;
};

const checkDraftBracket = (brackets: IFetchedBracket[]): boolean => {
  const hasPublished =
    brackets.length > 0 &&
    brackets.every(it => it.is_published_YN === BracketStatuses.Draft);

  return hasPublished;
};

const checkAllDraft = (
  event: IEventDetails,
  schedules: ISchedule[],
  brackets: IFetchedBracket[]
): boolean => {
  const hasAllDrafted =
    checkDraftEvent(event) &&
    checkDraftSchedule(schedules) &&
    checkDraftBracket(brackets);

  return hasAllDrafted;
};

const CheckEventDrafts = {
  checkDraftEvent,
  checkDraftSchedule,
  checkDraftBracket,
  checkAllDraft,
};

export { CheckEventDrafts };
