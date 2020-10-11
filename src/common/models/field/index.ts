export interface IField {
  field_id: string;
  facilities_id: string;
  field_name: string;
  field_abbreviation: string | null;
  field_opentime: string | null;
  field_closetime: string | null;
  field_notes: string | null;
  field_sort: number | null;
  is_illuminated_YN: number | null;
  is_premier_YN: number | null;
  is_active_YN: number | null;
  is_library_YN: 0 | 1 | null;
  is_turf_YN: 0 | 1 | null;
  created_by: string | null;
  created_datetime: string | null;
  updated_by: string | null;
  updated_datetime: string | null;
  //optional
  isNew?: boolean;
  isChange?: boolean;
}
