/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { HeadingLevelTwo, Button } from 'components/common';
import styles from './styles.module.scss';
import Navigation from './navigation';
import Messaging from './messaging';
import ScheduleReview from './schedule-review';
import {
  getMessages,
  sendSavedMessages,
  deleteMessages,
} from './logic/actions';
import { BindingCbWithOne } from 'common/models';
import { IMessage } from 'common/models/event-link';
import { groupBy } from 'lodash';
import { orderBy } from 'lodash-es';
import { RouteComponentProps } from "react-router-dom";

interface MatchParams {
  eventId: string;
}
export interface IGroupedMessages {
  message_title: string;
  message_type: string;
  message_body: string;
  message_ids: string[];
  uniqueIds: (string | null)[];
  recipients: string[];
  sendDatetime: string;
  status: number;
  senderName: string;
}

interface IProps {
  getMessages: (eventId: string) => void;
  sendSavedMessages: BindingCbWithOne<IGroupedMessages>;
  deleteMessages: BindingCbWithOne<string[]>;
  messages: IMessage[];
  messagesAreLoading: boolean;
}

const EventLink = ({
  match,
  getMessages,
  messages,
  messagesAreLoading,
  sendSavedMessages,
  deleteMessages,
}: IProps & RouteComponentProps<MatchParams>) => {
  const eventId = match.params.eventId;
  useEffect(() => {
    getMessages(eventId);
  }, []);

  const [isSectionsExpand, toggleSectionCollapse] = useState<boolean>(true);

  const onToggleSectionCollapse = () => {
    toggleSectionCollapse(!isSectionsExpand);
  };

  const groupMessages = () => {
    const data = messages?.filter(message => message.message_id);
    const groupedMessages = groupBy(data, 'request_id');
    const res = Object.entries(groupedMessages).map(([_key, value]) => {
      return {
        message_title: value[0].message_title,
        message_type: value[0].message_type,
        message_body: value[0].message_body,
        message_ids: value.map(mes => mes.message_id),
        uniqueIds: value.map(mes => mes.sns_unique_id),
        recipients: value.map(mes => mes.recipient_details),
        sendDatetime: value[0].send_datetime,
        status: value[0].status,
        senderName: value[0].email_from_name,
      };
    });

    return orderBy(res, ['sendDatetime'], ['desc']);
  };

  return (
    <section className={styles.container}>
      <Navigation eventId={eventId} onAddToLibraryManager={() => {}} />
      <div className={styles.headingContainer}>
        <HeadingLevelTwo margin="24px 0">Event Link</HeadingLevelTwo>
        <Button
          onClick={onToggleSectionCollapse}
          variant="text"
          color="secondary"
          label={isSectionsExpand ? 'Collapse All' : 'Expand All'}
        />
      </div>
      <ul className={styles.libraryList}>
        <Messaging
          isSectionExpand={isSectionsExpand}
          data={groupMessages()}
          messagesAreLoading={messagesAreLoading}
          sendMessages={sendSavedMessages}
          deleteMessages={deleteMessages}
        />
        <ScheduleReview isSectionExpand={isSectionsExpand} />
      </ul>
    </section>
  );
};

const mapStateToProps = (state: {
  eventLink: { messages: IMessage[]; messagesAreLoading: boolean };
}) => {
  return {
    messages: state.eventLink.messages,
    messagesAreLoading: state.eventLink.messagesAreLoading,
  };
};

const mapDispatchToProps = {
  getMessages,
  sendSavedMessages,
  deleteMessages,
};

export default connect(mapStateToProps, mapDispatchToProps)(EventLink);
