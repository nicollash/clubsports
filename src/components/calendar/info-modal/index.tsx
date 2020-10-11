import React, { useState } from 'react';
import styles from './styles.module.scss';
import { format } from 'date-fns';
import { capitalize } from 'lodash-es';
import DeleteIcon from '@material-ui/icons/Delete';
import CreateIcon from '@material-ui/icons/Create';
import Button from 'components/common/buttons/button';
import Input from 'components/common/input';
import { ICalendarEvent } from 'common/models';
import { DatePicker } from 'components/common';
import DeletePopupConfrim from 'components/common/delete-popup-confirm';
import { PopupExposure } from 'components/common';

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

interface IConfirmModalProps {
  clickedEvent: any;
  onDeleteCalendarEvent: (id: string) => void;
  onClose: () => void;
  setClickedEvent: any;
  onUpdateCalendarEventDetails: (event: Partial<ICalendarEvent>) => void;
}

enum TaskStatus {
  'Open' = 1,
  'Close' = 2,
}

const InfoModal = ({
  clickedEvent,
  onDeleteCalendarEvent,
  onClose,
  onUpdateCalendarEventDetails,
  setClickedEvent,
}: IConfirmModalProps) => {
  const [editable, setEditable] = useState(false);
  const [isDeleteModalOpen, onDeleteModalChange] = useState(false);
  const [isModalConfirmOpen, onModalConfirmChange] = useState(false);
  const [changesAreMade, toggleChangesAreMade] = useState(false);

  const onDeleteModalClose = () => {
    onDeleteModalChange(false);
  };

  const onDeleteClick = () => {
    onDeleteModalChange(true);
  };

  const onCancelClick = () => {
    if (changesAreMade) {
      onModalConfirmChange(true);
    } else {
      onClose();
    }
  };

  const onModalConfirmClose = () => {
    onModalConfirmChange(false);
  };

  const onDelete = () => {
    onDeleteCalendarEvent(clickedEvent.cal_event_id);
    onDeleteModalChange(false);
    onClose();
  };

  const onSave = () => {
    onUpdateCalendarEventDetails(clickedEvent);
    onModalConfirmClose();
    onClose();
  };

  const onExit = () => {
    onModalConfirmClose();
    onClose();
  };

  const updateEvent = (name: string, value: any) => {
    setClickedEvent({ ...clickedEvent, [name]: value });
    if (!changesAreMade) {
      toggleChangesAreMade(true);
    }
  };
  const onTitleChange = (event: InputTargetValue) =>
    updateEvent('cal_event_title', event.target.value);

  const onTagChange = (event: InputTargetValue) =>
    updateEvent('cal_event_tag', event.target.value);

  const onDescriptionChange = (event: InputTargetValue) =>
    updateEvent('cal_event_desc', event.target.value);

  const onDateFromChange = (value: Date | string) =>
    updateEvent('cal_event_startdate', new Date(value).toISOString());

  const onDateToChange = (value: Date | string) =>
    updateEvent('cal_event_enddate', new Date(value).toISOString());

  const onEventDateTimeChange = (value: Date | string) => {
    setClickedEvent({
      ...clickedEvent,
      cal_event_datetime: new Date(value).toISOString(),
      cal_event_startdate: new Date(value).toISOString(),
      cal_event_enddate: new Date(value).toISOString(),
    });
  };

  const onTaskComplete = () => {
    updateEvent('status_id', 2);
    const updEvent = { ...clickedEvent, status_id: 2 };
    onUpdateCalendarEventDetails(updEvent);
  };

  const renderCompleteBtn = (status: number) => {
    switch (status) {
      case TaskStatus.Open || null:
        return (
          <Button
            label="Dismiss"
            variant="text"
            color="secondary"
            onClick={onTaskComplete}
          />
        );
      case TaskStatus.Close:
        return (
          <Button
            label="Dismissed"
            variant="text"
            color="secondary"
            disabled={true}
          />
        );
    }
  };

  const renderButtons = () => {
    return !editable ? (
      <div className={styles.buttonsGroup}>
        <Button
          label="Delete"
          variant="text"
          color="secondary"
          type="dangerLink"
          icon={<DeleteIcon style={{ fill: '#FF0F19' }} />}
          onClick={onDeleteClick}
        />
        <Button
          label="Edit"
          variant="text"
          color="secondary"
          icon={<CreateIcon />}
          onClick={() => setEditable(!editable)}
        />
      </div>
    ) : (
      <div className={styles.buttonsGroup}>
        <Button
          label="Cancel"
          variant="text"
          color="secondary"
          onClick={onCancelClick}
        />
        <Button
          label="Save"
          variant="contained"
          color="primary"
          onClick={onSave}
        />
      </div>
    );
  };

  const renderTitle = (editable: boolean) => {
    return editable ? (
      <Input
        width="248px"
        value={clickedEvent.cal_event_title || ''}
        onChange={onTitleChange}
        autofocus={true}
      />
    ) : (
      clickedEvent.cal_event_title || '—'
    );
  };

  const renderType = (editable: boolean) => {
    return editable ? (
      <Input
        width="248px"
        value={capitalize(clickedEvent.cal_event_type) || ''}
        disabled={true}
      />
    ) : (
      capitalize(clickedEvent.cal_event_type) || '—'
    );
  };

  const renderTag = (editable: boolean) => {
    return editable ? (
      <Input
        width="248px"
        value={clickedEvent.cal_event_tag || ''}
        onChange={onTagChange}
      />
    ) : (
      clickedEvent.cal_event_tag || '—'
    );
  };

  const renderDescription = (editable: boolean) => {
    return editable ? (
      <Input
        width="248px"
        value={clickedEvent.cal_event_desc || ''}
        onChange={onDescriptionChange}
      />
    ) : (
      clickedEvent.cal_event_desc || '—'
    );
  };

  const renderDate = (editable: boolean) => {
    switch (clickedEvent.cal_event_type) {
      case 'event':
        return editable ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DatePicker
              width="120px"
              label=""
              type="date"
              viewType="input"
              value={clickedEvent.cal_event_startdate}
              onChange={onDateFromChange}
            />
            <span>&ndash;</span>
            <DatePicker
              width="120px"
              label=""
              type="date"
              viewType="input"
              value={
                clickedEvent.cal_event_enddate ||
                clickedEvent.cal_event_startdate
              }
              onChange={onDateToChange}
            />
          </div>
        ) : (
          `${format(clickedEvent.cal_event_startdate, 'MM-dd-yyyy')} - ${format(
            clickedEvent.cal_event_enddate
              ? clickedEvent.cal_event_enddate
              : clickedEvent.cal_event_startdate,
            'MM-dd-yyyy'
          )}`
        );
      case 'reminder':
      case 'task':
        return editable ? (
          <DatePicker
            width="248px"
            label=""
            type="date-time"
            viewType="input"
            value={clickedEvent.cal_event_datetime}
            onChange={onEventDateTimeChange}
          />
        ) : (
          `${format(clickedEvent.cal_event_startdate, 'MM-dd-yyyy, h:mm a')}`
        );
    }
  };

  const deleteMessage = `You are about to delete this ${clickedEvent.cal_event_type} and this cannot be undone.
  Please, enter the word "${clickedEvent.cal_event_type}" to continue.`;

  return (
    <div className={styles.container}>
      <div className={styles.sectionTitle}>
        <div>{`${capitalize(clickedEvent.cal_event_type)} Details`}</div>{' '}
        {(clickedEvent.cal_event_type === 'task' ||
          clickedEvent.cal_event_type === 'reminder') &&
          renderCompleteBtn(clickedEvent.status_id)}
      </div>
      <div>
        <div
          className={!editable ? styles.sectionItem : styles.sectionItemEdit}
        >
          <span className={styles.title}>Title:</span> {renderTitle(editable)}
        </div>
        <div
          className={!editable ? styles.sectionItem : styles.sectionItemEdit}
        >
          <span className={styles.title}>Type:</span>
          {renderType(editable)}
        </div>
        <div
          className={!editable ? styles.sectionItem : styles.sectionItemEdit}
        >
          <span className={styles.title}>
            {clickedEvent.cal_event_type === 'event' ? 'Date:' : 'Due Date:'}
          </span>{' '}
          {renderDate(editable)}
        </div>
        <div
          className={!editable ? styles.sectionItem : styles.sectionItemEdit}
        >
          <span className={styles.title}>Tag:</span> {renderTag(editable)}
        </div>
        <div
          className={!editable ? styles.sectionItem : styles.sectionItemEdit}
        >
          <span className={styles.title}>Description:</span>{' '}
          {renderDescription(editable)}
        </div>
      </div>
      {renderButtons()}
      <DeletePopupConfrim
        type={''}
        message={deleteMessage}
        deleteTitle={clickedEvent.cal_event_type}
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        onDeleteClick={onDelete}
      />
      <PopupExposure
        isOpen={isModalConfirmOpen}
        onClose={onModalConfirmClose}
        onExitClick={onExit}
        onSaveClick={onSave}
      />
    </div>
  );
};

export default InfoModal;
