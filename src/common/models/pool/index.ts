// ! If the interface changes, you must change the fields for the enum 'common/enums/_entity_'
export interface IPool {
  pool_id: string;
  division_id: string;
  pool_desc: string;
  pool_name: string;
  pool_tag: string;
  pool_hex: string;
  is_AllStar_YN?: 1 | 0 | null;
  is_active_YN: boolean;
  created_by: string;
  created_datetime: string;
  updated_by: string;
  updated_datetime: string;
  //optional
  isTeamsLoading?: boolean;
  isTeamsLoaded?: boolean;
}

export interface ISelectPool {
  id: string;
  name: string;
}
