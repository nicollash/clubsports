// ! If the interface changes, you must change the fields for the enum 'common/enums/_entity_'
export interface IFacility {
  facilities_id: string;
  event_id: string;
  facilities_description: string;
  facilities_abbr: string | null;
  num_fields: number | null;
  facilities_tag: string | null;
  address1: string | null;
  address2: string | null;
  city: string;
  state: string | null;
  zip: string | null;
  country: string | null;
  facility_lat: number | null;
  facility_long: number | null;
  facility_sort: string | null;
  first_game_time: string | null;
  last_game_end: string | null;
  public_access_YN: string | null;
  restrooms: string | null;
  num_toilets: string | null;
  restroom_details: string | null;
  parking_available: string | null;
  parking_details: string | null;
  parking_proximity: number | null;
  golf_carts_available: boolean | null;
  field_map_URL: string | null;
  is_active_YN: number | 1;
  is_library_YN: 0 | 1 | null;
  created_by: string | null;
  created_datetime: string | null;
  updated_by: string | null;
  updated_datetime: string | null;
  //optional
  isNew?: boolean;
  isChange?: boolean;
  isFieldsLoading?: boolean;
  isFieldsLoaded?: boolean;
}
