enum BracketStatuses {
  'Draft' = 0,
  'Published' = 1,
}

enum IBracketFields {
  BRACKET_ID = 'bracket_id',
  SCHEDULE_ID = 'schedule_id',
  EVENT_ID = 'event_id',
  BRACKET_NAME = 'bracket_name',
  BRACKET_DATE = 'bracket_date',
  ALIGN_GAMES = 'align_games',
  ADJUST_COLUMNS = 'adjust_columns',
  START_TIMESLOT = 'start_timeslot',
  CUSTOM_WARMUP = 'custom_warmup',
  END_TIMESLOT = 'end_timeslot',
  FIELDS_EXCLUDED = 'fields_excluded',
  IS_ACTIVE_YN = 'is_active_YN',
  IS_PUBLISHED_YN = 'is_published_YN',
  CREATED_BY = 'created_by',
  CREATED_DATETIME = 'created_datetime',
  UPDATED_BY = 'updated_by',
  UPDATED_DATETIME = 'updated_datetime',
}

export { IBracketFields, BracketStatuses };
