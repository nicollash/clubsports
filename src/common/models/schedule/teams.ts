import { TeamPositionEnum } from "components/common/matrix-table/helper";
import { GameType } from "components/common/matrix-table/dnd/drop";

export interface IFetchedTeam {
  team_id: string;
  event_id: string | null;
  org_id?: string | null;
  division_id: string;
  pool_id: string;
  long_name: string;
  short_name: string;
  team_tag: string;
  city?: string | null;
  state?: string | null;
  level?: string | null;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  phone_num?: string | null;
  contact_email?: string | null;
  schedule_restrictions?: string | null;
  is_active_YN: 1 | 0 | null;
  is_library_YN: 1 | 0 | null;
  created_by: string;
  created_datetime: string;
  updated_by?: string | null;
  updated_datetime?: string | null;
}

export interface ITeam {
  id: string;
  name: string;
  eventId?: string;
  startTime: string;
  poolId: string | null;
  divisionId: string;
  isPremier: boolean;
  teamPhoneNum?: string | null;
  contactFirstName?: string | null;
  contactLastName?: string | null;
  divisionShortName?: string;
  divisionHex?: string;
}

export interface ITeamCard extends ITeam {
  games?: {
    id: number;
    gameType?: string | GameType;
    awayTeamId?: string;
    homeTeamId?: string;
    teamPosition: TeamPositionEnum;
    isTeamLocked?: boolean;
    isCancelled?: boolean;
    teamScore?: string | number | null;
    date?: string;
    startTime?: string;
    awayPoolId?: string;
    homePoolId?: string;
  }[];
  fieldId?: string;
  state?: string;
  timeSlotId?: number;
  teamPosition?: number;
  isCancelled?: boolean;

  //
  errors?: string[];
  isLocked?: boolean;
  score?: string | number | null;
}
