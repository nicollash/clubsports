export interface IScheduleTeamDetails {
  event_id: string;
  schedule_id: string | null;
  division_name: string;
  division_id: string | null;
  team_name: string | null;
  created_by: string | null;
  is_active_YN: 1 | 0 | null;
  within_pool_game_count: string | null;
  outside_pool_game_count: string | null;
  json_games: string;
  // json_games?: {
  //   opponent_team_name?: string;
  //   game_date?: string;
  //   game_time?: string;
  //   facility?: string;
  //   field?: string;
  // }[];
}
