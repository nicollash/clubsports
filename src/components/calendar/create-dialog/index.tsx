/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@material-ui/core';
import { capitalize } from 'lodash-es';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { faAt, faAlignLeft } from '@fortawesome/free-solid-svg-icons';

import SearchSelect from 'components/common/search-select';
import { Input, DatePicker, Button, Checkbox } from 'components/common';
import { buttonTypeEvent, ButtonTypeEvent } from '../calendar.helper';
import { ICalendarEvent } from 'common/models/calendar';
import { IDateSelect } from '../calendar.model';
import styles from './styles.module.scss';

import { isCalendarEventValid } from '../logic/helper';
import { getVarcharEight } from 'helpers';
import { debounce } from 'lodash';
import ITag from 'common/models/calendar/tag';
import moment from 'moment';
import { PopupExposure } from 'components/common';

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

interface IProps {
  dialogOpen: boolean;
  onDialogClose: () => void;
  onSave: (data: Partial<ICalendarEvent>) => void;
  dateSelect: IDateSelect;
  getTags: (value: string) => void;
  tags: ITag[];
}

const defaultCalendarEvent = (): Partial<ICalendarEvent> => ({
  cal_event_id: getVarcharEight(),
  cal_event_title: '',
  cal_event_startdate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
  cal_event_enddate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
  cal_event_datetime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
  cal_event_tag: '',
  cal_event_type: 'event',
  cal_event_desc: '',
  has_reminder_YN: 1,
  status_id: 1,
});

