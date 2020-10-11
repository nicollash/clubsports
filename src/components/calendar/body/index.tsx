/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Calendar, View } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { capitalize } from 'lodash-es';

import { getViewType, buttonTypeView, ViewType } from '../calendar.helper';
import { DatePicker, Button } from 'components/common';
import styles from './styles.module.scss';
import { IEvent, ICalendarEvent } from 'common/models/calendar';
import { IDateSelect } from '../calendar.model';
import './main.scss';
import Modal from 'components/common/modal';
import InfoModal from '../info-modal';

interface IProps {
  onCreatePressed: () => void;
  eventsList?: IEvent[];
  onDatePressed: (dateSelect: IDateSelect) => void;
  onEventUpdate: (event: Partial<ICalendarEvent>) => void;
  onReminderAndTaskUpdate: (event: Partial<ICalendarEvent>) => void;
  onUpdateCalendarEventDetails: (event: Partial<ICalendarEvent>) => void;
  onDeleteCalendarEvent: (id: string) => void;
}

interface EventArg {
  date: Date;
  dateStr: string;
  allDay: boolean;
  resource?: any;
  dayEl: HTMLElement;
  jsEvent: MouseEvent;
  view: View;
}

export default (props: IProps) => {
  const {
    eventsList,
    onCreatePressed,
    onDatePressed,
    onEventUpdate,
    onReminderAndTaskUpdate,
    onDeleteCalendarEvent,
    onUpdateCalendarEventDetails,
  } = props;

  const header = {
    left: '',
    center: '',
    right: '',
  };

  const eventTimeFormat = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    meridiem: true,
  };

  const [currentDate, changeCurrentDate] = useState(new Date());
  const [currentView, changeCurrentView] = useState<ViewType>('month');

  const [isModalOpen, toggleModal] = useState(false);
  const [clickedEvent, setClickedEvent] = useState<any>(null);

  const calendarRef = React.createRef<FullCalendar>();
  const plugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];
  const columnHeaderFormat = {
    weekday: 'long',
  };

  let calendarApi: Calendar;

  useEffect(() => {
    calendarApi = calendarRef!.current!.getApi();
  });

  const changeView = (view: 'day' | 'week' | 'month') => {
    const viewType = getViewType(view);
    calendarApi.changeView(viewType);
    changeCurrentView(view);
  };

  const onDateChange = (date: any) => {
    calendarApi.gotoDate(date);
    changeCurrentDate(date);
  };

  const handleDateClick = (arg: EventArg) => {
    const left = arg.jsEvent.x;
    const top = arg.jsEvent.y;
    const date = new Date(arg.date).toISOString();
    // format(arg.date, 'yyyy-MM-dd HH:mm:ss');

    const dateSelect = {
      left,
      top,
      date,
    };

    onDatePressed(dateSelect);
  };

  const handleEventClick = (eventClickInfo: any) => {
    const { id, title, start, end } = eventClickInfo.event;
    const {
      description,
      tag,
      type,
      hasReminder,
      datetime,
      status_id,
    } = eventClickInfo.event.extendedProps;
    setClickedEvent({
      cal_event_id: id,
      cal_event_title: title,
      cal_event_startdate: start,
      cal_event_enddate: end,
      cal_event_datetime: datetime,
      cal_event_desc: description,
      cal_event_tag: tag,
      cal_event_type: type,
      has_reminder_YN: hasReminder,
      status_id,
    });
    toggleModal(true);
  };

  const onModalClose = () => {
    toggleModal(false);
  };

  const onEventDrop = (eventDropInfo: any) => {
    const { id, start, end, classNames } = eventDropInfo.event;
    const eventType = classNames[0];

    switch (eventType) {
      case 'event':
        return onEventUpdate({
          cal_event_id: id,
          cal_event_startdate: new Date(start).toISOString(),
          cal_event_enddate: end
            ? new Date(end).toISOString()
            : new Date(start).toISOString(),
        });
      case 'reminder':
      case 'task':
        return onReminderAndTaskUpdate({
          cal_event_id: id,
          cal_event_startdate: new Date(start).toISOString(),
          cal_event_enddate: new Date(start).toISOString(),
          cal_event_datetime: new Date(start).toISOString(),
        });
    }
  };

  const renderButton = (buttonType: ViewType) => (
    <Button
      label={capitalize(buttonType)}
      color="primary"
      variant="contained"
      onClick={changeView.bind(undefined, buttonType)}
      type={buttonTypeView(buttonType, currentView)}
    />
  );

  const renderDatePicker = () => {
    const view = currentView === 'month' ? 'month' : 'date';
    const dateFormat = currentView === 'month' ? 'MMMM yyyy' : 'MMMM dd, yyyy';
    return (
      <DatePicker
        views={[view]}
        width="250px"
        label=""
        type="date"
        dateFormat={dateFormat}
        value={String(currentDate)}
        onChange={onDateChange}
      />
    );
  };

  const renderBadge = (color: string, label: string) => (
    <div className={styles.badgeWrapper}>
      <div style={{ background: color }} />
      <span>{label}</span>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          label="Create Event/Reminder/Task"
          color="primary"
          variant="contained"
          onClick={onCreatePressed}
        />
        {renderDatePicker()}
        <div className={styles.buttonsWrapper}>
          {renderButton('day')}
          {renderButton('week')}
          {renderButton('month')}
        </div>
      </div>
      <div>
        <FullCalendar
          firstDay={1}
          droppable={true}
          editable={true}
          eventDurationEditable={false}
          defaultView="dayGridMonth"
          eventTimeFormat={eventTimeFormat}
          columnHeaderFormat={columnHeaderFormat}
          plugins={plugins}
          header={header}
          events={eventsList}
          ref={calendarRef}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={onEventDrop}
          displayEventTime={false}
        />
        <div className={styles.badgeContainer}>
          {renderBadge('#1c315f', 'Event')}
          {renderBadge('#6a6a6a', 'Reminder')}
          {renderBadge('#00a3ea', 'Task')}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <InfoModal
          clickedEvent={clickedEvent}
          onDeleteCalendarEvent={onDeleteCalendarEvent}
          onClose={onModalClose}
          setClickedEvent={setClickedEvent}
          onUpdateCalendarEventDetails={onUpdateCalendarEventDetails}
        />
      </Modal>
    </div>
  );
};
