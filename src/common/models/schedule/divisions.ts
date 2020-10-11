export interface IFetchedDivision {
  division_id: string;
  event_id: string;
  long_name: string;
  short_name: string;
  is_premier_YN: 1 | 0 | null;
  entry_fee: number | null;
  division_description: string;
  division_hex: number | null;
  division_tag: string;
  max_num_teams: number;
  teams_registered: number | null;
  teams_tentitive: number | null;
  num_pools: number | null;
  division_message: string | null;
  plays_at_spec_facility: number | null;
  spec_facilities_id: string | null;
  game_duration_differ: string | null;
  game_duration_override: string | null;
  unique_bracket_game_duration: string | null;
  division_sort: number | null;
  latest_web_publish: string | null;
  is_active_YN: 1 | 0 | null;
  is_library_YN: 1 | 0 | null;
  created_by: string;
  created_datetime: string;
  updated_by: string;
  updated_datetime: string;
}

export interface IScheduleDivision {
  id: string;
  name: string;
  isPremier: boolean;
  size?: number;
  sizePercent?: number;
  preferredFacilityId?: string;
}
