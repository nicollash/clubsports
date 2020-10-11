import { BracketStatuses } from 'common/enums';

// ! If the interface changes, you must change the fields for the enum 'common/enums/_entity_'
export interface IFetchedBracket {
  bracket_id: string;
  schedule_id: string;
  event_id: string;
  bracket_name: string;
  bracket_date: Date | string | null;
  bracket_level: 1 | 2 | null;
  align_games: 1 | 0 | null;
  adjust_columns: 1 | 0 | null;
  start_timeslot: string | null;
  custom_warmup: string | null;
  end_timeslot: string | null;
  fields_excluded: string | null;
  is_active_YN: 1 | 0 | null;
  is_published_YN: BracketStatuses;
  multiday_YN: 1 | 0 | null;
  created_by: string;
  created_datetime: string;
  updated_by: string | null;
  updated_datetime: string | null;
}

export interface IBracket {
  id: string;
  name: string;
  scheduleId: string;
  alignItems: boolean;
  adjustTime: boolean;
  warmup: string;
  bracketDate: string;
  bracketLevel?: number;
  eventId: string;
  published: boolean;
  createdBy: string;
  createDate: string;
  updatedBy: string | null;
  updateDate: string | null;
  startTimeSlot: string;
  endTimeSlot: string;
  multiDay?: boolean;
  isManualCreation?: boolean;
}

export interface ISchedulingBracket extends IBracket {
  createdByName: string | null;
  updatedByName: string | null;
}
