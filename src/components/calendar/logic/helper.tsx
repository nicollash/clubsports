import React from 'react';
import { ICalendarEvent } from 'common/models/calendar';
import moment from 'moment';
import { toast } from 'react-toastify';
import Reminder from 'components/common/reminder';
import { BindingAction } from 'common/models';

export const isCalendarEventValid = (event: Partial<ICalendarEvent>) => {
  const requiredFields = [
    'cal_event_title',
    // 'cal_event_startdate',
    // 'cal_event_enddate',
  ];

  const fields = Object.keys(event).filter(
    (field: string) =>
      requiredFields.includes(field) &&
      event[field] !== undefined &&
      event[field] !== ''
  );

  return fields.length === requiredFields.length;
};

export const filterCalendarEvents = (calendarEvents: ICalendarEvent[]) => {
  return calendarEvents
    .filter(
      event =>
        event.cal_event_type === 'reminder' || event.cal_event_type === 'task'
    )
    .filter(event => event.has_reminder_YN === 1)
    .filter(event => event.status_id === 1)
    .filter(event => new Date(event.cal_event_datetime) > new Date());
};

export const checkIfRemind = (
  filteredCalendarEvents: ICalendarEvent[],
  updateEvent: BindingAction
) => {
  filteredCalendarEvents.forEach((event: ICalendarEvent) => {
    const date = moment(new Date(event.cal_event_datetime))
      .seconds(0)
      .milliseconds(0)
      .toISOString();
    const now = moment(new Date())
      .seconds(0)
      .milliseconds(0)
      .toISOString();

    if (date === now) {
      toast(<Reminder event={event} updateEvent={updateEvent} />, {
        type: 'default',
        position: 'bottom-right',
        hideProgressBar: true,
        autoClose: false,
        closeOnClick: true,
      });
    }
  });
};
