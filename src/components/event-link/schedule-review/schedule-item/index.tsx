import React from 'react';
import { SectionDropdown, Button } from 'components/common';
import styles from '../../styles.module.scss';
import DeleteIcon from '@material-ui/icons/Delete';

interface Props {
  isSectionExpand: boolean;
}

const scheduleData = {
  title: "Men's Spring Thaw: Schedule Review",
  deliveryDate: '04/15/2020, 12:00PM',
  recipients: 14,
  requestResolved: '3/4',
};

const ScheduleItem = ({ isSectionExpand }: Props) => {
  return (
    <li>
      <SectionDropdown expanded={isSectionExpand}>
        <div className={styles.msTitleContainer}>
          <p className={styles.msTitle}>{scheduleData.title}</p>
          <p className={styles.msDeliveryDate}>
            Delivered {scheduleData.deliveryDate}
          </p>
        </div>
        <div className={styles.msContent}>
          <div>
            <div className={styles.msInfoWrapper}>
              <div className={styles.msInfoContent}>
                <p>
                  <span className={styles.msContentTitle}>Recipients:</span>{' '}
                  {scheduleData.recipients}
                </p>
                <p>
                  <span className={styles.msContentTitle}>
                    Requests Resolved:
                  </span>{' '}
                  {scheduleData.requestResolved}
                </p>
              </div>
              <div>
                <Button
                  label="Delete"
                  variant="text"
                  color="secondary"
                  type="dangerLink"
                  icon={<DeleteIcon style={{ fill: '#FF0F19' }} />}
                  onClick={() => {}}
                />
                <Button
                  label="Request Manager"
                  variant="text"
                  color="secondary"
                  onClick={() => {}}
                />
                <Button
                  label="View Schedule"
                  variant="text"
                  color="secondary"
                  onClick={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </SectionDropdown>
    </li>
  );
};

export default ScheduleItem;
