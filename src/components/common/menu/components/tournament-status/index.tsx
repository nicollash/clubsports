import React from 'react';
import { Button } from 'components/common';
import ListPublised from '../list-publised';
import { ButtonColors, ButtonVariant, EventStatuses } from 'common/enums';
import {
  BindingAction,
  IEventDetails,
  ISchedule,
  IFetchedBracket,
} from 'common/models';
import styles from './styles.module.scss';

interface Props {
  event: IEventDetails;
  schedules: ISchedule[];
  brackets: IFetchedBracket[];
  togglePublishPopup: BindingAction;
}

const TournamentStatus = ({
  event,
  schedules,
  brackets,
  togglePublishPopup,
}: Props) => {
  return (
    <div className={styles.progressBarWrapper}>
      <div className={styles.progressBarStatusWrapper}>
        <p className={styles.progressBarStatus}>
          <span>Status:</span> {EventStatuses[event.is_published_YN]}
        </p>
        <ListPublised event={event} schedules={schedules} brackets={brackets} />
      </div>
      <span className={styles.doneBtnWrapper}>
        <Button
          onClick={togglePublishPopup}
          label="Modify Published Status"
          color={ButtonColors.INHERIT}
          variant={ButtonVariant.CONTAINED}
        />
      </span>
    </div>
  );
};

export default TournamentStatus;
