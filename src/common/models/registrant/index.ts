// ! If the interface changes, you must change the fields for the enum 'common/enums/_entity_'
export interface IRegistrant {
  reg_response_id: string;
  registration_id: string;
  name: string;
  team_id: string;
  amount_due: string;
  amount_paid: string;
  is_active_YN: number;
  created_by: string;
  created_datetime: string;
  updated_by: string | null;
  updated_datetime: string | null;
}
