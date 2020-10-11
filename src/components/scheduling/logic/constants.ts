import { ScheduleStatuses } from 'common/enums';

const EMPTY_SCHEDULE = {
  schedule_id: null,
  event_id: null,
  member_id: null,
  schedule_name: '',
  schedule_tag: '',
  num_divisions: null,
  num_teams: null,
  min_num_games: '',
  max_num_games: '',
  last_web_publish: null,
  games_start_on: '',
  pre_game_warmup: '',
  period_duration: '',
  time_btwn_periods: '',
  is_active_YN: 0,
  is_library_YN: 0,
  is_published_YN: ScheduleStatuses.Draft,
};

export { EMPTY_SCHEDULE };
