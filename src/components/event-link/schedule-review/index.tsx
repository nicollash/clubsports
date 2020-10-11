import React, { useState } from 'react';
import { SectionDropdown, Button } from 'components/common';
import { MenuTitles } from 'common/enums';
import styles from '../styles.module.scss';
import ScheduleItem from './schedule-item';

interface Props {
  isSectionExpand: boolean;
}
const ScheduleReview = ({ isSectionExpand }: Props) => {
  const [areMessagesExpand, toggleMessagesExpand] = useState<boolean>(true);

  const onToggleMessagesCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMessagesExpand(!areMessagesExpand);
  };
  return (
    <li>
      <SectionDropdown
        id={MenuTitles.SCHEDULE_REVIEW}
        type="section"
        panelDetailsType="flat"
        expanded={isSectionExpand}
      >
        <div className={styles.msHeadingContainer}>
          Schedule Review
          <Button
            onClick={onToggleMessagesCollapse}
            variant="text"
            color="secondary"
            label={areMessagesExpand ? 'Collapse All' : 'Expand All'}
          />
        </div>
        <div className={styles.msContainer}>
          <ul className={styles.msMessageList}>
            <ScheduleItem isSectionExpand={areMessagesExpand} />
            <ScheduleItem isSectionExpand={areMessagesExpand} />
          </ul>
        </div>
      </SectionDropdown>
    </li>
  );
};

export default ScheduleReview;
