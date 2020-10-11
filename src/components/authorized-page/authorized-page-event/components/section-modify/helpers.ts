import { IEventDetails, ISchedule, IFetchedBracket } from 'common/models';
import { EventPublishTypes } from 'common/enums';
import { CheckEventDrafts } from 'helpers';

const getModifyPublishValues = (
  event: IEventDetails,
  schedules: ISchedule[],
  brackets: IFetchedBracket[]
) => {
  const eventPublishOptions = [];

  if (CheckEventDrafts.checkDraftEvent(event)) {
    eventPublishOptions.push(EventPublishTypes.DETAILS);
  }

  if (CheckEventDrafts.checkDraftSchedule(schedules)) {
    eventPublishOptions.push(EventPublishTypes.DETAILS_AND_TOURNAMENT_PLAY);
  }

  if (CheckEventDrafts.checkDraftBracket(brackets)) {
    eventPublishOptions.push(
      EventPublishTypes.DETAILS_AND_TOURNAMENT_PLAY_AND_BRACKETS
    );
  }

  return eventPublishOptions;
};

const getModifyUnpublishValues = (
  event: IEventDetails,
  schedules: ISchedule[],
  brackets: IFetchedBracket[]
) => {
  const eventPublishOptions = [];

  if (!CheckEventDrafts.checkDraftEvent(event)) {
    eventPublishOptions.push(EventPublishTypes.DETAILS);
  }

  if (schedules.length > 0 && !CheckEventDrafts.checkDraftSchedule(schedules)) {
    eventPublishOptions.push(EventPublishTypes.TOURNAMENT_PLAY);
  }

  if (brackets.length > 0 && !CheckEventDrafts.checkDraftBracket(brackets)) {
    eventPublishOptions.push(EventPublishTypes.BRACKETS);
  }

  return eventPublishOptions;
};

export { getModifyPublishValues, getModifyUnpublishValues };
