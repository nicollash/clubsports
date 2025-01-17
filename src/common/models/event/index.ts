// ! If the interface changes, you must change the fields for the enum 'common/enums/_entity_'
export interface IEventDetails {
  event_id: string;
  sport_id: number;
  org_id: string;
  event_name: string;
  event_description: string;
  main_contact: null | string;
  main_contact_mobile: null | string;
  main_contact_email: null | string;
  event_startdate: string;
  event_enddate: string;
  discontinuous_dates_YN: 0 | 1 | null;
  league_dates: null | string;
  time_zone_utc: number | null;
  event_level: string | null;
  event_tag: string | null;
  event_format_id: number | null;
  first_game_time: string;
  last_game_end: string;
  num_of_locations: number | null;
  primary_location_desc: string | null;
  primary_location_city: string | null;
  primary_location_state: string | null;
  primary_location_long: number | null;
  primary_location_lat: number | null;
  pre_game_warmup: string | null;
  period_duration: string;
  time_btwn_periods: string;
  periods_per_game: number;
  exclusive_time_ranges_YN: number | null;
  waivers_required: number | null;
  waiverhub_utilized: null;
  back_to_back_warning: number | null;
  require_wellness_statement: number | null;
  wellness_via_waiverhub: number | null;
  tie_breaker_format_id: number | null;
  min_num_of_games: number | null;
  event_type: string;
  allstar_games_YN: number | null;
  practice_games_YN: number | null;
  playoffs_exist: number | null;
  multiday_playoffs_YN: number | null;
  custom_playoffs_YN: 0 | 1 | null;
  bracket_level: string;
  bracket_warmup: string | null;
  bracket_division_duration: string | null;
  bracket_time_between_periods: string | null;
  playoff_comments: string | null;
  max_num_of_divisions: number | null;
  bracket_type: string | null;
  ranking_factor_divisions: string;
  ranking_factor_pools: string;
  bracket_durations_vary: string | null;
  bracket_duration: string | null;
  bracket_time_btwn_periods: string | null;
  num_teams_bracket: number | null;
  timer_owner: number | null;
  max_num_teams_per_division: number | null;
  sms_scoring_YN: number | null;
  show_goals_scored: string | null;
  show_goals_allowed: string | null;
  show_goals_diff: string | null;
  assoc_docs_URL: string | null;
  event_logo_path: string | null;
  mobile_icon_URL: string;
  desktop_icon_URL: string;
  is_active_YN: number | null;
  is_library_YN: 0 | 1 | null;
  is_published_YN: number;
  num_games_completed: number | null;
  last_web_published: string | null;
  max_goal_differential: string | null;
  no_registrations_YN: 0 | 1 | null;
  same_coach_timeslot_YN: number | null;
  auto_adv_playoffs_YN: 0 | 1 | null;
  same_state_warn_YN: 0 | 1 | null;
  track_coaches_YN: number | null;
  created_by: string;
  created_datetime: string;
  updated_by: string;
  updated_datetime: string;
}
