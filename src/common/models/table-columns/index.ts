export interface ITableColumns {
  map_id: number;
  table_name: string;
  is_active_YN: number;
  created_by: string;
  table_details: string;
}

export interface IColumnDetails {
  ordinal_position: string;
  column_name: string;
  column_display: string;
  data_type: string;
  is_nullable: string;
  map_id: string;
}

export interface IMapping {
  member_map_id: number;
  import_description: string;
  skipped_rows_num: number;
  map_id_json: string;
  destination_table: string;
  is_active_YN: number;
  created_by: string;
  created_datetime: string;
  updated_datetime: string;
}
export interface IField {
  value: string;
  csvPosition: number;
  dataType: string;
  included: boolean;
  map_id: string;
}
