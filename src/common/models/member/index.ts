export interface IMember {
  member_id: string;
  first_name: string;
  last_name: string;
  member_tag: string;
  is_active_YN: boolean;
  email_address: string;
  cognito_sub: string;
  access_token_ios: string;
  access_token_android: string;
  created_by: string;
  created_datetime: string;
  updated_by: string;
  updated_datetime: string;
}
