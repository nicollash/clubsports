export interface ISmsScorer { 
  map_id: number,
  table_name: string | null;
  ordinal_position: number,
  column_name: string | null;
  column_display: string | null;
  data_type: string | null;
  is_nullable: string | null;
  is_active_YN: 0 | 1 | null;
  is_visable_YN: 0 | 1 | null;
  created_by: string | null;
  created_datetime: string | null;
  updated_by: string | null;
  updated_datetime: string | null;
}
