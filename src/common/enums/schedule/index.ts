enum ScheduleStatuses {
  'Draft' = 0,
  'Published' = 1,
}

enum IScheduleFields {
  SCHEDULE_ID = 'schedule_id',
  EVENT_ID = 'event_id',
  MEMBER_ID = 'member_id',
  SCHEDULE_NAME = 'schedule_name',
  SCHEDULE_TAG = 'schedule_tag',
  NUM_DIVISIONS = 'num_divisions',
  NUM_TEAMS = 'num_teams',
  MIN_NUM_GAMES = 'min_num_games',
  MAX_NUM_GAMES = 'max_num_games',
  LAST_WEB_PUBLISH = 'last_web_publish',
  GAMES_START_ON = 'games_start_on',
  PERIOD_DURATION = 'period_duration',
  PRE_GAME_WARMUP = 'pre_game_warmup',
  TIME_BTWN_PERIODS = 'time_btwn_periods',
  IS_ACTIVE_YN = 'is_active_YN',
  IS_LIBRARY_YN = 'is_library_YN',
  IS_PUBLISHED_YN = 'is_published_YN',
  CREATED_BY = 'created_by',
  CREATED_DATETIME = 'created_datetime',
  UPDATED_BY = 'updated_by',
  UPDATED_DATETIME = 'updated_datetime',
}

enum ScheduleWarningsEnum {
  GameTimesDiffer = 'Schedule First Game Start and Last Game End options do not match the Event Details options. Your Schedule data may be corrupted.',
  MinGamesNumExceedsPoolLength = 'The minimum # of games is not met due to the the number of teams in a pool',
  MaxGamesNumExceededPerDay = 'The maximum # of games per day is exceeded',
  BackToBackGamesExist = 'There are back to back games',
}

export { IScheduleFields, ScheduleStatuses, ScheduleWarningsEnum };
