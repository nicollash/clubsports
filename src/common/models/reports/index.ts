import { ReportDataSource } from 'common/enums';

export interface IReport {
  report_id: string;
  org_id: string;
  reporting_group1: string;
  reporting_group2: string;
  report_name: string;
  data_source_id: ReportDataSource;
  config_details: string;
  is_favorite_YN: 0 | 1 | null;

  is_default_YN: 0 | 1 | null;

  is_active_YN: 0 | 1 | null;
  created_by: string;
  created_datetime: string;
  updated_by: string;
  updated_datetime: string;
}
