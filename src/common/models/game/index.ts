export interface IGame {
    away_team_id: string | null;
    away_team_score: number | null;
    created_by: string | null;
    created_datetime: string | null;
    division_id: string | null;
    event_id: string | null;
    facilities_id: string | null;
    field_id: string | null;
    finalized_by: string | null;
    finalized_datetime: string | null;
    game_date: string | null;
    game_id: string | null;
    game_type: number | null;
    home_team_id: string | null;
    home_team_score: number | null;
    is_active_YN: 0 | 1 | null;
    is_bracket_YN: 0 | 1 | null;
    is_cancelled_YN: 0 | 1 | null;
    is_final_YN: 0 | 1 | null;
    is_locked_YN: 0 | 1 | null;
    pool_id: string | null;
    schedule_id: string | null;
    sport_id: number | null;
    start_time: string | null;
    updated_by: string | null;
    updated_datetime: string | null;
}