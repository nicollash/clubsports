export interface IOrganization {
  org_id: string;
  org_name: string;
  org_tag: string | null;
  city: string | null;
  state: string | null;
  is_active_YN: number | null;
  //! from server
  created_by?: string | null;
  created_datetime?: string | null;
  updated_by?: null;
  updated_datetime?: null;
}

export interface IConfigurableOrganization {
  org_name: string;
  org_tag: string | null;
  city: string | null;
  state: string | null;
}
