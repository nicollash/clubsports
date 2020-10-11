enum EventPublishTypes {
  DETAILS = 'Event Divisions & Pools (No Games)',
  TOURNAMENT_PLAY = 'Pool Play',
  BRACKETS = 'Playoff Brackets',
  DETAILS_AND_TOURNAMENT_PLAY = 'Event Details & Pool Play Games',
  DETAILS_AND_TOURNAMENT_PLAY_AND_BRACKETS = 'Event Details, Pool Play, & Brackets',
}

enum EventModifyTypes {
  PUBLISH = 'Publish',
  UNPUBLISH = 'Unpublish',
}

export { EventPublishTypes, EventModifyTypes };
