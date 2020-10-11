import { EventPublishTypes } from 'common/enums';

const PublishedItemTitles = {
  [EventPublishTypes.DETAILS]: 'Division & pools',
  [EventPublishTypes.DETAILS_AND_TOURNAMENT_PLAY]: 'Pool Play',
  [EventPublishTypes.DETAILS_AND_TOURNAMENT_PLAY_AND_BRACKETS]:
    'Playoff Brackets',
};

export { PublishedItemTitles };
