export interface IMessage {
  message_id: string;
  request_id: string;
  sns_unique_id: string | null;
  member_id: string;
  message_type: string;
  event_id: string;
  recipient_details: string;
  send_datetime: string;
  message_title: string;
  message_body: string;
  status: number;
  one_way_two_way: 1 | 2 | null;
  status_message: string;
  email_from_name: string;
  in_library_YN: number;
  is_active_YN: number;
  created_by: string;
  created_datetime: string;
  updated_by: string;
  updated_datetime: string;
}
