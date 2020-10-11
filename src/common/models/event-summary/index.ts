export interface IEventSummary {
  event_id: string;
  sport_id: string;
  org_id: string;
  event_name: string;
  event_startdate: string;
  event_enddate: string;
  time_zone_utc: number;
  event_status: number;
  first_game_time: string;
  num_of_locations: number | null;
  pre_game_warmup: number | null;
  period_duration: string;
  time_btwn_periods: string | null;
  periods_per_game: number;
  exclusive_time_ranges_YN: number;
  back_to_back_warning: number | string;
  min_num_of_games: string | null;
  playoffs_exist: number;
  bracket_durations_vary: string | null;
  facilities_id: string;
  facilities_initials: string;
  facilities_description: string;
  num_fields: number;
  field_id: string;
  field_name: string;
  field_abbreviation: string | null;
  field_opentime: string | null;
  field_closetime: string | null;
  is_illuminated_YN: number | null;
  is_premier_YN: number | null;
  is_active_YN: number | number;
  //! from server
  created_by: string;
  created_datetime: string;
}
