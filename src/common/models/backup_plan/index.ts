export interface IBackupPlan {
  backup_plan_id: string;
  event_id: string;
  backup_name: string;
  backup_type: string;
  facilities_impacted: string;
  fields_impacted: string;
  timeslots_impacted: string;
  change_value: any;
  event_date_impacted: string;
  is_active_YN: number;
  created_by: string;
  created_datetime: string;
  updated_by: string;
  updated_datetime: string;
}
