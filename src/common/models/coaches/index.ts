export interface ICoache {
  team_contact_id: string;
  first_name: string;
  last_name: string;
  division_name: string;
  team_name: string;
  team_id: string | null;
  allow_sms_YN: 0 | 1| null;
  contact_email: string | null;
  phone_num: string | null;
  role: string | null;
}
