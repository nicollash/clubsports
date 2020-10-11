import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { HeadingLevelFour, Button, Paper, Tooltip } from 'components/common';
import { Routes, ScheduleStatuses } from 'common/enums';
import { ISchedulingSchedule } from '../types';
import styles from '../styles.module.scss';
import { ISchedulingBracket } from 'common/models/playoffs/bracket';
import { TooltipMessageTypes } from 'components/common/tooltip-message/types';
import { getTournamentStatusColor } from 'helpers';
import { faEdit, faCalendar } from '@fortawesome/free-regular-svg-icons';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const DEFAULT_UPDATED_VALUE = 'Not updated yet.';

interface Props {
  schedule: ISchedulingSchedule;
  eventId: string;
  bracket: ISchedulingBracket;
  bracketPublished: boolean;
  savingInProgress: boolean;
  anotherBracketPublished: boolean;
  onUnpublish: (bracketId: string) => void;
  onPublish: (bracketId: string) => void;
  onEditBracket: (bracketId: string) => void;
}

const BracketsItem = ({
  eventId,
  schedule,
  bracket,
  anotherBracketPublished,
  bracketPublished,
  savingInProgress,
  onUnpublish,
  onPublish,
  onEditBracket,
}: Props) => (
  <li className={styles.brackets}>
    <Paper padding={20}>
      <div className={styles.header}>
        <HeadingLevelFour>
          <span>{bracket.name}</span>
        </HeadingLevelFour>
        <Tooltip
          disabled={true}
          title="You need to unpublish before you can publish this bracket"
          type={TooltipMessageTypes.INFO}
        >
          <div
            style={{
              // display: 'inline',
              marginLeft: '15px',
              padding: '10px 0',
              display: 'none',
            }}
          >
            {bracketPublished ? (
              <Button
                label="Unpublish"
                variant="text"
                color="secondary"
                disabled={true || savingInProgress}
                onClick={() => onUnpublish(bracket.id)}
              />
            ) : (
              <Button
                label="Publish"
                variant="text"
                color="secondary"
                disabled={true || anotherBracketPublished || savingInProgress}
                onClick={() => onPublish(bracket.id)}
              />
            )}
          </div>
        </Tooltip>
      </div>
      <p className={styles.textWrapper}>
        <b>Status:</b> <span>{bracket.published ? 'Published' : 'Draft'}</span>
        <span
          className={styles.scheduleStatus}
          style={{
            ...getTournamentStatusColor(
              bracket.published
                ? ScheduleStatuses.Published
                : ScheduleStatuses.Draft
            ),
          }}
        />
      </p>
      <p className={styles.textWrapper}>
        <b>Schedule:</b> <span>{schedule?.schedule_name || ''}</span>
      </p>
      <p className={styles.textWrapper}>
        <b>Created by:</b>
        <span className={styles.textNameWrapper}>
          <span>{bracket.createdByName}</span>
          <span>{moment(bracket.createDate).format('LLL')}</span>
        </span>
      </p>
      <p className={styles.textWrapper}>
        <b>Last Updated By:</b>
        <span className={styles.textNameWrapper}>
          {bracket.updateDate ? (
            <>
              <span>{bracket.updatedByName}</span>
              <span>{moment(bracket.updateDate).format('LLL')}</span>
            </>
          ) : (
            DEFAULT_UPDATED_VALUE
          )}
        </span>
      </p>
      <div className={styles.btnsWrapper}>
        <Button
          icon={<FontAwesomeIcon icon={faEdit} />}
          label="Edit Bracket Details"
          color="secondary"
          variant="text"
          onClick={() => onEditBracket(bracket.id)}
        />
        <Link
          to={`${Routes.PLAYOFFS}/${eventId}/${schedule?.schedule_id}/${bracket.id}`}
        >
          <Button
            icon={<FontAwesomeIcon icon={faCalendar} />}
            label="Manage Bracket"
            color="secondary"
            variant="text"
          />
        </Link>
      </div>
      {false && (
        <div className={styles.tnThird}>
          <Tooltip
            type="warning"
            title="TRUE Florida (2020, 2021) cannot play 10:00 AM - 12:00 PM"
          >
            <div className={styles.errorMessage}>
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>Braclket Requires Revisions</span>
            </div>
          </Tooltip>
        </div>
      )}
    </Paper>
  </li>
);

export default BracketsItem;
