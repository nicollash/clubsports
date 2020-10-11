export interface ITeam {
  team_id: string;
  event_id: string | null;
  org_id: string | null;
  long_name: string | null;
  short_name: string;
  team_tag: string | null;
  city: string | null;
  state: string | null;
  level: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  phone_num: string | null;
  contact_email: string | null;
  schedule_restrictions: number | null;
  is_active_YN: number | null;
  is_library_YN: 0 | 1 | null;
  created_by?: string | null;
  created_datetime?: string | null;
  updated_by?: string | null;
  updated_datetime?: string | null;
  division_id: string;
  pool_id: string | null;
  //Optional
  isChange?: boolean;
  isDelete?: boolean;
}

export interface ITeamWithResults extends ITeam {
  wins: number;
  losses: number;
  tie: number;
  goalsScored: number;
  goalsAllowed: number;
  goalsDifferential: number;
}

// Used in Register Page
export interface ITeamItem {
  id?: string;
  team_name?: string;
  ext_sku?: string;
  division_name?: string;
  coach_first_name?: string;
  coach_last_name?: string;
  coach_mobile?: string;
  coach_email?: string;
}
