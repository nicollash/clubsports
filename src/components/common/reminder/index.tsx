import React from 'react';
import { Button } from 'components/common';
import { capitalize } from 'lodash';
import history from 'browserhistory';
import moment from 'moment';
import styles from './styles.module.scss';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { BindingCbWithTwo, ICalendarEvent } from 'common/models';

interface Props {
  event: ICalendarEvent;
  updateEvent: BindingCbWithTwo<ICalendarEvent, boolean>;
}

const Reminder = ({ event, updateEvent }: Props) => {
  const msg = `${event.cal_event_title} ${event.cal_event_desc &&
    `(${event.cal_event_desc})`}`;

  const onViewCalendar = () => {
    history.push('/calendar');
  };

  const onSnoozeClick = () => {
    const updEvent = {
      ...event,
      cal_event_datetime: moment(new Date(event.cal_event_datetime))
        .add('day', 1)
        .toISOString(),
    };
    updateEvent(updEvent, true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.msgWrapper}>
        <CalendarTodayIcon color="secondary" />
        <p className={styles.msg}>
          <span className={styles.type}>
            {capitalize(event.cal_event_type)}
          </span>
          : {msg}
        </p>
      </div>
      <div className={styles.btnsWrapper}>
        <Button
          label="View Calendar"
          variant="text"
          color="secondary"
          onClick={onViewCalendar}
        />
        {event.cal_event_type === 'reminder' && (
          <Button
            label="Snooze"
            variant="text"
            color="secondary"
            onClick={onSnoozeClick}
          />
        )}
      </div>
    </div>
  );
};

export default Reminder;
