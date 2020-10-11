export interface IOrgMember {
  org_member_id: string;
  member_id: string | null;
  org_id: string | null;
  access_desc: string | null;
  is_active_YN: number | null;
  created_by: string | null;
  created_datetime: string | null;
  updated_by: string | null;
  updated_datetime: string | null;
}
