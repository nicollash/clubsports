export interface IGameBracket {
  away_depends_upon: number | null;
  away_team_id: string | null;
  away_team_score: number | null;
  bracket_id: string | null;
  bracket_year: string | null;
  created_by: string | null;
  created_datetime: string | null;
  division_id: string | null;
  event_id: string | null;
  field_id: string | null;
  pool_id: string | null;
  game_date: string | null;
  game_id: string | null;
  game_num: number | null;
  grid_num: number | null;
  home_depends_upon: number | null;
  home_team_id: string | null;
  home_team_score: null;
  is_active_YN: 0 | 1 | null;
  is_cancelled_YN: 0 | 1 | null;
  is_final_YN: 0 | 1 | null;
  round_num: number | null;
  seed_num_away: number | null;
  seed_num_home: number | null;
  start_time: string | null;
  updated_by: string | null;
  updated_datetime: string | null;
}