export default (props: IProps) => {
  const {
    dialogOpen,
    onDialogClose,
    onSave,
    dateSelect,
    getTags,
    tags,
  } = props;
  const { left, top, date } = dateSelect;

  const delayedQuery = useCallback(
    debounce((value: string) => getTags(value), 600),
    []
  );

  useEffect(() => {
    if (!dialogOpen)
      setTimeout(() => setCalendarEvent(defaultCalendarEvent()), 200);
  }, [dialogOpen]);

  useEffect(
    () =>
      setCalendarEvent({
        ...calendarEvent,
        cal_event_startdate: date! || calendarEvent.cal_event_startdate,
        cal_event_enddate: date! || calendarEvent.cal_event_enddate,
        cal_event_datetime:
          moment(new Date(date!))
            .add('hours', 8)
            .toISOString() || calendarEvent.cal_event_datetime,
      }),
    [dateSelect]
  );

  const [calendarEvent, setCalendarEvent] = useState<Partial<ICalendarEvent>>(
    defaultCalendarEvent()
  );
  const [changesAreMade, toggleChangesAreMade] = useState(false);
  const [isModalConfirmOpen, toggleModalConfirm] = useState(false);

  const buttonTypeEvents: ButtonTypeEvent[] = ['event', 'reminder', 'task'];

  const changeEventType = (type: ButtonTypeEvent) => {
    setCalendarEvent({
      ...calendarEvent,
      cal_event_type: type,
    });
  };

  const updateEvent = (name: string, value: any) => {
    setCalendarEvent({ ...calendarEvent, [name]: value });
    if (!changesAreMade) {
      toggleChangesAreMade(true);
    }
  };

  const onDateFromChange = (value: Date | string) =>
    updateEvent('cal_event_startdate', new Date(value).toISOString());

  const onDateToChange = (value: Date | string) =>
    updateEvent('cal_event_enddate', new Date(value).toISOString());

  const onChange = (event: InputTargetValue) => {
    const { name, value } = event?.target;
    updateEvent(name, value);
  };

  const onTagInputChange = (_event: React.ChangeEvent<{}>, value: string) => {
    delayedQuery(value);
    updateEvent('cal_event_tag', value);
  };

  const onHasReminderChange = (event: InputTargetValue) => {
    updateEvent('has_reminder_YN', event.target.checked ? 1 : 0);
  };

  const onEventDateTimeChange = (value: Date | string) => {
    setCalendarEvent({
      ...calendarEvent,
      cal_event_datetime: new Date(value).toISOString(),
      cal_event_startdate: new Date(value).toISOString(),
      cal_event_enddate: new Date(value).toISOString(),
    });
  };

  const onSaveClicked = () => {
    onSave(calendarEvent);
    onModalConfirmClose();
    toggleChangesAreMade(false);
  };

  const onCancelClick = () => {
    if (changesAreMade) {
      toggleModalConfirm(true);
    } else {
      onDialogClose();
    }
  };

  const onExitClick = () => {
    onModalConfirmClose();
    onDialogClose();
    toggleChangesAreMade(false);
  };

  const onModalConfirmClose = () => {
    toggleModalConfirm(false);
  };

  const renderDatePicker = (eventType: any) => {
    switch (eventType) {
      case 'event':
        return (
          <>
            <DatePicker
              width="115px"
              label=""
              type="date"
              viewType="input"
              value={calendarEvent.cal_event_startdate}
              onChange={onDateFromChange}
            />
            <span>&ndash;</span>
            <DatePicker
              width="115px"
              label=""
              type="date"
              viewType="input"
              value={calendarEvent.cal_event_enddate}
              onChange={onDateToChange}
            />
          </>
        );
      case 'reminder':
      case 'task':
        return (
          <DatePicker
            width="257px"
            label=""
            type="date-time"
            viewType="input"
            value={calendarEvent.cal_event_datetime}
            onChange={onEventDateTimeChange}
          />
        );
    }
  };

  const renderButtons = (eventTypes: ButtonTypeEvent[]) =>
    eventTypes.map((el: ButtonTypeEvent) => (
      <Button
        key={el}
        label={capitalize(el)}
        color="primary"
        variant="contained"
        onClick={changeEventType.bind(undefined, el)}
        type={buttonTypeEvent(el, calendarEvent.cal_event_type!)}
      />
    ));

  const tagsOptions = tags.map(tag => ({
    label: tag.search_term,
    value: tag.tag_id,
  }));

  return (
    <Dialog
      className={styles.container}
      open={dialogOpen}
      style={{ left, top }}
      PaperProps={{ classes: { root: styles.dialogPaper } }}
      BackdropProps={{ invisible: true }}
    >
      <div className={styles.wrapper}>
        <div className={styles.innerWrapper}>
          <div className={styles.leftColumn}>
            <Input
              name="cal_event_title"
              width="283px"
              onChange={onChange}
              value={calendarEvent.cal_event_title}
              placeholder="Title"
              autofocus={true}
            />
            <div className={styles.withIconWrapper}>
              <FontAwesomeIcon icon={faCalendar} />
              {renderDatePicker(calendarEvent.cal_event_type)}
            </div>
            <div className={styles.withIconWrapper}>
              <FontAwesomeIcon icon={faAt} />
              <SearchSelect
                width="257px"
                placeholder={
                  calendarEvent.cal_event_type === 'event'
                    ? 'Tag'
                    : 'Assigned to'
                }
                options={tagsOptions}
                onInputChange={onTagInputChange}
                value={calendarEvent.cal_event_tag! || ''}
              />
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.buttonsWrapper}>
              {renderButtons(buttonTypeEvents)}
            </div>
            <div className={styles.withIconWrapper}>
              <FontAwesomeIcon icon={faAlignLeft} />
              <Input
                name="cal_event_desc"
                width="231px"
                onChange={onChange}
                value={calendarEvent.cal_event_desc}
                placeholder="Description"
              />
            </div>
            {calendarEvent.cal_event_type === 'task' && (
              <div className={styles.checkboxWrapper}>
                <Checkbox
                  options={[
                    {
                      label: 'Set Reminder',
                      checked: Boolean(calendarEvent.has_reminder_YN),
                    },
                  ]}
                  onChange={onHasReminderChange}
                />
              </div>
            )}
          </div>
        </div>
        <div className={styles.controlWrapper}>
          <Button
            onClick={onCancelClick}
            label="Cancel"
            variant="text"
            color="secondary"
          />
          <Button
            disabled={!isCalendarEventValid(calendarEvent)}
            onClick={onSaveClicked}
            label="Save"
            variant="contained"
            color="primary"
          />
        </div>
      </div>
      <PopupExposure
        isOpen={isModalConfirmOpen}
        onClose={onModalConfirmClose}
        onExitClick={onExitClick}
        onSaveClick={onSaveClicked}
      />
    </Dialog>
  );
};
