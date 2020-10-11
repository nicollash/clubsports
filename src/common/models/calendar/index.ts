import { ButtonTypeEvent } from 'components/calendar/calendar.helper';

export interface IEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  datetime?: string;
  className?: string;
  description?: string;
  tag?: string;
  type: string;
  hasReminder?: number;
  status_id: number | null;
  allDay: boolean;
}

export interface ICalendarEvent {
  cal_event_id: string;
  calendar_id: string;
  cal_event_type: ButtonTypeEvent;
  cal_event_title: string;
  cal_event_desc: string;
  cal_event_startdate: string;
  cal_event_enddate: string;
  cal_event_datetime: string;
  cal_event_tag: string;
  has_reminder_YN: number;
  reminder_datetime: string;
  status_id: number | null;
  is_active_YN: number;
  created_by: string;
  created_datetime: string;
  updated_by: string;
  updated_datetime: string;
}
