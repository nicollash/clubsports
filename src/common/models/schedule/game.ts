export interface ISchedulesGame {
  game_id: string;
  event_id: string;
  schedule_id: string;
  sport_id: number;
  facilities_id: string | null;
  field_id: string;
  game_date: string;
  game_time: string | null;
  away_team_id: string | null;
  home_team_id: string | null;
  away_team_score: string | number | null;
  home_team_score: string | number | null;
  is_active_YN: number;
  is_final_YN: number | null;
  finalized_by: string | null;
  finalized_datetime: string | null;
  is_bracket_YN: number | null;
  is_cancelled_YN: number | null;
  created_by: string;
  created_datetime: string;
  updated_by: string | null;
  updated_datetime: string | null;
}

export interface ISchedulesGameWithNames {
  id: string;
  fieldId: string;
  fieldName: string;
  awayTeamId: string | null;
  awayTeamName: string | null;
  awayTeamScore: string | number | null;
  homeTeamId: string | null;
  homeTeamName: string | null;
  homeTeamScore: string | number | null;
  gameDate: string;
  startTime: string;
  createTime: string;
  updatedTime: string | null;
}

export interface IChangedGame {
  id: number | string;
  startTime?: string;
  fieldId?: string;
  date?: string;
  isBracketTable?: boolean;
}
