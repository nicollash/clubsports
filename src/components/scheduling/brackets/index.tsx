import React from 'react';
import { orderBy } from 'lodash-es';
import {
  SectionDropdown,
  HeadingLevelThree,
  Button,
  CardMessage,
} from 'components/common';
import BracketsItem from '../brakets-item';
import { EventMenuTitles } from 'common/enums';
import { ISchedulingSchedule } from '../types';
import styles from '../styles.module.scss';
import { IMouseEvent } from 'common/types';
import { ISchedulingBracket } from 'common/models/playoffs/bracket';
import { CardMessageTypes } from 'components/common/card-message/types';

const CARD_MESSAGE_STYLES = {
  marginBottom: 30,
  width: '100%',
};

interface IProps {
  brackets: ISchedulingBracket[];
  schedules: ISchedulingSchedule[];
  eventId: string;
  isSectionExpand: boolean;
  bracketCreationAllowed: boolean;
  onCreateBracket: (evt: IMouseEvent) => void;
  onEditBracket: (bracketId: string) => void;
}

const Brackets = (props: IProps) => {
  const {
    schedules,
    brackets,
    eventId,
    isSectionExpand,
    bracketCreationAllowed,
    onCreateBracket,
    onEditBracket,
  } = props;

  const orderedBrackets = orderBy(
    brackets,
    ({ published, updateDate, createDate }) =>
      updateDate
        ? [published, updateDate, createDate]
        : [published, createDate],
    ['desc', 'desc', 'desc']
  );

  const scheduleForBracket = (scheduleId: string) =>
    schedules.find(v => v.schedule_id === scheduleId);

  return (
    <SectionDropdown
      type="section"
      isDefaultExpanded={true}
      useShadow={true}
      expanded={isSectionExpand}
      id={EventMenuTitles.BRACKETS}
    >
      <>
        <HeadingLevelThree>
          <span className={styles.blockHeading}>
            {EventMenuTitles.BRACKETS}
          </span>
        </HeadingLevelThree>
        <Button
          btnStyles={{ float: 'right' }}
          label="+ Create New Brackets Schedule"
          color="primary"
          variant="contained"
          onClick={onCreateBracket}
          disabled={!bracketCreationAllowed}
        />
      </>
      {orderedBrackets ? (
        <ul className={styles.bracketsList}>
          <CardMessage
            style={CARD_MESSAGE_STYLES}
            type={CardMessageTypes.EMODJI_OBJECTS}
          >
            Brackets are sorted first on Status then on Last Update Date
          </CardMessage>
          {orderedBrackets.map(item => (
            <BracketsItem
              schedule={scheduleForBracket(item.scheduleId)!}
              bracket={item}
              eventId={eventId}
              key={Math.random()}
              bracketPublished={false}
              savingInProgress={false}
              anotherBracketPublished={false}
              onUnpublish={() => {}}
              onPublish={() => {}}
              onEditBracket={onEditBracket}
            />
          ))}
        </ul>
      ) : (
        <CardMessage
          style={CARD_MESSAGE_STYLES}
          type={CardMessageTypes.EMODJI_OBJECTS}
        >
          Please create the first braket by clicking on the button to
          continue...
        </CardMessage>
      )}
    </SectionDropdown>
  );
};
export default Brackets;
